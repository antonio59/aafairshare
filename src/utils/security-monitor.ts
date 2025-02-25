import { supabase } from '../supabase';
import { auditLog, AUDIT_LOG_TYPE, type AuditLogDetails } from './auditLogger';
import type { 
  SecurityAlert,
  SecurityAlertType,
  SecuritySeverity,
  SecurityAlertDetails,
  SecurityAlertMetadata 
} from '../types/security';

// Security thresholds configuration
const ALERT_THRESHOLDS = {
  failedLogins: 5,
  suspiciousIPs: new Set([
    // Add known malicious IPs
    '192.0.2.1',
    '198.51.100.1',
  ]),
  knownAttackPatterns: [
    'sql injection',
    'xss',
    '<script>',
    'eval(',
    'document.cookie',
  ] as const
} as const;

function createSecurityAlert(
  type: SecurityAlertType,
  severity: SecuritySeverity,
  message: string,
  details: SecurityAlertDetails,
  metadata: SecurityAlertMetadata
): SecurityAlert {
  return {
    id: crypto.randomUUID(),
    type,
    severity,
    message,
    details,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };
}

async function raiseAlert(alert: SecurityAlert): Promise<void> {
  try {
    const auditDetails: AuditLogDetails = {
      alertType: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: alert.details,
      metadata: alert.metadata,
    };

    await auditLog(
      AUDIT_LOG_TYPE.SECURITY_EVENT,
      'Security alert raised',
      auditDetails,
      alert.metadata.userId
    );

    const { error } = await supabase
      .from('security_alerts')
      .insert({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        details: alert.details,
        metadata: alert.metadata,
      });

    if (error) throw error;

    if (alert.severity === 'critical') {
      await sendUrgentNotification(alert);
    }
  } catch (error) {
    console.error('Failed to raise security alert:', error);
  }
}

async function sendUrgentNotification(alert: SecurityAlert): Promise<void> {
  try {
    // Implement urgent notification logic here
    // This could be sending emails, SMS, or other notifications
    console.error('URGENT SECURITY ALERT:', alert);
  } catch (error) {
    console.error('Failed to send urgent notification:', error);
  }
}

function detectUnusualPattern<T>(data: T[], quantity: number): boolean {
  try {
    if (!data || data.length === 0) return false;
    return data.length > quantity * 2;
  } catch (error) {
    console.error('Failed to detect pattern:', error);
    return false;
  }
}

async function checkIPReputation(ipAddress: string): Promise<boolean> {
  try {
    const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(ipAddress);
    return !isPrivateIP;
  } catch (error) {
    console.error('Failed to check IP reputation:', error);
    return false;
  }
}

// Public Monitoring Methods
export async function monitorFailedLogins(userId: string, ipAddress: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('type', AUDIT_LOG_TYPE.AUTH_FAILURE)
      .eq('userId', userId)
      .gte('timestamp', new Date(Date.now() - 3600000).toISOString());

    if (error) throw error;

    if (data && data.length >= ALERT_THRESHOLDS.failedLogins) {
      const alert = createSecurityAlert(
        'AUTH_FAILURE' as SecurityAlertType,
        'high',
        `Multiple failed login attempts detected for user ${userId}`,
        {
          source: 'authentication',
          description: 'Multiple failed login attempts within an hour',
          additionalInfo: {
            failedAttempts: data.length,
            ipAddress
          }
        },
        { 
          userId, 
          ipAddress,
          timestamp: new Date().toISOString()
        }
      );

      await raiseAlert(alert);
    }
  } catch (error) {
    console.error('Failed to monitor login attempts:', error);
    throw error;
  }
}

export async function monitorDataAccess(
  userId: string,
  action: string,
  resource: string,
  quantity: number
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('userId', userId)
      .eq('resource', resource)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    if (data && detectUnusualPattern(data, quantity)) {
      const alert = createSecurityAlert(
        'UNUSUAL_ACCESS' as SecurityAlertType,
        'medium',
        `Unusual access pattern detected for user ${userId}`,
        {
          source: 'data_access_monitor',
          description: `Unusual access pattern detected for resource ${resource}`,
          affectedResource: resource,
          additionalInfo: {
            userId,
            action,
            quantity,
            previousAccesses: data
          }
        },
        { 
          userId,
          timestamp: new Date().toISOString()
        }
      );
      await raiseAlert(alert);
    }
  } catch (error) {
    console.error('Failed to monitor data access:', error);
  }
}

export async function monitorSuspiciousIPs(
  ipAddress: string, 
  userId: string
): Promise<void> {
  try {
    if (ALERT_THRESHOLDS.suspiciousIPs.has(ipAddress)) {
      const alert = createSecurityAlert(
        'SUSPICIOUS_IP_DETECTED' as SecurityAlertType,
        'high',
        `Access attempt from suspicious IP: ${ipAddress}`,
        {
          source: 'ip_monitor',
          description: 'Access attempt from known malicious IP address',
          additionalInfo: {
            ipAddress,
            knownMalicious: true
          }
        },
        { 
          userId,
          timestamp: new Date().toISOString()
        }
      );
      await raiseAlert(alert);
    }
  } catch (error) {
    console.error('Failed to monitor suspicious IPs:', error);
  }
}

export async function monitorUserInput(
  input: string, 
  userId: string
): Promise<void> {
  try {
    const lowerInput = input.toLowerCase();
    const detectedPatterns = ALERT_THRESHOLDS.knownAttackPatterns
      .filter((pattern: string) => lowerInput.includes(pattern));

    if (detectedPatterns.length > 0) {
      const alert = createSecurityAlert(
        'MALICIOUS_INPUT_DETECTED' as SecurityAlertType,
        'high',
        'Potentially malicious input detected',
        {
          source: 'input_validator',
          description: 'Potentially malicious patterns detected in user input',
          additionalInfo: {
            userId,
            pattern: detectedPatterns.join(', '),
            input: input.substring(0, 100)
          }
        },
        { 
          userId,
          timestamp: new Date().toISOString()
        }
      );
      await raiseAlert(alert);
    }
  } catch (error) {
    console.error('Failed to monitor user input:', error);
  }
}
