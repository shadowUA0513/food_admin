import { Badge, Button, Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../app/providers/AuthProvider";

interface HomePageProps {
  onLogout: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const { logout, phone } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <Container size="md" py={48}>
      <Paper withBorder radius="xl" shadow="md" p="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2}>Dashboard</Title>
              <Text c="dimmed" size="sm">
                This page is protected and only available after login.
              </Text>
            </div>
            <Badge color="teal" variant="light">
              Authorized
            </Badge>
          </Group>

          <Paper radius="lg" p="lg" bg="gray.0">
            <Stack gap={4}>
              <Text fw={600}>Logged in phone</Text>
              <Text c="dimmed">{phone ?? "-"}</Text>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button variant="light" color="red" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
