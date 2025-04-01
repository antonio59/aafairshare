import React, { useState, useEffect } from "react"; // Added useEffect
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
// Removed unused ChevronLeftIcon, ChevronRightIcon imports
import { Pencil, Trash, Plus } from "lucide-react";
import { Category, Location } from "@shared/schema"; // Use types from schema
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryForm from "@/components/CategoryForm"; // Keep form imports
import LocationForm from "@/components/LocationForm"; // Keep form imports
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"; // Import ResponsiveDialog
import {
  AlertDialogAction, // Keep Action for button styling
  AlertDialogCancel, // Keep Cancel for button styling
} from "@/components/ui/alert-dialog"; // Keep parts needed for buttons
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"; // Import Firestore functions

export default function Settings() {
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryFormOpen, setCategoryFormOpen] = useState(false);
  const [isLocationFormOpen, setLocationFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'location', id: string } | null>(null); // ID is now string
  const { toast } = useToast();

  // State for Firestore data
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // Fetch Categories from Firestore
  useEffect(() => {
    setCategoriesLoading(true);
    const catCol = collection(db, "categories");
    const q = query(catCol, orderBy("name"));
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
  }, [toast]);

  // Fetch Locations from Firestore
  useEffect(() => {
    setLocationsLoading(true);
    const locCol = collection(db, "locations");
    const q = query(locCol, orderBy("name"));
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
  }, [toast]);


  const openDeleteDialog = (type: 'category' | 'location', id: string) => { // ID is now string
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  // Updated handleDelete using Firestore
  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { type, id } = itemToDelete;
    const collectionName = type === 'category' ? 'categories' : 'locations'; // Correct pluralization
    const itemRef = doc(db, collectionName, id);

    try {
      await deleteDoc(itemRef);
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`,
      });
      // No need to invalidate queries, listener handles updates
    } catch (error: unknown) { // Changed 'any' to 'unknown'
      console.error(`Error deleting ${type}:`, error);
      // Type check before accessing properties
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${type}. It might be in use or there was a server error.`;
      // Check for specific Firestore error codes if needed, e.g., if deletion fails due to rules
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    }
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
                <CardDescription>Manage expense categories</CardDescription>
              </div>
              <Button onClick={() => { setSelectedCategory(undefined); setCategoryFormOpen(true); }}> {/* Reset selected on add */}
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-2"> <Skeleton className="h-12" /> <Skeleton className="h-12" /> <Skeleton className="h-12" /> </div>
              ) : categories.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || '#ccc' }}></div> {/* Display color */}
                          <span>{category.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedCategory(category); setCategoryFormOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-primary">
                            <Pencil className="h-4 w-4" /> <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('category', category.id)} className="h-8 w-8 text-gray-500 hover:text-red-500">
                            <Trash className="h-4 w-4" /> <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center"><p className="text-gray-600">No categories found.</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Locations</CardTitle>
                <CardDescription>Manage expense locations</CardDescription>
              </div>
              <Button onClick={() => { setSelectedLocation(undefined); setLocationFormOpen(true); }}> {/* Reset selected on add */}
                <Plus className="h-4 w-4 mr-2" /> Add Location
              </Button>
            </CardHeader>
            {/* Add overflow and max-height for testing */}
            <CardContent className="overflow-y-auto max-h-[60vh]">
              {locationsLoading ? (
                 <div className="space-y-2"> <Skeleton className="h-12" /> <Skeleton className="h-12" /> <Skeleton className="h-12" /> </div>
              ) : locations.length > 0 ? (
                 <div className="space-y-4"> {/* Reverted to vertical stack */}
                  {locations.map((location) => (
                    <Card key={location.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <span>{location.name}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedLocation(location); setLocationFormOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-primary">
                            <Pencil className="h-4 w-4" /> <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog('location', location.id)} className="h-8 w-8 text-gray-500 hover:text-red-500">
                            <Trash className="h-4 w-4" /> <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                 <div className="p-4 text-center"><p className="text-gray-600">No locations found.</p></div>
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

      {/* Delete Confirmation Dialog using ResponsiveDialog */}
      <ResponsiveDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Are you sure?"
        description={`This will permanently delete this ${itemToDelete?.type}. This action cannot be undone.`}
      >
        {/* Footer content goes inside the component */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
          <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
