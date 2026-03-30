import {
  ActionIcon,
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
import { useQueryClient } from "@tanstack/react-query";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateStaffUser,
  useDeleteStaffUser,
  useStaffUsers,
} from "../../service/staff";
import type {
  CreateStaffPayload,
  StaffRole,
  StaffUser,
} from "../../types/staff";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/notifications";
import { PhoneNumberInput } from "../../components/common/PhoneNumberInput";
import {
  hasCompleteUzbekistanPhone,
  UZBEKISTAN_PHONE_PREFIX,
} from "../../utils/phone";

interface FormErrors {
  full_name?: string;
  phone_number?: string;
  password?: string;
  role?: string;
  form?: string;
}

const MIN_PASSWORD_LENGTH = 6;

export default function StaffPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [form, setForm] = useState<CreateStaffPayload>({
    full_name: "",
    phone_number: UZBEKISTAN_PHONE_PREFIX,
    password: "",
    role: "admin",
  });

  const { data, isLoading, error } = useStaffUsers();

  const createStaffMutation = useCreateStaffUser();
  const deleteStaffMutation = useDeleteStaffUser();

  const handleCreateSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    showSuccessNotification({
      message: "Staff member created successfully.",
    });
    resetForm();
    close();
  };

  const handleDeleteSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    showSuccessNotification({
      message: "Staff member deleted successfully.",
    });
  };

  const resetForm = () => {
    setForm({
      full_name: "",
      phone_number: UZBEKISTAN_PHONE_PREFIX,
      password: "",
      role: "admin",
    });
    setErrors({});
  };

  const createStaff = async (payload: CreateStaffPayload) => {
    await createStaffMutation.mutateAsync(payload, {
      onSuccess: handleCreateSuccess,
    });
  };

  const deleteStaff = async (id: string) => {
    await deleteStaffMutation.mutateAsync(id, {
      onSuccess: handleDeleteSuccess,
    });
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.full_name.trim()) {
      nextErrors.full_name = t("staffPage.fullNameRequired");
    }

    if (
      !form.phone_number.trim() ||
      form.phone_number === UZBEKISTAN_PHONE_PREFIX
    ) {
      nextErrors.phone_number = t("staffPage.phoneRequired");
    } else if (!hasCompleteUzbekistanPhone(form.phone_number)) {
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

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createStaff(form);
    } catch (createError) {
      showErrorNotification({
        message:
          createError instanceof Error
            ? createError.message
            : t("staffPage.createError"),
      });
      setErrors((current) => ({
        ...current,
        form:
          createError instanceof Error
            ? createError.message
            : t("staffPage.createError"),
      }));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteStaff(id);
      closeDelete();
      setSelectedStaff(null);
    } catch (deleteError) {
      showErrorNotification({
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete staff member.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDeleteModal = (member: StaffUser) => {
    setSelectedStaff(member);
    openDelete();
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

            <PhoneNumberInput
              label={t("staffPage.phoneLabel")}
              placeholder="+998 00 000 00 00"
              value={form.phone_number}
              onChange={(value) => {
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

      <Modal
        opened={deleteOpened}
        onClose={() => {
          closeDelete();
          setSelectedStaff(null);
        }}
        title="Delete staff"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete{" "}
            <Text span fw={700}>
              {selectedStaff?.full_name}
            </Text>
            ?
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                closeDelete();
                setSelectedStaff(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={
                deleteStaffMutation.isPending &&
                deletingId === selectedStaff?.id
              }
              onClick={() => {
                if (selectedStaff) {
                  void handleDelete(selectedStaff.id);
                }
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
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
                <Table.Th>{t("staffPage.actions")}</Table.Th>
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
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        aria-label="Delete"
                        title="Delete"
                        disabled={deleteStaffMutation.isPending}
                        onClick={() => {
                          handleOpenDeleteModal(member);
                        }}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
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
