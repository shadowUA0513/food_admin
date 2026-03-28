import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconLock, IconPhoneCall } from "@tabler/icons-react";
import { useState } from "react";

interface FormErrors {
  phone?: string;
  password?: string;
  form?: string;
}

const MIN_PHONE_LENGTH = 9;

function sanitizePhone(value: string) {
  const trimmed = value.trimStart();
  const hasPlus = trimmed.startsWith("+");
  const digits = value.replace(/\D/g, "");

  return `${hasPlus ? "+" : ""}${digits}`;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const phoneDigits = phone.replace(/\D/g, "");

    if (!phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else if (!/^\+?\d+$/.test(phone)) {
      nextErrors.phone = "Use only numbers and an optional + at the start";
    } else if (phoneDigits.length < MIN_PHONE_LENGTH) {
      nextErrors.phone = "Enter a valid phone number";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required";
    }

    if (nextErrors.phone || nextErrors.password) {
      nextErrors.form = "Please complete all required fields.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 900);
      });

      console.log({ phone, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      mih="100vh"
      px={{ base: "md", sm: "xl" }}
      py={{ base: "xl", md: 40 }}
      style={{
        background:
          "radial-gradient(circle at top left, rgba(46, 204, 113, 0.18), transparent 30%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 45%, #f8fafc 100%)",
      }}
    >
      <Center mih="calc(100vh - 80px)">
        <Paper radius="xl" shadow="lg" withBorder w="100%" maw={460}>
          <Box p={{ base: "lg", sm: "xl" }}>
            <Stack gap="xl">
              <Stack gap={6} ta="center">
                <Title order={2} fw={800}>
                  Login
                </Title>
                <Text c="dimmed" size="sm">
                  Enter your phone number and password.
                </Text>
              </Stack>

              <Paper
                component="form"
                onSubmit={handleSubmit}
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                bg="white"
                style={{ border: "1px solid var(--mantine-color-gray-2)" }}
              >
                <Stack gap="md">
                  <TextInput
                    label="Phone number"
                    placeholder="+998 XX XXX XX XX"
                    value={phone}
                    onChange={(event) => {
                      setPhone(sanitizePhone(event.currentTarget.value));
                      clearFieldError("phone");
                    }}
                    error={errors.phone}
                    leftSection={<IconPhoneCall size={16} stroke={1.8} />}
                    inputMode="tel"
                    autoComplete="tel"
                    size="md"
                    radius="md"
                    required
                  />

                  <Stack gap={6}>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.currentTarget.value);
                        clearFieldError("password");
                      }}
                      error={errors.password}
                      leftSection={<IconLock size={16} stroke={1.8} />}
                      autoComplete="current-password"
                      size="md"
                      radius="md"
                      required
                    />
                  </Stack>

                  {errors.form ? (
                    <Text c="red.6" size="sm">
                      {errors.form}
                    </Text>
                  ) : null}

                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    radius="md"
                    loading={isSubmitting}
                  >
                    Login
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Paper>
      </Center>
    </Box>
  );
}
