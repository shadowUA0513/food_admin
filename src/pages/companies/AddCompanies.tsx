import {
  Alert,
  Button,
  ColorInput,
  FileInput,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Stack,
  TextInput,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCompany } from "../../service/companies";
import { uploadImage } from "../../service/images";
import type { CreateCompanyPayload } from "../../types/companies";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/notifications";

interface FormErrors {
  name?: string;
  bot_token?: string;
  bot_username?: string;
  brand_color?: string;
  logo_url?: string;
  supported_order_types?: string;
  min_order_amount?: string;
  form?: string;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const EMPTY_FORM: CreateCompanyPayload = {
  name: "",
  bot_token: "",
  bot_username: "",
  brand_color: "#F08C00",
  logo_url: "",
  supported_order_types: [],
  min_order_amount: 50000,
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

export default function AddCompanies() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createCompanyMutation = useCreateCompany();
  const [form, setForm] = useState<CreateCompanyPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
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

    if (!form.name.trim()) {
      nextErrors.name = "Company name is required.";
    }

    if (!form.bot_token.trim()) {
      nextErrors.bot_token = "Bot token is required.";
    }

    if (!form.bot_username.trim()) {
      nextErrors.bot_username = "Bot username is required.";
    }

    if (!form.brand_color.trim()) {
      nextErrors.brand_color = "Brand color is required.";
    } else if (!HEX_COLOR_REGEX.test(form.brand_color)) {
      nextErrors.brand_color = "Use a valid hex color like #0088cc.";
    }

    if (!form.logo_url.trim()) {
      nextErrors.logo_url = "Logo URL is required.";
    }

    if (form.supported_order_types.length === 0) {
      nextErrors.supported_order_types = "Select at least one order type.";
    }

    if (!Number.isFinite(form.min_order_amount) || form.min_order_amount < 0) {
      nextErrors.min_order_amount = "Minimum order amount must be 0 or more.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createCompanyMutation.mutateAsync({
        name: form.name.trim(),
        bot_token: form.bot_token.trim(),
        bot_username: form.bot_username.trim(),
        brand_color: form.brand_color.trim(),
        logo_url: form.logo_url.trim(),
        supported_order_types: form.supported_order_types,
        min_order_amount: Number(form.min_order_amount),
      });
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      showSuccessNotification({
        message: "Company created successfully.",
      });
      handleClose();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Failed to create company.";

      showErrorNotification({ message });
      setErrors((current) => ({
        ...current,
        form: message,
      }));
    }
  };

  return (
    <Modal opened onClose={handleClose} title="Add company" centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Company name"
            value={form.name}
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
            value={form.bot_username}
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
            value={form.bot_token}
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

          <ColorInput
            label="Brand color"
            placeholder="#F08C00"
            value={form.brand_color}
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

          <MultiSelect
            label="Supported order types"
            placeholder="Select order types"
            data={ORDER_TYPE_OPTIONS}
            value={form.supported_order_types}
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

          <NumberInput
            label="Minimum order amount"
            value={form.min_order_amount}
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
              loading={createCompanyMutation.isPending || isUploadingLogo}
              disabled={isUploadingLogo}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
