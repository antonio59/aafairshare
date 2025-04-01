import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
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
    return (
      <div className="bg-card dark:bg-card p-4 rounded-lg border border-border/40 dark:border-border/40">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
          <div className="ml-3 space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </div>
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
    <div className="bg-card dark:bg-card p-4 rounded-lg border border-border/40 dark:border-border/40">
      <div className="flex items-center">
        {((typeof photoURL === 'string' && photoURL) || (isCurrentUserCard && currentUser?.photoURL)) ? (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={(typeof photoURL === 'string' && photoURL) ? photoURL : currentUser?.photoURL || undefined}
              alt={email || currentUser?.email || 'User'}
            />
            <AvatarFallback className={cn("text-foreground", getBgColor())}>
              {(email || currentUser?.email)?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn("p-2.5 rounded-md shrink-0", getBgColor())}>
            <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
        <div className="ml-3 min-w-0">
          {tooltip ? (
            <Tooltip content={tooltip}><p className="text-sm font-medium text-muted-foreground truncate cursor-help">
                {title}
              </p></Tooltip>
          ) : (
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
          )}
          <p className={cn(
            "text-base sm:text-xl font-semibold truncate",
            isNegative ? "text-red-500 dark:text-red-400" : "text-foreground"
          )}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
