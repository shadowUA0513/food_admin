import {
  Alert,
  Button,
  ColorInput,
  FileInput,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  SegmentedControl,
  Stack,
  TagsInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  telegram_chat_id?: string;
  brand_color?: string;
  logo_url?: string;
  phone_numbers?: string;
  card_pans?: string;
  supported_order_types?: string;
  min_order_amount?: string;
  payment_accepting_style?: string;
  form?: string;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const EMPTY_FORM: UpdateCompanyPayload = {
  name: "",
  bot_token: "",
  bot_username: "",
  telegram_chat_id: null,
  phone_numbers: [],
  card_pans: [],
  brand_color: "#F08C00",
  logo_url: "",
  is_active: false,
  supported_order_types: [],
  min_order_amount: 50000,
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
        telegram_chat_id: company.telegram_chat_id,
        phone_numbers: company.phone_numbers ?? [],
        card_pans: company.card_pans ?? [],
        brand_color: company.brand_color,
        logo_url: company.logo_url,
        is_active: company.is_active,
        supported_order_types: company.supported_order_types ?? [],
        min_order_amount: company.min_order_amount ?? 50000,
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
    <Modal opened onClose={handleClose} title="Edit company" centered>
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
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
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
                telegram_chat_id: typeof value === "number" && Number.isFinite(value) ? value : null,
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
              isUploadingLogo ? "Uploading image..." : "Select an image file to upload."
            }
          />

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

          {errors.form ? (
            <Alert color="red" variant="light">
              {errors.form}
            </Alert>
          ) : null}

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
        </Stack>
      </form>
      )}
    </Modal>
  );
}
