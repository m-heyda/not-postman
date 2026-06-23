import { create } from "zustand";

interface EnvironmentSummary {
  id: string;
  name: string;
}

export interface Domain {
  varKey: string;
  name: string;
  url: string;
}

interface EnvironmentState {
  environments: EnvironmentSummary[];
  activeEnvironmentId: string;
  activeVariables: Record<string, string>;
  domains: Domain[];

  setEnvironments: (envs: EnvironmentSummary[]) => void;
  setActiveEnvironment: (id: string) => void;
  setActiveVariables: (vars: Record<string, string>) => void;
  addDomain: (domain: Domain) => void;
  removeDomain: (varKey: string) => void;
}

function deriveDomains(variables: Record<string, string>): Domain[] {
  return Object.entries(variables).map(([key, url]) => ({
    varKey: key,
    name: key.replace(/BaseUrl$/i, "").replace(/Base_?url$/i, ""),
    url,
  }));
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironmentId: "development",
  activeVariables: {},
  domains: [],

  setEnvironments: (environments) => set({ environments }),

  setActiveEnvironment: (activeEnvironmentId) => set({ activeEnvironmentId }),

  setActiveVariables: (activeVariables) =>
    set({
      activeVariables,
      domains: deriveDomains(activeVariables),
    }),

  addDomain: (domain) =>
    set((state) => ({
      domains: [...state.domains.filter((d) => d.varKey !== domain.varKey), domain],
      activeVariables: { ...state.activeVariables, [domain.varKey]: domain.url },
    })),

  removeDomain: (varKey) =>
    set((state) => {
      const { [varKey]: _, ...rest } = state.activeVariables;
      return {
        domains: state.domains.filter((d) => d.varKey !== varKey),
        activeVariables: rest,
      };
    }),
}));
