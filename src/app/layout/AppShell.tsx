import { useState } from "react";
import { ClientLayout } from "@/features/client/ClientLayout";
import { EnvironmentSettingsPage } from "@/features/environment/EnvironmentSettingsPage";

type Page =
  | { view: "client" }
  | { view: "settings"; collection?: string };

export function AppShell() {
  const [page, setPage] = useState<Page>({ view: "client" });

  if (page.view === "settings") {
    return (
      <EnvironmentSettingsPage
        onBack={() => setPage({ view: "client" })}
        initialCollection={page.collection ?? null}
      />
    );
  }

  return (
    <ClientLayout
      onNavigateSettings={() => setPage({ view: "settings" })}
      onEditCollection={(col) =>
        setPage({ view: "settings", collection: col })
      }
    />
  );
}
