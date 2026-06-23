import type { KeyValuePair } from "@/domain/models/request";

export interface KeyValueActions {
  update: (index: number, patch: Partial<KeyValuePair>) => void;
  add: () => void;
  remove: (index: number) => void;
}

export function createKeyValueActions(
  get: () => KeyValuePair[],
  set: (rows: KeyValuePair[]) => void,
): KeyValueActions {
  return {
    update(index, patch) {
      set(get().map((row, i) => (i === index ? { ...row, ...patch } : row)));
    },
    add() {
      set([...get(), { key: "", value: "", enabled: true }]);
    },
    remove(index) {
      const rows = get();
      if (rows.length <= 1) {
        set([{ key: "", value: "", enabled: true }]);
      } else {
        set(rows.filter((_, i) => i !== index));
      }
    },
  };
}
