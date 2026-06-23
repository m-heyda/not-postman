import { useState } from "react";
import { ClientLayout } from "@/features/client/ClientLayout";
import { EnvironmentSettingsPage } from "@/features/environment/EnvironmentSettingsPage";

type Page = "client" | "settings";

export function AppShell() {
  const [page, setPage] = useState<Page>("client");

  if (page === "settings") {
    return <EnvironmentSettingsPage onBack={() => setPage("client")} />;
  }

  return <ClientLayout onNavigateSettings={() => setPage("settings")} />;
}
