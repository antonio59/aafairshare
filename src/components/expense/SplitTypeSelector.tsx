
import { cn } from "@/lib/utils";

interface SplitTypeSelectorProps {
  selectedSplitType: string;
  onChange: (splitType: string) => void;
}

const SplitTypeSelector = ({ selectedSplitType, onChange }: SplitTypeSelectorProps) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Split Type</label>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <button
          type="button"
          className={cn(
            "p-4 border rounded-lg",
            selectedSplitType === "50/50"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
          )}
          onClick={() => onChange("50/50")}
        >
          <div className="font-semibold">Equal</div>
          <div className="text-sm text-gray-500">Split equally among all</div>
        </button>
        <button
          type="button"
          className={cn(
            "p-4 border rounded-lg",
            selectedSplitType === "custom"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
          )}
          onClick={() => onChange("custom")}
        >
          <div className="font-semibold">Percent</div>
          <div className="text-sm text-gray-500">100% owed by the other user</div>
        </button>
      </div>
    </div>
  );
};

export default SplitTypeSelector;
