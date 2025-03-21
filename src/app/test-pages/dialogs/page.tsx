'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Dialogs Test Page
 * 
 * This page showcases dialog components with various configurations
 * to verify Tailwind CSS 4 styling and React 19 compatibility.
 */
export default function DialogsTestPage() {
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dialog Component Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Dialog */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Dialog</h2>
          <p className="mb-4">A simple dialog with title, description, and actions.</p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="open-dialog-button">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Basic Dialog</DialogTitle>
                <DialogDescription>
                  This is a basic dialog component with a title, description, and actions.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Dialog content goes here. This area can contain any React components.</p>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Controlled Dialog */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Controlled Dialog</h2>
          <p className="mb-4">A dialog with controlled open state using React 19 hooks.</p>
          
          <Button 
            onClick={() => setOpen(true)}
            data-testid="open-controlled-dialog-button"
          >
            Open Controlled Dialog
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <DialogDescription>
                  This dialog&apos;s open state is controlled using React 19 hooks.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Using controlled dialogs gives you more flexibility for complex interactions.</p>
              </div>
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => setOpen(false)}>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Alert Dialog */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Alert Dialog</h2>
          <p className="mb-4">A dialog for confirming destructive actions.</p>
          
          <Button 
            variant="destructive" 
            onClick={() => setOpenAlert(true)}
            data-testid="open-alert-dialog-button"
          >
            Delete Item
          </Button>
          
          <Dialog open={openAlert} onOpenChange={setOpenAlert}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the item
                  and remove the data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-between sm:justify-end sm:space-x-2">
                <Button variant="outline" onClick={() => setOpenAlert(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setOpenAlert(false)}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Form Dialog */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Form Dialog</h2>
          <p className="mb-4">A dialog containing a form with input fields.</p>
          
          <Button 
            onClick={() => setOpenForm(true)}
            data-testid="open-form-dialog-button"
          >
            Edit Profile
          </Button>
          
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue="John Doe"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    defaultValue="john.doe@example.com"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setOpenForm(false)}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Custom Styled Dialog */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Styled Dialog</h2>
          <p className="mb-4">A dialog with custom styling using Tailwind CSS 4.</p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/20"
                data-testid="open-custom-dialog-button"
              >
                Custom Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-background to-muted border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-primary">Custom Styled Dialog</DialogTitle>
                <DialogDescription>
                  This dialog uses custom styling with Tailwind CSS 4.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Custom dialogs can be styled to match your brand or create unique experiences.</p>
              </div>
              <DialogFooter>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
