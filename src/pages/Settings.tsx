
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Import the components with React.lazy for code splitting
const LocationsManager = React.lazy(() => import("@/components/LocationsManager"));
const CategoriesManager = React.lazy(() => import("@/components/CategoriesManager"));

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>("locations");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Once the component mounts, set loading to false
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Error boundary function
  const renderWithErrorHandling = (Component: React.ComponentType, name: string) => {
    try {
      return (
        <React.Suspense fallback={<div className="p-4 text-center">Loading {name}...</div>}>
          <Component />
        </React.Suspense>
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Error rendering ${name}: ${errorMessage}`);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container p-6 bg-white">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="p-8 text-center">Loading settings page...</div>
      </div>
    );
  }

  return (
    <div className="container p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="locations" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="mt-4 border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Locations Management</h2>
          {activeTab === "locations" && renderWithErrorHandling(LocationsManager, "LocationsManager")}
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4 border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Categories Management</h2>
          {activeTab === "categories" && renderWithErrorHandling(CategoriesManager, "CategoriesManager")}
        </TabsContent>
      </Tabs>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-700">Debug Information:</p>
        <p className="text-sm text-yellow-600">Current active tab: {activeTab}</p>
        <p className="text-sm text-yellow-600">The settings page is attempting to load the LocationsManager and CategoriesManager components.</p>
        <div className="mt-2 p-2 bg-white rounded border border-yellow-100">
          <p className="text-xs font-mono">LocationsManager imported: {typeof LocationsManager === 'function' ? '✅' : '❌'}</p>
          <p className="text-xs font-mono">CategoriesManager imported: {typeof CategoriesManager === 'function' ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
