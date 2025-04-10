import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { useAuth } from "~/contexts/AuthContext";
import MainLayout from "~/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PlusIcon, Pencil, Trash2, LucideIcon } from "lucide-react";
import { Category, Location } from "~/shared/schema";
import { useToast } from "~/hooks/use-toast";
import { Skeleton } from "~/components/ui/skeleton";
import { CATEGORY_ICONS, CategoryIconName } from "~/lib/constants";
import { getCategoryBackgroundColorClass } from "~/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import CategoryForm from "~/components/CategoryForm";
import LocationForm from "~/components/LocationForm";
import { db } from "~/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc
} from "firebase/firestore";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - AAFairShare" },
    { name: "description", content: "Manage your AAFairShare settings" },
  ];
};

export default function Settings() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for Firestore data
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // State for UI
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'category' | 'location' } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // --- Firestore Listener for Categories ---
  useEffect(() => {
    if (!currentUser) return;
    setCategoriesLoading(true);
    const categoriesCol = collection(db, "categories");
    const q = query(categoriesCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
      setCategoriesLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      setCategoriesLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, toast]);

  // --- Firestore Listener for Locations ---
  useEffect(() => {
    if (!currentUser) return;
    setLocationsLoading(true);
    const locationsCol = collection(db, "locations");
    const q = query(locationsCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(fetchedLocations);
      setLocationsLoading(false);
    }, (error) => {
      console.error("Error fetching locations:", error);
      toast({ title: "Error", description: "Could not load locations.", variant: "destructive" });
      setLocationsLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, toast]);

  // --- Handle Category Actions ---
  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setItemToDelete({ id: categoryId, type: 'category' });
    setDeleteDialogOpen(true);
  };

  // --- Handle Location Actions ---
  const handleAddLocation = () => {
    setSelectedLocation(undefined);
    setIsLocationDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsLocationDialogOpen(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    setItemToDelete({ id: locationId, type: 'location' });
    setDeleteDialogOpen(true);
  };

  // --- Handle Delete Confirmation ---
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'category') {
        await deleteDoc(doc(db, "categories", itemToDelete.id));
        toast({
          title: "Category Deleted",
          description: "The category has been successfully deleted.",
        });
      } else {
        await deleteDoc(doc(db, "locations", itemToDelete.id));
        toast({
          title: "Location Deleted",
          description: "The location has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage expense categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No categories found. Add your first category.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => {
                      // Get the icon component, default to a placeholder if not found
                      const IconComponent = category.icon ? CATEGORY_ICONS[category.icon as CategoryIconName] || (() => <span className="text-xs">?</span>) : (() => <span className="text-xs">?</span>);
                      return (
                        <Card key={category.id} className="border-gray-200 dark:border-gray-700">
                          <CardContent className="flex items-center justify-between p-3 sm:p-4">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              {/* Color Swatch */}
                              <div className={`h-5 w-5 rounded-full border ${getCategoryBackgroundColorClass(category.name)}`}></div>
                              {/* Icon */}
                              <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span>{category.name}</span>
                            </div>
                            <div className="flex space-x-1 sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCategory(category)}
                                className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCategory(category.id)}
                                className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Locations</CardTitle>
                  <CardDescription>Manage expense locations</CardDescription>
                </div>
                <Button onClick={handleAddLocation}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </CardHeader>
              <CardContent>
                {locationsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No locations found. Add your first location.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                      >
                        <span className="font-medium">{location.name}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLocation(location.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onSuccess={() => setIsCategoryDialogOpen(false)}
              onCancel={() => setIsCategoryDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Location Dialog */}
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
            </DialogHeader>
            <LocationForm
              location={selectedLocation}
              onSuccess={() => setIsLocationDialogOpen(false)}
              onCancel={() => setIsLocationDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

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
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}