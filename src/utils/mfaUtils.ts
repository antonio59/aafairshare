import { supabase } from '../supabase';
import { auditLog, AuditLogType } from './auditLogger';

export async function enrollMFA() {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    });

    if (error) throw error;

    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA enrollment initiated',
      { factorType: 'totp' }
    );

    return {
      qr: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id
    };
  } catch (error) {
    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA enrollment failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    throw error;
  }
}

export async function verifyMFA(factorId: string, code: string, challengeId: string) {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      code,
      challengeId
    });

    if (error) throw error;

    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA verification successful',
      { factorId }
    );

    return data;
  } catch (error) {
    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA verification failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    throw error;
  }
}

export async function challengeMFA(factorId: string) {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId
    });

    if (error) throw error;

    return data;
  } catch (error) {
    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA challenge failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    throw error;
  }
}

export async function unenrollMFA(factorId: string) {
  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId
    });

    if (error) throw error;

    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA unenrolled',
      { factorId }
    );
  } catch (error) {
    await auditLog(
      AuditLogType.SECURITY_EVENT,
      'MFA unenrollment failed',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    throw error;
  }
}
