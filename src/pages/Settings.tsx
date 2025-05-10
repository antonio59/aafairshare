
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [user1, setUser1] = useState({
    name: "Antonio Smith",
    email: "antonio@example.com"
  });
  const [user2, setUser2] = useState({
    name: "Andres",
    email: "andres@example.com"
  });

  const handleSaveUser = (userNum: 1 | 2) => {
    toast({
      title: "User updated",
      description: `User ${userNum} details have been updated.`,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User 1 Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User 1</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user1-name">Name</Label>
                <Input
                  id="user1-name"
                  value={user1.name}
                  onChange={(e) => setUser1({ ...user1, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="user1-email">Email</Label>
                <Input
                  id="user1-email"
                  type="email"
                  value={user1.email}
                  onChange={(e) => setUser1({ ...user1, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="user1-password">Change Password</Label>
                <Input id="user1-password" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveUser(1)}>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* User 2 Settings */}
        <Card>
          <CardHeader>
            <CardTitle>User 2</CardTitle>
            <CardDescription>Update your friend's information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user2-name">Name</Label>
                <Input
                  id="user2-name"
                  value={user2.name}
                  onChange={(e) => setUser2({ ...user2, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="user2-email">Email</Label>
                <Input
                  id="user2-email"
                  type="email"
                  value={user2.email}
                  onChange={(e) => setUser2({ ...user2, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="user2-password">Change Password</Label>
                <Input id="user2-password" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSaveUser(2)}>Save Changes</Button>
          </CardFooter>
        </Card>

        {/* App Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
            <CardDescription>Configure application preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Currency</h3>
                  <p className="text-sm text-gray-500">Change your default currency</p>
                </div>
                <Button variant="outline">£ GBP</Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-gray-500">Download your expense history</p>
                </div>
                <Button variant="outline">Export CSV</Button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-gray-500">Remove all your data permanently</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
