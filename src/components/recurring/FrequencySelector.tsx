
import { cn } from "@/lib/utils";

interface FrequencySelectorProps {
  selectedFrequency: string;
  onChange: (frequency: string) => void;
}

const FrequencySelector = ({ selectedFrequency, onChange }: FrequencySelectorProps) => {
  return (
    <div className="mb-6">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Frequency</label>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <button
          type="button"
          className={cn(
            "p-4 border rounded-lg",
            selectedFrequency === "weekly"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
          )}
          onClick={() => onChange("weekly")}
        >
          <div className="font-semibold">Weekly</div>
        </button>
        <button
          type="button"
          className={cn(
            "p-4 border rounded-lg",
            selectedFrequency === "monthly"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
          )}
          onClick={() => onChange("monthly")}
        >
          <div className="font-semibold">Monthly</div>
        </button>
        <button
          type="button"
          className={cn(
            "p-4 border rounded-lg",
            selectedFrequency === "yearly"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200"
          )}
          onClick={() => onChange("yearly")}
        >
          <div className="font-semibold">Yearly</div>
        </button>
      </div>
    </div>
  );
};

export default FrequencySelector;
