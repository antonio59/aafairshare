import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

type SummaryCardVariant = 'total' | 'user1' | 'user2' | 'balance';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: SummaryCardVariant;
  isNegative?: boolean;
  tooltip?: string;
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
  tooltip,
  isLoading = false,
  photoURL,
  email
}: SummaryCardProps) {
  const { currentUser } = useAuth();
  const isCurrentUserCard = variant === 'user1';

  if (isLoading) {
    // Skeleton adjusted to match reduced sizes
    return (
      <div className="bg-card dark:bg-card p-3 rounded-lg border border-border/40 dark:border-border/40 h-full flex items-center"> {/* Reduced padding */}
        <div className="h-12 w-12 rounded-md bg-muted animate-pulse shrink-0 mr-3" /> {/* Reduced size and margin */}
        <div className="flex-1 grid grid-rows-2 gap-0 items-center min-w-0 overflow-hidden"> {/* Added overflow-hidden */}
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" /> {/* Adjusted height */}
          <div className="h-6 w-1/2 bg-muted rounded animate-pulse" /> {/* Adjusted height */}
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
    // Reduced padding
    <div className="bg-card dark:bg-card p-3 rounded-lg border border-border/40 dark:border-border/40 h-full flex items-center">
      {/* Icon/Avatar Container: Reduced size, reduced margin-right */}
      <div className="shrink-0 mr-3"> {/* Reduced margin */}
        {((typeof photoURL === 'string' && photoURL) || (isCurrentUserCard && currentUser?.photoURL)) ? (
          // Reduced Avatar size
          <Avatar className="h-12 w-12"> {/* Reduced size */}
            <AvatarImage
              src={(typeof photoURL === 'string' && photoURL) ? photoURL : currentUser?.photoURL || undefined}
              alt={email || currentUser?.email || 'User'}
            />
            {/* Adjusted fallback text size slightly if needed */}
            <AvatarFallback className={cn("text-foreground text-base", getBgColor())}> {/* Adjusted text size */}
              {(email || currentUser?.email)?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          // Reduced padding and icon size
          <div className={cn("p-3 rounded-md", getBgColor())}> {/* Reduced padding */}
            <IconComponent className="h-6 w-6" /> {/* Reduced icon size */}
          </div>
        )}
      </div>

      {/* Text container: Added overflow-hidden */}
      <div className="flex-1 min-w-0 grid grid-rows-2 gap-0 items-center overflow-hidden"> {/* Added overflow-hidden */}
        {/* Title paragraph - Kept reduced base font size */}
        <p
          className="text-sm sm:text-base font-medium text-muted-foreground whitespace-normal break-words truncate" /* Added truncate */
          title={tooltip} // Use browser default tooltip
        >
          {title}
        </p>
        {/* Value paragraph - Kept reduced base font size */}
        <p className={cn(
          "text-base sm:text-lg font-semibold whitespace-normal break-words no-underline truncate", /* Added truncate */
          isNegative ? "text-red-500 dark:text-red-400" : "text-foreground"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}
