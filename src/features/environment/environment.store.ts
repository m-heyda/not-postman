import { create } from "zustand";

interface EnvironmentSummary {
  id: string;
  name: string;
}

interface EnvironmentState {
  environments: EnvironmentSummary[];
  activeEnvironmentId: string;
  activeVariables: Record<string, string>;

  setEnvironments: (envs: EnvironmentSummary[]) => void;
  setActiveEnvironment: (id: string) => void;
  setActiveVariables: (vars: Record<string, string>) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironmentId: "development",
  activeVariables: {},

  setEnvironments: (environments) => set({ environments }),
  setActiveEnvironment: (activeEnvironmentId) => set({ activeEnvironmentId }),
  setActiveVariables: (activeVariables) => set({ activeVariables }),
}));
