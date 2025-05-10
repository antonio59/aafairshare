
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationsManager from "@/components/LocationsManager";
import CategoriesManager from "@/components/CategoriesManager";

const Settings = () => {
  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="mt-4">
          <LocationsManager />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4">
          <CategoriesManager />
        </TabsContent>
      </Tabs>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm font-medium text-yellow-700">Debug Information:</p>
        <p className="text-sm text-yellow-600">The settings page is attempting to load the LocationsManager and CategoriesManager components.</p>
      </div>
    </div>
  );
};

export default Settings;
