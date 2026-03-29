import { Paper, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      style={{ minHeight: "calc(100vh - 140px)" }}
    >
      <Text c="dimmed" size="sm">
        {t("dashboard.empty")}
      </Text>
    </Paper>
  );
}
