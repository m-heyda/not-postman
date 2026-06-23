import { useEffect } from "react";
import { useSaveRequest } from "@/features/request/hooks/useSaveRequest";

export function useSaveShortcut() {
  const { save, canSave, isSaving } = useSaveRequest();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (canSave && !isSaving) {
          save();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save, canSave, isSaving]);
}
