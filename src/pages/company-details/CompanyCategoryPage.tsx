import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MOCK_CATEGORIES = [
  { id: "c1", name: "Burgers", productCount: 12, status: "active" },
  { id: "c2", name: "Pizza", productCount: 8, status: "active" },
  { id: "c3", name: "Drinks", productCount: 14, status: "draft" },
];

export default function CompanyCategoryPage() {
  const { t } = useTranslation();
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Outlet />

      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>{t("companyDetails.categoryTitle")}</Title>
          <Text c="dimmed">{t("companyDetails.categorySubtitle")}</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            navigate(`/companies/${companyId}/category/add-category`);
          }}
        >
          {t("companyDetails.addCategory")}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
        {MOCK_CATEGORIES.map((category) => (
          <Card key={category.id} withBorder radius="xl" p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{category.name}</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    {t("companyDetails.productCount", {
                      count: category.productCount,
                    })}
                  </Text>
                </div>
                <Badge
                  color={category.status === "active" ? "teal" : "gray"}
                  variant="light"
                >
                  {category.status === "active"
                    ? t("companyDetails.active")
                    : t("companyDetails.draft")}
                </Badge>
              </Group>

              <Group justify="flex-end">
                <ActionIcon
                  variant="light"
                  color="blue"
                  aria-label={t("companyDetails.editCategory")}
                  onClick={() => {
                    navigate(
                      `/companies/${companyId}/category/edit/${category.id}`,
                      { state: { category } }
                    );
                  }}
                >
                  <IconPencil size={18} />
                </ActionIcon>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
