import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface ProductState {
  id: string;
  name: string;
  category: string;
  price: string;
}

export default function EditProduct() {
  const { t } = useTranslation();
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = (location.state as { product?: ProductState } | null)?.product;
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState<string | number>("");

  useEffect(() => {
    setName(product?.name ?? "");
    setCategory(product?.category ?? null);
    setPrice(product?.price.replace("$", "") ?? "");
  }, [product]);

  const handleClose = () => {
    navigate(`/companies/${companyId}/product`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClose();
  };

  return (
    <Modal opened onClose={handleClose} title={t("companyDetails.editProduct")} centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t("companyDetails.productName")}
            placeholder={t("companyDetails.productPlaceholder")}
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
            }}
          />
          <Select
            label={t("companyDetails.category")}
            data={["Burgers", "Pizza", "Drinks"]}
            value={category}
            onChange={setCategory}
          />
          <NumberInput
            label={t("companyDetails.price")}
            placeholder="0.00"
            min={0}
            decimalScale={2}
            fixedDecimalScale
            value={price}
            onChange={setPrice}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose}>
              {t("staffPage.cancel")}
            </Button>
            <Button type="submit">{t("staffPage.saveButton")}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
