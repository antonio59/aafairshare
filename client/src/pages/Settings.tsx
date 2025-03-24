import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Category, Location } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryForm from "@/components/CategoryForm";
import LocationForm from "@/components/LocationForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as LucideIcons from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);
  const [isLocationFormOpen, setLocationFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'location', id: number } | null>(null);
  const { toast } = useToast();

  // Fetch categories
  const { 
    data: categories, 
    isLoading: categoriesLoading,
    isError: categoriesError
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch locations
  const { 
    data: locations, 
    isLoading: locationsLoading,
    isError: locationsError
  } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load locations. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryFormOpen(true);
  };

  const handleAddLocation = () => {
    setSelectedLocation(undefined);
    setLocationFormOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setLocationFormOpen(true);
  };

  const openDeleteDialog = (type: 'category' | 'location', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'category') {
        await apiRequest('DELETE', `/api/categories/${itemToDelete.id}`);
        queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
        toast({
          title: "Category deleted",
          description: "The category has been deleted successfully."
        });
      } else {
        await apiRequest('DELETE', `/api/locations/${itemToDelete.id}`);
        queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
        toast({
          title: "Location deleted",
          description: "The location has been deleted successfully."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}. It might be in use by expenses.`,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Categories</CardTitle>
              <Button onClick={handleAddCategory}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(category => {
                    const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Tag;
                    
                    return (
                      <div 
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div 
                            className="h-10 w-10 rounded-md flex items-center justify-center"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color
                            }}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className="ml-3 font-medium">{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditCategory(category)}
                            className="text-gray-500 hover:text-primary h-8 w-8 p-0"
                          >
                            <Edit2Icon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDeleteDialog('category', category.id)}
                            className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-600">No categories found. Add your first category.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Locations Tab */}
        <TabsContent value="locations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Locations</CardTitle>
              <Button onClick={handleAddLocation}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : locations && locations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map(location => (
                    <div 
                      key={location.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
                          <LucideIcons.MapPin className="h-5 w-5" />
                        </div>
                        <span className="ml-3 font-medium">{location.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditLocation(location)}
                          className="text-gray-500 hover:text-primary h-8 w-8 p-0"
                        >
                          <Edit2Icon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDeleteDialog('location', location.id)}
                          className="text-gray-500 hover:text-red-500 h-8 w-8 p-0"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-600">No locations found. Add your first location.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Category Form */}
      <CategoryForm 
        open={isCategoryFormOpen} 
        onOpenChange={setCategoryFormOpen} 
        category={selectedCategory} 
      />
      
      {/* Location Form */}
      <LocationForm 
        open={isLocationFormOpen} 
        onOpenChange={setLocationFormOpen} 
        location={selectedLocation} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {itemToDelete?.type}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
