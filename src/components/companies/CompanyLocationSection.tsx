import {
  Alert,
  Anchor,
  Box,
  Card,
  Group,
  Loader,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";

interface CompanyLocationSectionProps {
  address: string;
  latitude: number;
  longitude: number;
  minOrderDistance: number;
  errors: {
    address?: string;
    lat?: string;
    long?: string;
    min_order_distance?: string;
  };
  onAddressChange: (value: string) => void;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onMinOrderDistanceChange: (value: number) => void;
}

declare global {
  interface YandexMapGeoObjects {
    add: (geoObject: unknown) => void;
    removeAll: () => void;
  }

  interface YandexMapEvents {
    add: (eventName: string, handler: (event: unknown) => void) => void;
  }

  interface YandexMapInstance {
    destroy: () => void;
    geoObjects: YandexMapGeoObjects;
    events: YandexMapEvents;
    setCenter?: (center: number[], zoom?: number, options?: unknown) => void;
  }

  interface YandexPlacemarkInstance {
    events: {
      add: (eventName: string, handler: (event: unknown) => void) => void;
    };
  }

  interface YandexMapsApi {
    Map: new (
      element: HTMLElement,
      state: unknown,
      options?: unknown,
    ) => YandexMapInstance;
    Placemark: new (
      coords: number[],
      properties?: Record<string, unknown>,
      options?: Record<string, unknown>,
    ) => YandexPlacemarkInstance;
    ready: (callback: () => void) => void;
  }

  interface Window {
    ymaps?: YandexMapsApi;
  }
}

interface NominatimReverseResponse {
  display_name?: string;
}

const YANDEX_MAPS_SCRIPT_ID = "yandex-maps-api-script";
const YANDEX_MAPS_API_KEY = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

export const TASHKENT_CENTER = {
  latitude: 41.311139,
  longitude: 69.279593,
} as const;

function hasValidCoordinates(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

function loadYandexMapsScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.ymaps) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(
      YANDEX_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Yandex map.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    const query = YANDEX_MAPS_API_KEY ? `&apikey=${YANDEX_MAPS_API_KEY}` : "";
    script.id = YANDEX_MAPS_SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${query}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Yandex map."));
    document.head.appendChild(script);
  });
}

async function reverseGeocode(latitude: number, longitude: number) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  );

  if (!response.ok) {
    throw new Error("Failed to resolve address.");
  }

  const data = (await response.json()) as NominatimReverseResponse;
  return data.display_name?.trim() || "";
}

function getYandexMapsLink(latitude: number, longitude: number) {
  const formattedLongitude = longitude.toFixed(6);
  const formattedLatitude = latitude.toFixed(6);

  return `https://yandex.com/maps/?ll=${formattedLongitude}%2C${formattedLatitude}&pt=${formattedLongitude}%2C${formattedLatitude}&z=16`;
}

function InteractiveYandexMap({
  address,
  latitude,
  longitude,
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange,
}: {
  address: string;
  latitude: number;
  longitude: number;
  onAddressChange: (value: string) => void;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<YandexMapInstance | null>(null);
  const updatePlacemarkRef = useRef<
    ((nextLatitude: number, nextLongitude: number, label: string) => void) | null
  >(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    let cancelled = false;

    void loadYandexMapsScript()
      .then(() => {
        if (cancelled || !mapRef.current || !window.ymaps) {
          return;
        }

        window.ymaps.ready(() => {
          if (cancelled || !mapRef.current || !window.ymaps) {
            return;
          }

          mapInstanceRef.current?.destroy();

          const initialCenter = hasValidCoordinates(latitude, longitude)
            ? [latitude, longitude]
            : [TASHKENT_CENTER.latitude, TASHKENT_CENTER.longitude];

          const map = new window.ymaps.Map(
            mapRef.current,
            {
              center: initialCenter,
              zoom: 13,
              controls: ["zoomControl", "geolocationControl"],
            },
            {
              suppressMapOpenBlock: true,
            },
          );

          const updatePlacemark = (
            nextLatitude: number,
            nextLongitude: number,
            label: string,
          ) => {
            map.geoObjects.removeAll();
            const placemark = new window.ymaps!.Placemark(
              [nextLatitude, nextLongitude],
              {
                hintContent: label,
                balloonContent: label,
              },
              {
                preset: "islands#orangeDotIcon",
              },
            );

            map.geoObjects.add(placemark);
            map.setCenter?.([nextLatitude, nextLongitude], 15, {
              checkZoomRange: true,
              duration: 250,
            });
          };

          updatePlacemarkRef.current = updatePlacemark;

          if (address && hasValidCoordinates(latitude, longitude)) {
            updatePlacemark(latitude, longitude, address);
          }

          map.events.add("click", (event: unknown) => {
            const coords = (event as { get?: (name: string) => unknown })
              .get?.("coords") as number[] | undefined;

            if (!coords || coords.length < 2) {
              return;
            }

            const nextLatitude = Number(coords[0].toFixed(6));
            const nextLongitude = Number(coords[1].toFixed(6));

            onLatitudeChange(nextLatitude);
            onLongitudeChange(nextLongitude);
            setIsResolvingAddress(true);
            setMapError(null);

            void reverseGeocode(nextLatitude, nextLongitude)
              .then((resolvedAddress) => {
                if (!resolvedAddress) {
                  setMapError("Address not found for the selected point.");
                  return;
                }

                updatePlacemark(nextLatitude, nextLongitude, resolvedAddress);
                onAddressChange(resolvedAddress);
                setMapError(null);
              })
              .catch(() => {
                setMapError("Failed to resolve the selected address.");
              })
              .finally(() => {
                setIsResolvingAddress(false);
              });
          });

          mapInstanceRef.current = map;
          setMapError(null);
          setIsLoadingMap(false);
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMapError(
            error instanceof Error ? error.message : "Failed to load Yandex map.",
          );
          setIsLoadingMap(false);
        }
      });

    return () => {
      cancelled = true;
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
      updatePlacemarkRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !updatePlacemarkRef.current ||
      !address ||
      !hasValidCoordinates(latitude, longitude)
    ) {
      return;
    }

    updatePlacemarkRef.current(latitude, longitude, address);
  }, [address, latitude, longitude]);

  return (
    <Stack gap="sm">
      <Box
        ref={mapRef}
        style={{
          minHeight: 320,
          width: "100%",
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid var(--mantine-color-gray-3)",
          position: "relative",
        }}
      >
        {isLoadingMap ? (
          <Group
            justify="center"
            style={{
              inset: 0,
              position: "absolute",
              background: "rgba(255,255,255,0.82)",
              zIndex: 2,
            }}
          >
            <Loader size="sm" />
          </Group>
        ) : null}
      </Box>

      <Card withBorder radius="md" p="md">
        <Text size="sm" fw={700}>
          Selected address
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          {isResolvingAddress
            ? "Resolving address..."
            : address || "Click on the map to choose an address"}
        </Text>
        {mapError ? (
          <Alert color="red" variant="light" mt="sm">
            {mapError}
          </Alert>
        ) : null}
      </Card>
    </Stack>
  );
}

export function CompanyLocationSection({
  address,
  latitude,
  longitude,
  minOrderDistance,
  errors,
  onAddressChange,
  onLatitudeChange,
  onLongitudeChange,
  onMinOrderDistanceChange,
}: CompanyLocationSectionProps) {
  const hasCoordinates = hasValidCoordinates(latitude, longitude);
  const previewLatitude = hasCoordinates ? latitude : TASHKENT_CENTER.latitude;
  const previewLongitude = hasCoordinates
    ? longitude
    : TASHKENT_CENTER.longitude;
  const yandexMapsLink = getYandexMapsLink(previewLatitude, previewLongitude);

  return (
    <Stack gap="md">
      <Textarea
        label="Address"
        placeholder="Enter company address"
        value={address}
        onChange={(event) => {
          onAddressChange(event.currentTarget.value);
        }}
        error={errors.address}
        minRows={2}
        autosize
      />

      <NumberInput
        label="Latitude"
        value={latitude}
        onChange={(value) => {
          onLatitudeChange(typeof value === "number" ? value : 0);
        }}
        error={errors.lat}
        decimalScale={6}
        allowDecimal
        allowNegative
        hideControls
      />

      <NumberInput
        label="Longitude"
        value={longitude}
        onChange={(value) => {
          onLongitudeChange(typeof value === "number" ? value : 0);
        }}
        error={errors.long}
        decimalScale={6}
        allowDecimal
        allowNegative
        hideControls
      />

      <NumberInput
        label="Minimum order distance"
        value={minOrderDistance}
        onChange={(value) => {
          onMinOrderDistanceChange(typeof value === "number" ? value : 0);
        }}
        error={errors.min_order_distance}
        min={0}
      />

      <Paper withBorder radius="lg" p="sm">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Yandex map
          </Text>

          <InteractiveYandexMap
            address={address}
            latitude={previewLatitude}
            longitude={previewLongitude}
            onAddressChange={onAddressChange}
            onLatitudeChange={onLatitudeChange}
            onLongitudeChange={onLongitudeChange}
          />

          <Anchor href={yandexMapsLink} target="_blank" rel="noreferrer">
            Open in Yandex Maps
          </Anchor>

          {!hasCoordinates ? (
            <Text size="sm" c="dimmed">
              Showing Amir Temur Square in Tashkent by default until company
              coordinates are selected.
            </Text>
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
}
