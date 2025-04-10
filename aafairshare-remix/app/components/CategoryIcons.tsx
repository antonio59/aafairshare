import React from 'react';
import { Category } from '~/shared/schema';
import { getCategoryColor } from '~/lib/chartColors';
import { getCategoryBackgroundColorClass } from '~/lib/utils';
import { cn } from '~/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { CATEGORY_ICONS, CategoryIconName } from '~/lib/constants';

interface CategoryIconsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  className?: string;
}

export default function CategoryIcons({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className
}: CategoryIconsProps) {
  // Sort categories alphabetically
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className={cn("w-full", className)}>
      <ToggleGroup type="single" value={selectedCategoryId || ''} onValueChange={onSelectCategory}>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {sortedCategories.map((category) => {
            const color = getCategoryColor(category.name);
            const isSelected = category.id === selectedCategoryId;

            // Get the icon component, default to a placeholder if not found
            const IconComponent = category.icon ? CATEGORY_ICONS[category.icon as CategoryIconName] || null : null;

            return (
              <ToggleGroupItem
                key={category.id}
                value={category.id}
                className={cn(
                  "flex flex-col items-center justify-center p-3 h-auto aspect-[4/3] rounded-md border border-gray-200 hover:bg-gray-50 transition-colors",
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
                aria-label={category.name}
              >
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2",
                      getCategoryBackgroundColorClass(category.name))}
                  >
                    {IconComponent ? (
                      <IconComponent className="h-6 w-6 text-gray-800 dark:text-white" />
                    ) : (
                      <span className="text-gray-800 dark:text-white font-medium text-sm">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-center line-clamp-2 min-h-[2.5rem]">{category.name}</span>
                </div>
              </ToggleGroupItem>
            );
          })}
        </div>
      </ToggleGroup>
    </div>
  );
}
