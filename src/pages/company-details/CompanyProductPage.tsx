import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPencil, IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 10;
const PRODUCT_NAMES = [
  "Cheese Burger",
  "Pepperoni Pizza",
  "Cola",
  "Chicken Wrap",
  "Greek Salad",
  "Chocolate Cake",
  "Americano",
  "Orange Juice",
  "Fries",
  "Club Sandwich",
];
const PRODUCT_CATEGORIES = [
  "Burgers",
  "Pizza",
  "Drinks",
  "Wraps",
  "Salads",
  "Desserts",
];

const MOCK_PRODUCTS = Array.from({ length: 150 }, (_, index) => {
  const name = PRODUCT_NAMES[index % PRODUCT_NAMES.length];
  const category = PRODUCT_CATEGORIES[index % PRODUCT_CATEGORIES.length];
  const priceValue = (index % 18) * 1.75 + 2.5;

  return {
    id: `p${index + 1}`,
    name: `${name} ${index + 1}`,
    category,
    price: `$${priceValue.toFixed(2)}`,
  };
});

export default function CompanyProductPage() {
  const { t } = useTranslation();
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = MOCK_PRODUCTS.filter((product) =>
    `${product.name} ${product.category} ${product.price}`
      .toLowerCase()
      .includes(normalizedSearch)
  );
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

      <Card withBorder radius="xl" p="lg">
        <Group justify="space-between" align="end">
          <TextInput
            label="Search"
            placeholder="Search products"
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
            }}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
          />
          <Text size="sm" c="dimmed">
            {filteredProducts.length} / {MOCK_PRODUCTS.length} items
          </Text>
        </Group>
      </Card>

      <Card withBorder radius="xl" p="lg">
        <Table highlightOnHover verticalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("companyDetails.productTitle")}</Table.Th>
              <Table.Th>{t("companyDetails.categoryTitle")}</Table.Th>
              <Table.Th>{t("companyDetails.price")}</Table.Th>
              <Table.Th>{t("staffPage.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedProducts.length ? (
              paginatedProducts.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>
                    <Text fw={600}>{product.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed">{product.category}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="orange" variant="light">
                      {product.price}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
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
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center" py="md">
                    No products found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Group justify="space-between" mt="lg">
          <Text size="sm" c="dimmed">
            Showing {filteredProducts.length ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}
            -{Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
            {filteredProducts.length}
          </Text>
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      </Card>
    </Stack>
  );
}
