import { supabase } from '../supabase';
import { auditLog, AuditLogType } from './auditLogger';

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

export class SecurityMonitor {
  private static readonly ALERT_THRESHOLDS = {
    failedLogins: 5,
    apiRateLimit: 100,
    suspiciousIPs: new Set<string>(),
    knownAttackPatterns: [
      'sql injection',
      'xss',
      'command injection',
      'path traversal'
    ]
  };

  /**
   * Monitors failed login attempts
   */
  static async monitorFailedLogins(userId: string, ipAddress: string): Promise<void> {
    try {
      // Get recent failed login attempts
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('type', AuditLogType.AUTH_FAILURE)
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data && data.length >= this.ALERT_THRESHOLDS.failedLogins) {
        const alert: SecurityAlert = {
          type: 'excessive_failed_logins',
          severity: 'high',
          message: `Multiple failed login attempts detected for user ${userId}`,
          details: {
            userId,
            ipAddress,
            attemptCount: data.length,
            timeWindow: '30 minutes'
          },
          timestamp: new Date().toISOString()
        };

        await this.raiseAlert(alert);
      }
    } catch (error) {
      console.error('Failed to monitor login attempts:', error);
    }
  }

  /**
   * Monitors for suspicious data access patterns
   */
  static async monitorDataAccess(
    userId: string,
    action: string,
    resource: string,
    quantity: number
  ): Promise<void> {
    try {
      // Get recent access patterns
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action', action)
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Check for unusual patterns
      const isUnusual = this.detectUnusualPattern(data, quantity);
      if (isUnusual) {
        const alert: SecurityAlert = {
          type: 'unusual_data_access',
          severity: 'medium',
          message: `Unusual data access pattern detected for user ${userId}`,
          details: {
            userId,
            action,
            resource,
            quantity,
            timeWindow: '1 hour'
          },
          timestamp: new Date().toISOString()
        };

        await this.raiseAlert(alert);
      }
    } catch (error) {
      console.error('Failed to monitor data access:', error);
    }
  }

  /**
   * Monitors for suspicious IP addresses
   */
  static async monitorSuspiciousIPs(ipAddress: string, userId: string): Promise<void> {
    try {
      // Check if IP is already marked as suspicious
      if (this.ALERT_THRESHOLDS.suspiciousIPs.has(ipAddress)) {
        const alert: SecurityAlert = {
          type: 'suspicious_ip_access',
          severity: 'high',
          message: `Access attempt from previously flagged suspicious IP`,
          details: {
            ipAddress,
            userId
          },
          timestamp: new Date().toISOString()
        };

        await this.raiseAlert(alert);
        return;
      }

      // Check for geographic anomalies or known bad IP ranges
      const isIPSuspicious = await this.checkIPReputation(ipAddress);
      if (isIPSuspicious) {
        this.ALERT_THRESHOLDS.suspiciousIPs.add(ipAddress);
        
        const alert: SecurityAlert = {
          type: 'new_suspicious_ip',
          severity: 'medium',
          message: `New suspicious IP address detected`,
          details: {
            ipAddress,
            userId
          },
          timestamp: new Date().toISOString()
        };

        await this.raiseAlert(alert);
      }
    } catch (error) {
      console.error('Failed to monitor IP:', error);
    }
  }

  /**
   * Monitors for known attack patterns in user input
   */
  static async monitorUserInput(input: string, userId: string): Promise<void> {
    try {
      const lowerInput = input.toLowerCase();
      const detectedPatterns = this.ALERT_THRESHOLDS.knownAttackPatterns
        .filter(pattern => lowerInput.includes(pattern));

      if (detectedPatterns.length > 0) {
        const alert: SecurityAlert = {
          type: 'attack_pattern_detected',
          severity: 'critical',
          message: `Known attack pattern detected in user input`,
          details: {
            userId,
            patterns: detectedPatterns
          },
          timestamp: new Date().toISOString()
        };

        await this.raiseAlert(alert);
      }
    } catch (error) {
      console.error('Failed to monitor user input:', error);
    }
  }

  /**
   * Raises a security alert
   */
  private static async raiseAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Log the alert
      await auditLog(
        AuditLogType.SECURITY_EVENT,
        'Security alert raised',
        alert
      );

      // Store the alert in the database
      const { error } = await supabase
        .from('security_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          details: alert.details,
          timestamp: alert.timestamp
        });

      if (error) throw error;

      // If critical, send immediate notification
      if (alert.severity === 'critical') {
        await this.sendUrgentNotification(alert);
      }
    } catch (error) {
      console.error('Failed to raise alert:', error);
    }
  }

  private static async checkIPReputation(ipAddress: string): Promise<boolean> {
    // Implement IP reputation check logic here
    // Could integrate with services like AbuseIPDB or similar
    return false;
  }

  private static detectUnusualPattern(data: any[], quantity: number): boolean {
    // Implement pattern detection logic here
    // Could use statistical analysis, machine learning, etc.
    return false;
  }

  private static async sendUrgentNotification(alert: SecurityAlert): Promise<void> {
    // Implement urgent notification logic here
    // Could send email, SMS, or integrate with incident management systems
    console.error('URGENT SECURITY ALERT:', alert);
  }
}
