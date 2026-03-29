import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { localStorageColorSchemeManager, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./app/providers/AuthProvider";
import "./i18n";
import "./index.css";
import App from "./App.tsx";

const colorSchemeManager = localStorageColorSchemeManager({
  key: "food-admin-color-scheme",
});
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        colorSchemeManager={colorSchemeManager}
        defaultColorScheme="light"
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
