import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { RecurringExpense, RecurringFrequency, Category, Location, User } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface RecurringExpenseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: RecurringExpense;
  categories: Category[];
  locations: Location[];
  users: User[];
}

export default function RecurringExpenseForm({
  onSuccess,
  onCancel,
  initialData,
  categories,
  locations,
  users,
}: RecurringExpenseFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecurringExpense>({
    defaultValues: initialData || {
      title: "",
      amount: 0,
      description: "",
      categoryId: categories[0]?.id || "",
      locationId: locations[0]?.id || "",
      paidByUserId: currentUser?.uid || "",
      splitType: "50/50",
      frequency: "monthly",
      isActive: true,
    },
  });

  // Watch form values
  const watchPaidByUserId = watch("paidByUserId");
  const watchCategoryId = watch("categoryId");
  const watchLocationId = watch("locationId");
  const watchFrequency = watch("frequency");
  const watchSplitType = watch("splitType");

  // Set dates when they change
  useEffect(() => {
    if (startDate) {
      setValue("startDate", startDate as any);
    }
    if (endDate) {
      setValue("endDate", endDate as any);
    }
  }, [startDate, endDate, setValue]);

  const onSubmit = async (data: RecurringExpense) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create recurring expenses",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for Firestore
      const recurringExpenseData = {
        ...data,
        startDate: Timestamp.fromDate(startDate || new Date()),
        endDate: endDate ? Timestamp.fromDate(endDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        // Update existing recurring expense
        const recurringExpenseRef = doc(db, "recurringExpenses", initialData.id);
        await updateDoc(recurringExpenseRef, {
          ...recurringExpenseData,
          updatedAt: serverTimestamp(),
        });
        toast({
          title: "Success",
          description: "Recurring expense updated successfully",
        });
      } else {
        // Create new recurring expense
        await addDoc(collection(db, "recurringExpenses"), recurringExpenseData);
        toast({
          title: "Success",
          description: "Recurring expense created successfully",
        });
        reset(); // Reset form after successful submission
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving recurring expense:", error);
      toast({
        title: "Error",
        description: "Failed to save recurring expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Recurring Expense" : "Create Recurring Expense"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Monthly Rent"
              {...register("title", { required: "Title is required" })}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">£</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Amount must be greater than 0" },
                })}
                aria-invalid={errors.amount ? "true" : "false"}
              />
            </div>
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this recurring expense"
              {...register("description")}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={watchCategoryId}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger id="categoryId" aria-invalid={errors.categoryId ? "true" : "false"}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="locationId">Location</Label>
            <Select
              value={watchLocationId}
              onValueChange={(value) => setValue("locationId", value)}
            >
              <SelectTrigger id="locationId" aria-invalid={errors.locationId ? "true" : "false"}>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.locationId && <p className="text-sm text-red-500">{errors.locationId.message}</p>}
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label htmlFor="paidByUserId">Paid By</Label>
            <Select
              value={watchPaidByUserId}
              onValueChange={(value) => setValue("paidByUserId", value)}
            >
              <SelectTrigger id="paidByUserId" aria-invalid={errors.paidByUserId ? "true" : "false"}>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paidByUserId && <p className="text-sm text-red-500">{errors.paidByUserId.message}</p>}
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label htmlFor="splitType">Split Type</Label>
            <Select
              value={watchSplitType}
              onValueChange={(value) => setValue("splitType", value)}
            >
              <SelectTrigger id="splitType" aria-invalid={errors.splitType ? "true" : "false"}>
                <SelectValue placeholder="Select split type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50/50">50/50 Split</SelectItem>
                <SelectItem value="100%">100% (Paid by one person)</SelectItem>
              </SelectContent>
            </Select>
            {errors.splitType && <p className="text-sm text-red-500">{errors.splitType.message}</p>}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={watchFrequency}
              onValueChange={(value) => setValue("frequency", value as RecurringFrequency)}
            >
              <SelectTrigger id="frequency" aria-invalid={errors.frequency ? "true" : "false"}>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  id="startDate"
                  aria-invalid={errors.startDate ? "true" : "false"}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              {endDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEndDate(undefined)}
                  className="h-8 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  id="endDate"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>No end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register("isActive")}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Recurring Expense
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
