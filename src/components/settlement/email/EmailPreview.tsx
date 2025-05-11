
import { User } from "@/types";
import { format } from "date-fns";

interface TestEmailData {
  year: number;
  month: number;
  settlementAmount: number;
  settlementDirection: "owes" | "owed" | "none";
}

interface EmailPreviewProps {
  users: (User & { email?: string })[];
  usersMinRequired: number;
  testData: TestEmailData;
}

export const EmailPreview = ({ users, usersMinRequired, testData }: EmailPreviewProps) => {
  if (users.length < usersMinRequired) {
    return (
      <div className="text-amber-500 text-sm p-4 bg-amber-50 rounded-md">
        You need at least two users in your system to test this feature.
      </div>
    );
  }

  // Format month name (e.g., "May 2025")
  const monthName = format(new Date(testData.year, testData.month - 1, 1), 'MMMM yyyy');
  
  // Create settlement direction message
  let settlementMessage = "No settlement needed";
  if (testData.settlementDirection === 'owes') {
    settlementMessage = `${users[0].name} pays ${users[1].name}`;
  } else if (testData.settlementDirection === 'owed') {
    settlementMessage = `${users[1].name} pays ${users[0].name}`;
  }

  return (
    <div className="space-y-2">
      <div className="p-3 bg-slate-50 rounded-md">
        <p className="font-medium">Recipients:</p>
        <ul className="text-sm mt-1">
          {users.slice(0, 2).map(user => (
            <li key={user.id}>{user.name} ({user.email || 'No email'})</li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 bg-slate-50 rounded-md">
        <p className="font-medium">Test Data:</p>
        <ul className="text-sm mt-1">
          <li>Date: {monthName}</li>
          <li>Settlement Amount: £{testData.settlementAmount.toFixed(2)}</li>
          <li>Direction: {settlementMessage}</li>
          <li>Attachments: PDF Report, CSV Export</li>
        </ul>
      </div>
    </div>
  );
};
