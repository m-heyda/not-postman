import { create } from "zustand";

interface EnvironmentSummary {
  id: string;
  name: string;
}

interface EnvironmentState {
  environments: EnvironmentSummary[];
  activeEnvironmentId: string;
  activeVariables: Record<string, string>;
  overrides: Record<string, string>;

  setEnvironments: (envs: EnvironmentSummary[]) => void;
  setActiveEnvironment: (id: string) => void;
  setActiveVariables: (vars: Record<string, string>) => void;
  setVariableOverride: (key: string, value: string) => void;
  removeVariableOverride: (key: string) => void;
  addVariable: (key: string, value: string) => void;
  removeVariable: (key: string) => void;
}

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  environments: [],
  activeEnvironmentId: "development",
  activeVariables: {},
  overrides: {},

  setEnvironments: (environments) => set({ environments }),

  setActiveEnvironment: (activeEnvironmentId) =>
    set({ activeEnvironmentId, overrides: {} }),

  setActiveVariables: (serverVars) =>
    set((state) => ({
      activeVariables: { ...serverVars, ...state.overrides },
    })),

  setVariableOverride: (key, value) =>
    set((state) => {
      const overrides = { ...state.overrides, [key]: value };
      return {
        overrides,
        activeVariables: { ...state.activeVariables, [key]: value },
      };
    }),

  removeVariableOverride: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.overrides;
      const { [key]: __, ...restVars } = state.activeVariables;
      return { overrides: rest, activeVariables: restVars };
    }),

  addVariable: (key, value) =>
    set((state) => {
      const overrides = { ...state.overrides, [key]: value };
      return {
        overrides,
        activeVariables: { ...state.activeVariables, [key]: value },
      };
    }),

  removeVariable: (key) =>
    set((state) => {
      const { [key]: _, ...restOverrides } = state.overrides;
      const { [key]: __, ...restVars } = state.activeVariables;
      return { overrides: restOverrides, activeVariables: restVars };
    }),
}));
