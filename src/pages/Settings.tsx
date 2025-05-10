
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocationsManager from "@/components/LocationsManager";
import CategoriesManager from "@/components/CategoriesManager";

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations">
          <LocationsManager />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
