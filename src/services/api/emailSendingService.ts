
// This file is kept for backward compatibility
// New code should import from '@/services/api/email'
import { EmailSendingService } from "./email";
import type { TestEmailConfig, EmailSendingResult } from "./email";

export { EmailSendingService };
export type { TestEmailConfig, EmailSendingResult };
