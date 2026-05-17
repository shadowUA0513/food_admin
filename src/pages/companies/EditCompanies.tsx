import {
  Alert,
  Box,
  Button,
  ColorInput,
  FileInput,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SegmentedControl,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  startTransition,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CompanyLocationSection,
  TASHKENT_CENTER,
} from "../../components/companies/CompanyLocationSection";
import { useCompanyById, useUpdateCompany } from "../../service/companies";
import { uploadImage } from "../../service/images";
import {
  PAYMENT_ACCEPTING_STYLE_OPTIONS,
  type Company,
  type PaymentAcceptingStyle,
  type UpdateCompanyPayload,
} from "../../types/companies";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/notifications";

interface FormErrors {
  name?: string;
  bot_token?: string;
  bot_username?: string;
  address?: string;
  lat?: string;
  long?: string;
  min_order_distance?: string;
  telegram_chat_id?: string;
  brand_color?: string;
  logo_url?: string;
  phone_numbers?: string;
  card_pans?: string;
  supported_order_types?: string;
  min_order_amount?: string;
  delivery_fee?: string;
  delivery_estimated_time?: string;
  free_delivery_threshold?: string;
  payment_accepting_style?: string;
  form?: string;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const EMPTY_FORM: UpdateCompanyPayload = {
  name: "",
  bot_token: "",
  bot_username: "",
  address: "",
  lat: TASHKENT_CENTER.latitude,
  long: TASHKENT_CENTER.longitude,
  min_order_distance: 0,
  telegram_chat_id: null,
  phone_numbers: [],
  card_pans: [],
  brand_color: "#F08C00",
  logo_url: "",
  is_active: false,
  supported_order_types: [],
  min_order_amount: 50000,
  delivery_fee: 20000,
  delivery_estimated_time: 120,
  free_delivery_threshold: 200000,
  payment_accepting_style: "non-o",
};

const BRAND_COLOR_SWATCHES = [
  "#F08C00",
  "#E03131",
  "#2F9E44",
  "#1C7ED6",
  "#6741D9",
  "#0C8599",
  "#5C940D",
  "#C2255C",
];

const ORDER_TYPE_OPTIONS = [
  { value: "delivery-anywhere", label: "Delivery anywhere" },
  { value: "delivery-to-organization", label: "Delivery to organization" },
];

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Paper withBorder radius="lg" p="lg">
      <Stack gap="md">
        <div>
          <Title order={5}>{title}</Title>
          {description ? (
            <Text c="dimmed" size="sm" mt={4}>
              {description}
            </Text>
          ) : null}
        </div>
        {children}
      </Stack>
    </Paper>
  );
}

export default function EditCompanies() {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyId } = useParams();
  const queryClient = useQueryClient();
  const updateCompanyMutation = useUpdateCompany();
  const locationCompany =
    (location.state as { company?: Company } | null)?.company;
  const {
    data: fetchedCompany,
    isLoading,
    error,
  } = useCompanyById(companyId);
  const company = fetchedCompany ?? locationCompany;
  const [form, setForm] = useState<UpdateCompanyPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (!company) {
      return;
    }

    startTransition(() => {
      setForm({
        name: company.name,
        bot_token: company.bot_token,
        bot_username: company.bot_username,
        address: company.address ?? "",
        lat: company.lat ?? 0,
        long: company.long ?? 0,
        min_order_distance: company.min_order_distance ?? 0,
        telegram_chat_id: company.telegram_chat_id,
        phone_numbers: company.phone_numbers ?? [],
        card_pans: company.card_pans ?? [],
        brand_color: company.brand_color,
        logo_url: company.logo_url,
        is_active: company.is_active,
        supported_order_types: company.supported_order_types ?? [],
        min_order_amount: company.min_order_amount ?? 50000,
        delivery_fee: company.delivery_fee ?? 20000,
        delivery_estimated_time: company.delivery_estimated_time ?? 120,
        free_delivery_threshold: company.free_delivery_threshold ?? 200000,
        payment_accepting_style: company.payment_accepting_style ?? "non-o",
      });
      setErrors({});
    });
  }, [company]);

  const handleClose = () => {
    setErrors({});
    navigate("/companies");
  };

  const handleLogoFileChange = async (file: File | null) => {
    if (!file) {
      setForm((current) => ({
        ...current,
        logo_url: "",
      }));
      setErrors((current) => ({
        ...current,
        logo_url: undefined,
        form: undefined,
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        logo_url: "Please choose an image file.",
        form: undefined,
      }));
      return;
    }

    try {
      setIsUploadingLogo(true);
      const imageUrl = await uploadImage(file);

      setForm((current) => ({
        ...current,
        logo_url: imageUrl,
      }));
      setErrors((current) => ({
        ...current,
        logo_url: undefined,
        form: undefined,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload the selected image.";

      setErrors((current) => ({
        ...current,
        logo_url: message,
        form: undefined,
      }));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.name?.trim()) {
      nextErrors.name = "Company name is required.";
    }

    if (!form.bot_token?.trim()) {
      nextErrors.bot_token = "Bot token is required.";
    }

    if (!form.bot_username?.trim()) {
      nextErrors.bot_username = "Bot username is required.";
    }

    if (!Number.isFinite(form.lat) || Number(form.lat) < -90 || Number(form.lat) > 90) {
      nextErrors.lat = "Latitude must be between -90 and 90.";
    }

    if (
      !Number.isFinite(form.long) ||
      Number(form.long) < -180 ||
      Number(form.long) > 180
    ) {
      nextErrors.long = "Longitude must be between -180 and 180.";
    }

    if (
      !Number.isFinite(form.min_order_distance) ||
      Number(form.min_order_distance) < 0
    ) {
      nextErrors.min_order_distance =
        "Minimum order distance must be 0 or more.";
    }

    if (
      form.telegram_chat_id !== null &&
      (!Number.isInteger(form.telegram_chat_id) || !Number.isFinite(form.telegram_chat_id))
    ) {
      nextErrors.telegram_chat_id = "Telegram chat ID must be a whole number.";
    }

    if (!form.brand_color?.trim()) {
      nextErrors.brand_color = "Brand color is required.";
    } else if (!HEX_COLOR_REGEX.test(form.brand_color)) {
      nextErrors.brand_color = "Use a valid hex color like #0088cc.";
    }

    if (!form.logo_url?.trim()) {
      nextErrors.logo_url = "Logo URL is required.";
    }

    if (!form.supported_order_types?.length) {
      nextErrors.supported_order_types = "Select at least one order type.";
    }

    if (
      !Number.isFinite(form.min_order_amount) ||
      Number(form.min_order_amount) < 0
    ) {
      nextErrors.min_order_amount = "Minimum order amount must be 0 or more.";
    }

    if (!Number.isFinite(form.delivery_fee) || Number(form.delivery_fee) < 0) {
      nextErrors.delivery_fee = "Delivery fee must be 0 or more.";
    }

    if (
      !Number.isFinite(form.delivery_estimated_time) ||
      Number(form.delivery_estimated_time) < 0
    ) {
      nextErrors.delivery_estimated_time =
        "Delivery estimated time must be 0 or more.";
    }

    if (
      !Number.isFinite(form.free_delivery_threshold) ||
      Number(form.free_delivery_threshold) < 0
    ) {
      nextErrors.free_delivery_threshold =
        "Free delivery threshold must be 0 or more.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!companyId || !validateForm()) {
      return;
    }

    try {
      await updateCompanyMutation.mutateAsync({
        id: companyId,
        payload: {
          name: form.name?.trim(),
          bot_token: form.bot_token?.trim(),
          bot_username: form.bot_username?.trim(),
          address: form.address?.trim() ?? "",
          lat: Number(form.lat),
          long: Number(form.long),
          min_order_distance: Number(form.min_order_distance),
          telegram_chat_id: form.telegram_chat_id ?? null,
          phone_numbers: (form.phone_numbers ?? [])
            .map((phoneNumber) => phoneNumber.trim())
            .filter(Boolean),
          card_pans: (form.card_pans ?? [])
            .map((cardPan) => cardPan.trim())
            .filter(Boolean),
          brand_color: form.brand_color?.trim(),
          logo_url: form.logo_url?.trim(),
          is_active: Boolean(form.is_active),
          supported_order_types: form.supported_order_types ?? [],
          min_order_amount: Number(form.min_order_amount),
          delivery_fee: Number(form.delivery_fee),
          delivery_estimated_time: Number(form.delivery_estimated_time),
          free_delivery_threshold: Number(form.free_delivery_threshold),
          payment_accepting_style: form.payment_accepting_style ?? "non-o",
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["company", companyId] });
      showSuccessNotification({
        message: "Company updated successfully.",
      });
      handleClose();
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update company.";

      setErrors((current) => ({
        ...current,
        form: message,
      }));
      showErrorNotification({ message });
    }
  };

  return (
    <Modal opened onClose={handleClose} title="Edit company" fullScreen>
      {error ? (
        <Stack gap="md">
          <Alert color="red" variant="light">
            {error.message || "Failed to load the company."}
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : isLoading && !company ? (
        <Stack align="center" gap="sm" py="md">
          <Loader />
          <Text c="dimmed">Loading company...</Text>
        </Stack>
      ) : (
        <Box mih="100%">
          <form onSubmit={handleSubmit}>
            <Stack gap="lg" maw={1080} mx="auto">
              <Paper withBorder radius="lg" p="lg">
                <Title order={3}>Edit company</Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Update company details and save changes.
                </Text>
              </Paper>

              {errors.form ? (
                <Alert color="red" variant="light">
                  {errors.form}
                </Alert>
              ) : null}

              <SectionCard
                title="Basic information"
                description="Core company details, brand settings, and status."
              >
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <TextInput
                    label="Company name"
                    value={form.name ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value;

                      setForm((current) => ({
                        ...current,
                        name: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        name: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.name}
                    required
                  />

                  <TextInput
                    label="Bot username"
                    value={form.bot_username ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value;

                      setForm((current) => ({
                        ...current,
                        bot_username: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        bot_username: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.bot_username}
                    required
                  />

                  <TextInput
                    label="Bot token"
                    value={form.bot_token ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value;

                      setForm((current) => ({
                        ...current,
                        bot_token: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        bot_token: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.bot_token}
                    required
                  />

                  <NumberInput
                    label="Telegram chat ID"
                    value={form.telegram_chat_id ?? ""}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        telegram_chat_id:
                          typeof value === "number" && Number.isFinite(value)
                            ? value
                            : null,
                      }));
                      setErrors((current) => ({
                        ...current,
                        telegram_chat_id: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.telegram_chat_id}
                    placeholder="Optional chat ID"
                    allowDecimal={false}
                    allowNegative={true}
                    hideControls
                  />

                  <ColorInput
                    label="Brand color"
                    placeholder="#F08C00"
                    value={form.brand_color ?? ""}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        brand_color: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        brand_color: undefined,
                        form: undefined,
                      }));
                    }}
                    swatches={BRAND_COLOR_SWATCHES}
                    withPicker
                    format="hex"
                    error={errors.brand_color}
                    required
                  />

                  <FileInput
                    label="Logo image"
                    placeholder="Choose an image"
                    accept="image/*"
                    clearable
                    onChange={handleLogoFileChange}
                    error={errors.logo_url}
                    description={
                      isUploadingLogo
                        ? "Uploading image..."
                        : "Select an image file to upload."
                    }
                  />
                </SimpleGrid>

                <div>
                  <Text size="sm" fw={500} mb={8}>
                    Status
                  </Text>
                  <SegmentedControl
                    fullWidth
                    radius="md"
                    size="md"
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        is_active: value === "active",
                      }));
                      setErrors((current) => ({
                        ...current,
                        form: undefined,
                      }));
                    }}
                    data={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Location"
                description="Pick the company spot on the map to fill address and coordinates."
              >
                <CompanyLocationSection
                  address={form.address ?? ""}
                  latitude={form.lat ?? 0}
                  longitude={form.long ?? 0}
                  minOrderDistance={form.min_order_distance ?? 0}
                  errors={errors}
                  onAddressChange={(value) => {
                    setForm((current) => ({
                      ...current,
                      address: value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      address: undefined,
                      form: undefined,
                    }));
                  }}
                  onLatitudeChange={(value) => {
                    setForm((current) => ({
                      ...current,
                      lat: value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      lat: undefined,
                      form: undefined,
                    }));
                  }}
                  onLongitudeChange={(value) => {
                    setForm((current) => ({
                      ...current,
                      long: value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      long: undefined,
                      form: undefined,
                    }));
                  }}
                  onMinOrderDistanceChange={(value) => {
                    setForm((current) => ({
                      ...current,
                      min_order_distance: value,
                    }));
                    setErrors((current) => ({
                      ...current,
                      min_order_distance: undefined,
                      form: undefined,
                    }));
                  }}
                />
              </SectionCard>

              <SectionCard
                title="Contacts and payments"
                description="Numbers customers use to contact or pay the company."
              >
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <TagsInput
                    label="Phone numbers"
                    placeholder="Add phone numbers"
                    value={form.phone_numbers ?? []}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        phone_numbers: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        phone_numbers: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.phone_numbers}
                    clearable
                  />

                  <TagsInput
                    label="Card PANs"
                    placeholder="Add card numbers"
                    value={form.card_pans ?? []}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        card_pans: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        card_pans: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.card_pans}
                    clearable
                  />
                </SimpleGrid>
              </SectionCard>

              <SectionCard
                title="Order settings"
                description="Define order types, payment style, and delivery pricing."
              >
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                  <MultiSelect
                    label="Supported order types"
                    placeholder="Select order types"
                    data={ORDER_TYPE_OPTIONS}
                    value={form.supported_order_types ?? []}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        supported_order_types: value,
                      }));
                      setErrors((current) => ({
                        ...current,
                        supported_order_types: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.supported_order_types}
                    required
                  />

                  <Select
                    label="Payment accepting style"
                    placeholder="Select payment accepting style"
                    data={PAYMENT_ACCEPTING_STYLE_OPTIONS}
                    value={form.payment_accepting_style ?? "non-o"}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        payment_accepting_style: (value ?? "non-o") as PaymentAcceptingStyle,
                      }));
                      setErrors((current) => ({
                        ...current,
                        payment_accepting_style: undefined,
                        form: undefined,
                      }));
                    }}
                    error={errors.payment_accepting_style}
                    allowDeselect={false}
                    required
                  />

                  <NumberInput
                    label="Minimum order amount"
                    value={form.min_order_amount ?? 0}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        min_order_amount: typeof value === "number" ? value : 0,
                      }));
                      setErrors((current) => ({
                        ...current,
                        min_order_amount: undefined,
                        form: undefined,
                      }));
                    }}
                    min={0}
                    thousandSeparator=","
                    error={errors.min_order_amount}
                    required
                  />

                  <NumberInput
                    label="Delivery fee"
                    value={form.delivery_fee ?? 0}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        delivery_fee: typeof value === "number" ? value : 0,
                      }));
                      setErrors((current) => ({
                        ...current,
                        delivery_fee: undefined,
                        form: undefined,
                      }));
                    }}
                    min={0}
                    thousandSeparator=","
                    error={errors.delivery_fee}
                    required
                  />

                  <NumberInput
                    label="Delivery estimated time"
                    value={form.delivery_estimated_time ?? 0}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        delivery_estimated_time: typeof value === "number" ? value : 0,
                      }));
                      setErrors((current) => ({
                        ...current,
                        delivery_estimated_time: undefined,
                        form: undefined,
                      }));
                    }}
                    min={0}
                    error={errors.delivery_estimated_time}
                    required
                  />

                  <NumberInput
                    label="Free delivery threshold"
                    value={form.free_delivery_threshold ?? 0}
                    onChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        free_delivery_threshold: typeof value === "number" ? value : 0,
                      }));
                      setErrors((current) => ({
                        ...current,
                        free_delivery_threshold: undefined,
                        form: undefined,
                      }));
                    }}
                    min={0}
                    thousandSeparator=","
                    error={errors.free_delivery_threshold}
                    required
                  />
                </SimpleGrid>
              </SectionCard>

              <Paper withBorder radius="lg" p="md">
                <Group justify="flex-end">
                  <Button variant="default" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={updateCompanyMutation.isPending || isUploadingLogo}
                    disabled={isUploadingLogo}
                  >
                    Save
                  </Button>
                </Group>
              </Paper>
            </Stack>
          </form>
        </Box>
      )}
    </Modal>
  );
}
