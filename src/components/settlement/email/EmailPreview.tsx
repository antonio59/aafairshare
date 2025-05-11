
import { User } from "@/types";

interface EmailPreviewProps {
  users: User[];
  usersMinRequired: number;
}

export const EmailPreview = ({ users, usersMinRequired }: EmailPreviewProps) => {
  if (users.length < usersMinRequired) {
    return (
      <div className="text-amber-500 text-sm p-4 bg-amber-50 rounded-md">
        You need at least two users in your system to test this feature.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="p-3 bg-slate-50 rounded-md">
        <p className="font-medium">Recipients:</p>
        <ul className="text-sm mt-1">
          {users.slice(0, 2).map(user => (
            <li key={user.id}>{user.name} ({(user as any).email})</li>
          ))}
        </ul>
      </div>
      
      <div className="p-3 bg-slate-50 rounded-md">
        <p className="font-medium">Test Data:</p>
        <ul className="text-sm mt-1">
          <li>Date: Current month and year</li>
          <li>Settlement Amount: £25.13</li>
          <li>Settlement Direction: User 1 → User 2</li>
          <li>Attachments: PDF Report, CSV Export</li>
        </ul>
      </div>
    </div>
  );
};
