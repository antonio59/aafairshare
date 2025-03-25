import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type SummaryCardVariant = 'total' | 'user1' | 'user2' | 'balance';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: SummaryCardVariant;
  isNegative?: boolean;
}

export default function SummaryCard({ title, value, icon: IconComponent, variant = 'total', isNegative = false }: SummaryCardProps) {
  const getBgColor = () => {
    switch (variant) {
      case 'total':
        return 'bg-blue-100 text-primary';
      case 'user1':
        return 'bg-emerald-100 text-secondary';
      case 'user2':
        return 'bg-purple-100 text-accent';
      case 'balance':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-blue-100 text-primary';
    }
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={cn("p-2 rounded-md shrink-0", getBgColor())}>
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="ml-2 sm:ml-3 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className={cn(
            "text-sm sm:text-xl font-semibold truncate",
            isNegative ? "text-red-500" : "text-gray-800"
          )}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
