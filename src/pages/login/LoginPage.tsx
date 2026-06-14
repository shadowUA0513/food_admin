import {
  Box,
  Button,
  Center,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
} from "@mantine/core";
import { IconAt, IconLock, IconShieldLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAppLanguage } from "../../i18n";
import { useAuth } from "../../app/providers/AuthProvider";

interface FormErrors {
  email?: string;
  password?: string;
  mfaCode?: string;
  form?: string;
}

type LoginStep = "credentials" | "mfa";

const MIN_PASSWORD_LENGTH = 6;

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function LoginPage() {
  const { login, completeMfaLogin, isLoading, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const resetMfaState = () => {
    setStep("credentials");
    setMfaToken("");
    setMfaCode("");
    setErrors({});
  };

  const validateCredentials = () => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = t("login.emailRequired");
    } else if (!isValidEmail(email)) {
      nextErrors.email = t("login.emailInvalid");
    }

    if (!password.trim()) {
      nextErrors.password = t("login.passwordRequired");
    } else if (password.trim().length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = t("login.passwordTooShort");
    }

    if (nextErrors.email || nextErrors.password) {
      nextErrors.form = t("login.formError");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateMfa = () => {
    const nextErrors: FormErrors = {};
    const value = mfaCode.trim();

    if (!value) {
      nextErrors.mfaCode = t("login.mfaCodeRequired");
    } else if (!/^\d{6}$/.test(value)) {
      nextErrors.mfaCode = t("login.mfaCodeInvalid");
    }

    if (nextErrors.mfaCode) {
      nextErrors.form = t("login.formError");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleCredentialsSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validateCredentials()) {
      return;
    }

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      if (result.status === "mfa_required") {
        setStep("mfa");
        setMfaToken(result.mfaToken);
        setMfaCode("");
        setErrors({
          form: t("login.mfaRequired"),
        });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        form: error instanceof Error ? error.message : t("login.formError"),
      }));
    }
  };

  const handleMfaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateMfa()) {
      return;
    }

    try {
      await completeMfaLogin({
        mfa_token: mfaToken,
        code: mfaCode.trim(),
      });

      navigate("/", { replace: true });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        form: error instanceof Error ? error.message : t("login.formError"),
      }));
    }
  };

  const showMfa = step === "mfa";

  return (
    <Box
      mih="100vh"
      px={{ base: "md", sm: "xl" }}
      py={{ base: "xl", md: 40 }}
      pos="relative"
      style={{
        background: isDark
          ? "radial-gradient(circle at top left, rgba(251, 146, 60, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.14), transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)"
          : "radial-gradient(circle at top left, rgba(46, 204, 113, 0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 32%), linear-gradient(135deg, #f8fafc 0%, #eef6ff 45%, #f8fafc 100%)",
      }}
    >
      <Box
        pos="absolute"
        top={{ base: 16, sm: 24 }}
        right={{ base: 16, sm: 24 }}
        w={140}
      >
        <Select
          value={i18n.resolvedLanguage ?? i18n.language}
          onChange={(value) => {
            if (isAppLanguage(value)) {
              void i18n.changeLanguage(value);
            }
          }}
          data={[
            {
              value: "en",
              label: t("common.languageEn", { defaultValue: "English" }),
            },
            { value: "ru", label: t("common.languageRu") },
            { value: "uz", label: t("common.languageUz") },
          ]}
          aria-label={t("common.language")}
          allowDeselect={false}
          radius="md"
        />
      </Box>

      <Center mih="calc(100vh - 80px)">
        <Paper
          radius="xl"
          shadow="xl"
          withBorder
          w="100%"
          maw={460}
          bg={isDark ? "dark.7" : "white"}
          style={{
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.10)"
              : "var(--mantine-color-gray-2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box p={{ base: "lg", sm: "xl" }}>
            <Stack gap="xl">
              <Stack gap={6} ta="center">
                <Title order={2} fw={800}>
                  {showMfa ? t("login.mfaTitle") : t("login.title")}
                </Title>
                <Text c="dimmed" size="sm">
                  {showMfa ? t("login.mfaSubtitle") : t("login.subtitle")}
                </Text>
              </Stack>

              <Paper
                component="form"
                onSubmit={showMfa ? handleMfaSubmit : handleCredentialsSubmit}
                radius="lg"
                p={{ base: "md", sm: "lg" }}
                bg={isDark ? "dark.6" : "gray.0"}
                style={{
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid var(--mantine-color-gray-2)",
                }}
              >
                <Stack gap="md">
                  {showMfa ? (
                    <TextInput
                      label={t("login.mfaCodeLabel")}
                      placeholder={t("login.mfaCodePlaceholder")}
                      value={mfaCode}
                      onChange={(event) => {
                        setMfaCode(event.currentTarget.value);
                        clearFieldError("mfaCode");
                      }}
                      error={errors.mfaCode}
                      leftSection={<IconShieldLock size={16} stroke={1.8} />}
                      size="md"
                      radius="md"
                      autoComplete="one-time-code"
                      styles={{
                        input: {
                          backgroundColor: isDark
                            ? "var(--mantine-color-dark-5)"
                            : undefined,
                          borderColor: isDark
                            ? "rgba(255, 255, 255, 0.12)"
                            : undefined,
                        },
                      }}
                      required
                    />
                  ) : (
                    <>
                      <TextInput
                        label={t("login.emailLabel")}
                        placeholder={t("login.emailPlaceholder")}
                        value={email}
                        onChange={(event) => {
                          setEmail(event.currentTarget.value);
                          clearFieldError("email");
                        }}
                        error={errors.email}
                        leftSection={<IconAt size={16} stroke={1.8} />}
                        autoComplete="email"
                        size="md"
                        radius="md"
                        styles={{
                          input: {
                            backgroundColor: isDark
                              ? "var(--mantine-color-dark-5)"
                              : undefined,
                            borderColor: isDark
                              ? "rgba(255, 255, 255, 0.12)"
                              : undefined,
                          },
                        }}
                        required
                      />

                      <PasswordInput
                        label={t("login.passwordLabel")}
                        placeholder={t("login.passwordPlaceholder")}
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
                        styles={{
                          input: {
                            backgroundColor: isDark
                              ? "var(--mantine-color-dark-5)"
                              : undefined,
                            borderColor: isDark
                              ? "rgba(255, 255, 255, 0.12)"
                              : undefined,
                          },
                        }}
                        required
                      />
                    </>
                  )}

                  {errors.form ? (
                    <Text c="red.6" size="sm">
                      {errors.form}
                    </Text>
                  ) : null}

                  <Stack gap="xs">
                    <Button
                      type="submit"
                      fullWidth
                      size="md"
                      radius="md"
                      loading={isLoading}
                    >
                      {showMfa ? t("login.verifyMfa") : t("login.submit")}
                    </Button>

                    {showMfa ? (
                      <Button
                        type="button"
                        variant="default"
                        fullWidth
                        onClick={resetMfaState}
                      >
                        {t("login.backToLogin")}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Paper>
      </Center>
    </Box>
  );
}
