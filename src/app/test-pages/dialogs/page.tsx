'use client'

import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DialogsTestPage() {
  const [controlledOpen, setControlledOpen] = useState(false)
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dialog Component Tests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="open-dialog-button">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a basic dialog that demonstrates the standard dialog component.
                  </DialogDescription>
                </DialogHeader>
                <p className="py-4">
                  Dialogs provide a way to present content that requires user attention or interaction.
                </p>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Controlled Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setControlledOpen(true)}
              data-testid="open-controlled-dialog-button"
            >
              Open Controlled Dialog
            </Button>
            
            <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Controlled Dialog</DialogTitle>
                  <DialogDescription>
                    This dialog's state is controlled externally.
                  </DialogDescription>
                </DialogHeader>
                <p className="py-4">
                  Controlled dialogs are useful when you need to manage the dialog state from outside the component.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setControlledOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setControlledOpen(false)}>
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alert Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  data-testid="open-alert-dialog-button"
                >
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="open-form-dialog-button">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" defaultValue="John Doe" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" defaultValue="john@example.com" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Styled Dialog</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  data-testid="open-custom-dialog-button"
                >
                  Show Custom Dialog
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-primary text-primary-foreground">
                <DialogHeader>
                  <DialogTitle>Custom Styled Dialog</DialogTitle>
                  <DialogDescription className="text-primary-foreground/70">
                    This dialog has custom styling applied.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>Dialogs can be styled to match your application's design system.</p>
                </div>
                <DialogFooter>
                  <Button variant="secondary">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
