import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function CompaniesPage() {
  const { t } = useTranslation();
  const companies = [
    { name: "Fresh Kitchen LLC", branchCount: 4, status: t("companiesPage.active"), fillRate: 82 },
    { name: "Urban Meals Group", branchCount: 2, status: t("companiesPage.review"), fillRate: 61 },
    { name: "Tashkent Food Hub", branchCount: 6, status: t("companiesPage.active"), fillRate: 91 },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>{t("companiesPage.title")}</Title>
          <Text c="dimmed">
            {t("companiesPage.subtitle")}
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} radius="md">
          {t("common.addCompany")}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, lg: 3 }}>
        {companies.map((company) => (
          <Card key={company.name} withBorder radius="xl" p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{company.name}</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    {company.branchCount} {t("companiesPage.branchesConnected")}
                  </Text>
                </div>
                <Badge
                  color={company.status === t("companiesPage.active") ? "teal" : "yellow"}
                  variant="light"
                >
                  {company.status}
                </Badge>
              </Group>

              <div>
                <Group justify="space-between" mb={6}>
                  <Text size="sm" c="dimmed">
                    {t("companiesPage.operationalFillRate")}
                  </Text>
                  <Text size="sm" fw={700}>
                    {company.fillRate}%
                  </Text>
                </Group>
                <Progress value={company.fillRate} radius="xl" color="orange" />
              </div>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
