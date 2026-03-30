import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCompany } from "../../service/companies";
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
  form?: string;
}

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const EMPTY_FORM: CreateCompanyPayload = {
  name: "",
  bot_token: "",
  bot_username: "",
  brand_color: "",
  logo_url: "",
};

export default function AddCompanies() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createCompanyMutation = useCreateCompany();
  const [form, setForm] = useState<CreateCompanyPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    navigate("/companies");
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

          <TextInput
            label="Brand color"
            placeholder="#0088cc"
            value={form.brand_color}
            onChange={(event) => {
              const value = event.currentTarget.value;

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
            error={errors.brand_color}
            required
          />

          <TextInput
            label="Logo URL"
            value={form.logo_url}
            onChange={(event) => {
              const value = event.currentTarget.value;

              setForm((current) => ({
                ...current,
                logo_url: value,
              }));
              setErrors((current) => ({
                ...current,
                logo_url: undefined,
                form: undefined,
              }));
            }}
            error={errors.logo_url}
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
            <Button type="submit" loading={createCompanyMutation.isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
