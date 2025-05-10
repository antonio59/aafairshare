
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { getLocations, createLocation } from "@/services/expenseService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LocationSelectorProps {
  selectedLocation: string;
  onChange: (location: string) => void;
}

const LocationSelector = ({ selectedLocation, onChange }: LocationSelectorProps) => {
  const { toast } = useToast();
  const [newLocationDialogOpen, setNewLocationDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [creatingLocation, setCreatingLocation] = useState(false);

  // Fetch locations
  const { data: locations, refetch: refetchLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  // Sort locations alphabetically
  const sortedLocations = locations 
    ? [...locations].sort((a, b) => a.name.localeCompare(b.name)) 
    : [];

  const handleAddNewLocation = async () => {
    if (!newLocationName.trim()) return;
    
    setCreatingLocation(true);
    
    try {
      const newLocation = await createLocation(newLocationName.trim());
      
      toast({
        title: "Location added",
        description: `${newLocationName} has been added as a new location.`,
      });
      
      // Update locations list
      await refetchLocations();
      
      // Set the new location as selected
      onChange(newLocation.name);
      
      // Close the dialog
      setNewLocationDialogOpen(false);
      setNewLocationName("");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingLocation(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Label htmlFor="location">Location</Label>
        <div className="mt-1 flex gap-2">
          <Select
            value={selectedLocation}
            onValueChange={onChange}
          >
            <SelectTrigger id="location" className="w-full">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Locations</SelectLabel>
                {sortedLocations && sortedLocations.map((location) => (
                  <SelectItem key={location.id} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setNewLocationDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add new location dialog */}
      <Dialog open={newLocationDialogOpen} onOpenChange={setNewLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="new-location">Location Name</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="new-location"
                  placeholder="Enter location name"
                  className="pl-10"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewLocationDialogOpen(false);
                setNewLocationName("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewLocation}
              disabled={creatingLocation || !newLocationName.trim()}
            >
              {creatingLocation ? "Adding..." : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationSelector;
