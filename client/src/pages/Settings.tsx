import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Pencil, Trash, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, Location } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryForm from "@/components/CategoryForm";
import LocationForm from "@/components/LocationForm";
import { apiRequest } from "@/lib/queryClient";
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

export default function Settings() {
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);
  const [isLocationFormOpen, setLocationFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'location', id: number } | null>(null);
  const localQueryClient = useQueryClient();
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

  const openDeleteDialog = (type: 'category' | 'location', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await apiRequest("DELETE", `/api/${itemToDelete.type}s/${itemToDelete.id}`);

      if (response.ok) {
        localQueryClient.invalidateQueries({
          queryKey: [`/api/${itemToDelete.type}s`],
        });

        toast({
          title: "Success",
          description: `${itemToDelete.type} deleted successfully`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast({
        title: "Cannot Delete",
        description: error.message || `This ${itemToDelete.type} is currently in use by expenses and cannot be deleted`,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="container py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage expense categories
                </CardDescription>
              </div>
              <Button onClick={() => setCategoryFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <span>{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategoryFormOpen(true);
                            }}
                            className="h-8 w-8 text-gray-500 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog('category', category.id)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-600">No categories found. Add your first category.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Locations</CardTitle>
                <CardDescription>
                  Manage expense locations
                </CardDescription>
              </div>
              <Button onClick={() => setLocationFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              ) : locations && locations.length > 0 ? (
                <div className="grid gap-4">
                  {locations.map((location) => (
                    <Card key={location.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <span>{location.name}</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLocation(location);
                              setLocationFormOpen(true);
                            }}
                            className="h-8 w-8 text-gray-500 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog('location', location.id)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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