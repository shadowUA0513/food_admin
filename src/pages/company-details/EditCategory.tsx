import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface CategoryState {
  id: string;
  name: string;
}

export default function EditCategory() {
  const { t } = useTranslation();
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const category = (location.state as { category?: CategoryState } | null)
    ?.category;
  const [name, setName] = useState("");

  useEffect(() => {
    setName(category?.name ?? "");
  }, [category]);

  const handleClose = () => {
    navigate(`/companies/${companyId}/category`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClose();
  };

  return (
    <Modal opened onClose={handleClose} title={t("companyDetails.editCategory")} centered>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t("companyDetails.categoryName")}
            placeholder={t("companyDetails.categoryPlaceholder")}
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
            }}
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
