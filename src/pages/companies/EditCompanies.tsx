import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCompanyById, useUpdateCompany } from "../../service/companies";
import type { Company, UpdateCompanyPayload } from "../../types/companies";
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

const EMPTY_FORM: UpdateCompanyPayload = {
  name: "",
  bot_token: "",
  bot_username: "",
  brand_color: "",
  logo_url: "",
  is_active: false,
};

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
  const company = locationCompany ?? fetchedCompany;
  const [form, setForm] = useState<UpdateCompanyPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!company) {
      return;
    }

    setForm({
      name: company.name,
      bot_token: company.bot_token,
      bot_username: company.bot_username,
      brand_color: company.brand_color,
      logo_url: company.logo_url,
      is_active: company.is_active,
    });
    setErrors({});
  }, [company]);

  const handleClose = () => {
    setErrors({});
    navigate("/companies");
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

    if (!form.brand_color?.trim()) {
      nextErrors.brand_color = "Brand color is required.";
    } else if (!HEX_COLOR_REGEX.test(form.brand_color)) {
      nextErrors.brand_color = "Use a valid hex color like #0088cc.";
    }

    if (!form.logo_url?.trim()) {
      nextErrors.logo_url = "Logo URL is required.";
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
          brand_color: form.brand_color?.trim(),
          logo_url: form.logo_url?.trim(),
          is_active: Boolean(form.is_active),
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

          <TextInput
            label="Brand color"
            placeholder="#0088cc"
            value={form.brand_color ?? ""}
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
            value={form.logo_url ?? ""}
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

          <div>
            <Text size="sm" fw={500} mb={8}>
              Status
            </Text>
            <SegmentedControl
              fullWidth
              radius="md"
              size="md"
              value={Boolean(form.is_active) ? "active" : "inactive"}
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
            <Button type="submit" loading={updateCompanyMutation.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
      )}
    </Modal>
  );
}
