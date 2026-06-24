import { ResponseView } from "./ResponseView";

interface ResponsePanelProps {
  onTypesGenerated?: () => void;
}

/** @deprecated Use ResponseView — kept for RequestWorkspace compatibility */
export function ResponsePanel({ onTypesGenerated }: ResponsePanelProps) {
  return <ResponseView onTypesGenerated={onTypesGenerated} />;
}
