
import { Input } from "@/components/ui/input";

interface ExpenseFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const ExpenseFilter = ({ searchTerm, onSearchChange }: ExpenseFilterProps) => {
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Filter by category, location, paid by..."
        className="pl-9 w-80"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
    </div>
  );
};

export default ExpenseFilter;
