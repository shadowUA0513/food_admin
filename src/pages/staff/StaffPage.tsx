import {
  Alert,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createStaffUser,
  getStaffUsers,
  type CreateStaffPayload,
  type StaffRole,
  type StaffUser,
} from "../../service/staff";

interface FormErrors {
  full_name?: string;
  phone_number?: string;
  password?: string;
  role?: string;
  form?: string;
}

const MIN_PASSWORD_LENGTH = 6;

function sanitizePhone(value: string) {
  const trimmed = value.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "");

  return `${hasPlus ? "+" : ""}${digits}`;
}

export default function StaffPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<CreateStaffPayload>({
    full_name: "",
    phone_number: "",
    password: "",
    role: "admin",
  });

  const { data, isLoading, error } = useQuery<StaffUser[], Error>({
    queryKey: ["staff-users"],
    queryFn: getStaffUsers,
  });

  console.log(data);

  const createStaffMutation = useMutation({
    mutationFn: createStaffUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["staff-users"] });
      resetForm();
      close();
    },
  });

  const resetForm = () => {
    setForm({
      full_name: "",
      phone_number: "",
      password: "",
      role: "admin",
    });
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const phoneDigits = form.phone_number.replace(/\D/g, "");

    if (!form.full_name.trim()) {
      nextErrors.full_name = t("staffPage.fullNameRequired");
    }

    if (!form.phone_number.trim()) {
      nextErrors.phone_number = t("staffPage.phoneRequired");
    } else if (!/^\+?\d+$/.test(form.phone_number) || phoneDigits.length < 9) {
      nextErrors.phone_number = t("staffPage.phoneInvalid");
    }

    if (!form.password.trim()) {
      nextErrors.password = t("staffPage.passwordRequired");
    } else if (form.password.trim().length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = t("staffPage.passwordTooShort");
    }

    if (!form.role) {
      nextErrors.role = t("staffPage.roleRequired");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createStaffMutation.mutateAsync(form);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        form:
          error instanceof Error ? error.message : t("staffPage.createError"),
      }));
    }
  };

  return (
    <Stack gap="lg">
      <Modal
        opened={opened}
        onClose={() => {
          close();
          resetForm();
        }}
        title={t("staffPage.createModalTitle")}
        centered
      >
        <form onSubmit={handleCreate}>
          <Stack gap="md">
            <TextInput
              label={t("staffPage.fullNameLabel")}
              placeholder="John Doe"
              value={form.full_name}
              onChange={(event) => {
                const value = event.currentTarget.value;

                setForm((current) => ({
                  ...current,
                  full_name: value,
                }));
                setErrors((current) => ({
                  ...current,
                  full_name: undefined,
                  form: undefined,
                }));
              }}
              error={errors.full_name}
              required
            />

            <TextInput
              label={t("staffPage.phoneLabel")}
              placeholder="+998907171717"
              value={form.phone_number}
              onChange={(event) => {
                const value = sanitizePhone(event.currentTarget.value);

                setForm((current) => ({
                  ...current,
                  phone_number: value,
                }));
                setErrors((current) => ({
                  ...current,
                  phone_number: undefined,
                  form: undefined,
                }));
              }}
              error={errors.phone_number}
              required
            />

            <PasswordInput
              label={t("staffPage.passwordLabel")}
              placeholder="Test@123"
              value={form.password}
              onChange={(event) => {
                const value = event.currentTarget.value;

                setForm((current) => ({
                  ...current,
                  password: value,
                }));
                setErrors((current) => ({
                  ...current,
                  password: undefined,
                  form: undefined,
                }));
              }}
              error={errors.password}
              required
            />

            <Select
              label={t("staffPage.roleLabel")}
              value={form.role}
              onChange={(value) => {
                if (value === "admin" || value === "super_admin") {
                  setForm((current) => ({
                    ...current,
                    role: value as StaffRole,
                  }));
                }
                setErrors((current) => ({
                  ...current,
                  role: undefined,
                  form: undefined,
                }));
              }}
              data={[
                { value: "admin", label: t("staffPage.adminRole") },
                { value: "super_admin", label: t("staffPage.superAdminRole") },
              ]}
              error={errors.role}
              allowDeselect={false}
              required
            />

            {errors.form ? (
              <Alert color="red" variant="light">
                {errors.form}
              </Alert>
            ) : null}

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  close();
                  resetForm();
                }}
              >
                {t("staffPage.cancel")}
              </Button>
              <Button type="submit" loading={createStaffMutation.isPending}>
                {t("staffPage.createButton")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{t("staffPage.title")}</Title>
          <Text c="dimmed">{t("staffPage.subtitle")}</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} radius="md" onClick={open}>
          {t("staffPage.createButton")}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.totalStaff")}
          </Text>
          <Title order={3} mt={8}>
            {data?.length ?? 0}
          </Title>
        </Card>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.adminCount")}
          </Text>
          <Title order={3} mt={8}>
            {data?.filter((member) => member.role === "admin").length ?? 0}
          </Title>
        </Card>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.superAdminCount")}
          </Text>
          <Title order={3} mt={8}>
            {data?.filter((member) => member.role === "super_admin").length ??
              0}
          </Title>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="xl" p="lg">
        {error ? (
          <Stack align="center" py="xl" gap="sm">
            <Alert color="red" variant="light" w="100%">
              {error.message || t("staffPage.loadError")}
            </Alert>
            <Button
              variant="light"
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: ["staff-users"],
                });
              }}
            >
              {t("staffPage.retry")}
            </Button>
          </Stack>
        ) : isLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader />
              <Text c="dimmed">{t("staffPage.loading")}</Text>
            </Stack>
          </Center>
        ) : !data?.length ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Title order={4}>{t("staffPage.emptyTitle")}</Title>
              <Text c="dimmed" ta="center">
                {t("staffPage.emptyDescription")}
              </Text>
              <Button variant="light" onClick={open}>
                {t("staffPage.createButton")}
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t("staffPage.employee")}</Table.Th>
                <Table.Th>{t("staffPage.phoneColumn")}</Table.Th>
                <Table.Th>{t("staffPage.role")}</Table.Th>
                <Table.Th>{t("staffPage.createdAt")}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>
                    <Text fw={600}>{member.full_name}</Text>
                  </Table.Td>
                  <Table.Td>{member.phone_number}</Table.Td>
                  <Table.Td>
                    {member.role === "super_admin"
                      ? t("staffPage.superAdminRole")
                      : t("staffPage.adminRole")}
                  </Table.Td>
                  <Table.Td>
                    {new Date(member.created_at).toLocaleDateString()}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}
