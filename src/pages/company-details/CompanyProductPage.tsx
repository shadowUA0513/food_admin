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

const MOCK_PRODUCTS = [
  { id: "p1", name: "Cheese Burger", category: "Burgers", price: "$8.50" },
  { id: "p2", name: "Pepperoni Pizza", category: "Pizza", price: "$14.00" },
  { id: "p3", name: "Cola", category: "Drinks", price: "$2.00" },
];

export default function CompanyProductPage() {
  const { t } = useTranslation();
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <Stack gap="lg">
      <Outlet />

      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>{t("companyDetails.productTitle")}</Title>
          <Text c="dimmed">{t("companyDetails.productSubtitle")}</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            navigate(`/companies/${companyId}/product/add-product`);
          }}
        >
          {t("companyDetails.addProduct")}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
        {MOCK_PRODUCTS.map((product) => (
          <Card key={product.id} withBorder radius="xl" p="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{product.name}</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    {product.category}
                  </Text>
                </div>
                <Badge color="orange" variant="light">
                  {product.price}
                </Badge>
              </Group>

              <Group justify="flex-end">
                <ActionIcon
                  variant="light"
                  color="blue"
                  aria-label={t("companyDetails.editProduct")}
                  onClick={() => {
                    navigate(
                      `/companies/${companyId}/product/edit/${product.id}`,
                      { state: { product } }
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
