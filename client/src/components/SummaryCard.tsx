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
        return 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300';
      case 'user1':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-secondary dark:text-emerald-300';
      case 'user2':
        return 'bg-purple-100 dark:bg-purple-900/30 text-accent dark:text-purple-300';
      case 'balance':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300';
    }
  };

  return (
    <div className="bg-white dark:bg-card p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
        <div className={cn("p-2.5 rounded-md shrink-0", getBgColor())}>
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className={cn(
            "text-base sm:text-xl font-semibold truncate financial-figure",
            isNegative ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-white"
          )}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
