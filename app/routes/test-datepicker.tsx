import { useState } from "react";
import { CustomDatePicker } from "~/components/ui/datepicker";
import MainLayout from "~/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function TestDatepicker() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Date Picker Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">New Date Picker</h3>
              <CustomDatePicker
                date={date}
                setDate={setDate}
              />
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">Selected Date:</h3>
              <p>{date ? date.toLocaleDateString() : "No date selected"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
