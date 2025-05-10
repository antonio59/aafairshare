
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ExpenseRowActions = ({ onEdit, onDelete }: ExpenseRowActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={onEdit}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" className="text-red-500" onClick={onDelete}>
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ExpenseRowActions;
