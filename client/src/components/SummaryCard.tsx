import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
// Removed Tooltip import
// import { Tooltip } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

type SummaryCardVariant = 'total' | 'user1' | 'user2' | 'balance';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: SummaryCardVariant;
  isNegative?: boolean;
  tooltip?: string; // Keep prop for potential future use or applying to parent
  isLoading?: boolean;
  photoURL?: string | null;
  email?: string;
}

export default function SummaryCard({
  title,
  value,
  icon: IconComponent,
  variant = 'total',
  isNegative = false,
  tooltip, // Keep prop
  isLoading = false,
  photoURL,
  email
}: SummaryCardProps) {
  const { currentUser } = useAuth();
  const isCurrentUserCard = variant === 'user1';

  if (isLoading) {
    // Updated skeleton to match larger sizes
    return (
      <div className="bg-card dark:bg-card p-4 rounded-lg border border-border/40 dark:border-border/40 h-full flex items-center">
        <div className="h-14 w-14 rounded-md bg-muted animate-pulse shrink-0 mr-5" /> {/* Increased size and margin */}
        <div className="flex-1 grid grid-rows-2 gap-0 items-center"> {/* Changed to items-center */}
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse" /> {/* Increased height */}
          <div className="h-7 w-1/2 bg-muted rounded animate-pulse" /> {/* Increased height */}
        </div>
      </div>
    );
  }

  const getBgColor = () => {
    switch (variant) {
      case 'total':
        return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400';
      case 'user1':
        return 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400';
      case 'user2':
        return 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400';
      case 'balance':
        return 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    // Use flex items-center, kept padding p-4
    <div className="bg-card dark:bg-card p-4 rounded-lg border border-border/40 dark:border-border/40 h-full flex items-center">
      {/* Icon/Avatar Container: Increased size, increased margin-right */}
      <div className="shrink-0 mr-5"> {/* Increased margin */}
        {((typeof photoURL === 'string' && photoURL) || (isCurrentUserCard && currentUser?.photoURL)) ? (
          // Increased Avatar size
          <Avatar className="h-14 w-14"> {/* Increased size */}
            <AvatarImage
              src={(typeof photoURL === 'string' && photoURL) ? photoURL : currentUser?.photoURL || undefined}
              alt={email || currentUser?.email || 'User'}
            />
            <AvatarFallback className={cn("text-foreground text-lg", getBgColor())}> {/* Increased text size */}
              {(email || currentUser?.email)?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          // Increased padding and icon size
          <div className={cn("p-3.5 rounded-md", getBgColor())}> {/* Increased padding */}
            <IconComponent className="h-7 w-7" /> {/* Increased icon size */}
          </div>
        )}
      </div>

      {/* Text container: Use grid layout with items-center */}
      <div className="flex-1 min-w-0 grid grid-rows-2 gap-0 items-center"> {/* Changed items-start to items-center */}
        {/* Title paragraph - Reduced base font size */}
        <p
          className="text-sm sm:text-base font-medium text-muted-foreground whitespace-normal break-words" // Reduced base font size
          title={tooltip} // Use browser default tooltip
        >
          {title}
        </p>
        {/* Value paragraph - Reduced base font size */}
        <p className={cn(
          "text-base sm:text-lg font-semibold whitespace-normal break-words no-underline", // Reduced base font size
          isNegative ? "text-red-500 dark:text-red-400" : "text-foreground"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
