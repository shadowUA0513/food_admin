import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function StaffPage() {
  const { t } = useTranslation();
  const staffMembers = [
    { name: "Aziza Karimova", role: t("staffPage.manager"), status: t("staffPage.active"), shift: "09:00 - 18:00" },
    { name: "Bekzod Aliyev", role: t("staffPage.cashier"), status: t("staffPage.onBreak"), shift: "10:00 - 19:00" },
    { name: "Nilufar Xasanova", role: t("staffPage.support"), status: t("staffPage.active"), shift: "08:00 - 17:00" },
    { name: "Sardor Tursunov", role: t("staffPage.courierLead"), status: t("staffPage.offline"), shift: "12:00 - 21:00" },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{t("staffPage.title")}</Title>
          <Text c="dimmed">
            {t("staffPage.subtitle")}
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} radius="md">
          {t("common.addStaff")}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.totalStaff")}
          </Text>
          <Title order={3} mt={8}>
            24
          </Title>
        </Card>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.onShift")}
          </Text>
          <Title order={3} mt={8}>
            18
          </Title>
        </Card>
        <Card withBorder radius="xl" p="lg">
          <Text c="dimmed" size="sm">
            {t("staffPage.newThisMonth")}
          </Text>
          <Title order={3} mt={8}>
            3
          </Title>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="xl" p="lg">
        <Table highlightOnHover verticalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("staffPage.employee")}</Table.Th>
              <Table.Th>{t("staffPage.role")}</Table.Th>
              <Table.Th>{t("staffPage.status")}</Table.Th>
              <Table.Th>{t("staffPage.shift")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {staffMembers.map((member) => (
              <Table.Tr key={member.name}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar radius="xl" color="orange">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </Avatar>
                    <Text fw={600}>{member.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{member.role}</Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      member.status === t("staffPage.active")
                        ? "teal"
                        : member.status === t("staffPage.onBreak")
                          ? "yellow"
                          : "gray"
                    }
                    variant="light"
                  >
                    {member.status}
                  </Badge>
                </Table.Td>
                <Table.Td>{member.shift}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
