/**
 * Security Audit Logging
 * Tracks security-relevant events for monitoring and forensics
 */

/**
 * Security event types
 */
export type SecurityEventType =
  // Authentication events
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_BLOCKED_RATE_LIMIT'
  | 'LOGIN_BLOCKED_BOT'
  | 'LOGOUT'
  | 'SESSION_CREATED'
  | 'SESSION_REVOKED'
  | 'SESSION_EXPIRED'
  // Registration events
  | 'REGISTER_SUCCESS'
  | 'REGISTER_FAILURE'
  | 'REGISTER_BLOCKED_RATE_LIMIT'
  | 'REGISTER_BLOCKED_BOT'
  | 'REGISTER_BLOCKED_DISPOSABLE_EMAIL'
  // Password events
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_RESET_FAILURE'
  // 2FA events
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | '2FA_FAILED'
  | '2FA_BACKUP_USED'
  // Email events
  | 'EMAIL_VERIFICATION_SENT'
  | 'EMAIL_VERIFIED'
  | 'EMAIL_CHANGE_REQUESTED'
  | 'EMAIL_CHANGED'
  // Account events
  | 'ACCOUNT_DELETED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_UNSUSPENDED'
  | 'OAUTH_LINKED'
  | 'OAUTH_UNLINKED'
  // Content moderation
  | 'CONTENT_FLAGGED_SPAM'
  | 'CONTENT_BLOCKED_RATE_LIMIT'
  | 'CONTENT_BLOCKED_UNVERIFIED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_RESOLVED'
  // Admin actions
  | 'ADMIN_USER_SUSPENDED'
  | 'ADMIN_USER_UNSUSPENDED'
  | 'ADMIN_USER_DELETED'
  | 'ADMIN_GAME_REMOVED'
  | 'ADMIN_CONTENT_REMOVED'
  | 'ADMIN_SETTINGS_CHANGED'
  // Suspicious activity
  | 'SUSPICIOUS_ACTIVITY'
  | 'BOT_DETECTED'
  | 'HONEYPOT_TRIGGERED'
  | 'MULTIPLE_FAILED_ATTEMPTS'
  | 'UNUSUAL_LOCATION'
  | 'SESSION_HIJACK_SUSPECTED';

/**
 * Security event severity levels
 */
export type SecuritySeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Security audit log entry
 */
export interface SecurityAuditEntry {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  details: Record<string, any>;
  success: boolean;
}

/**
 * In-memory audit log store (for MVP)
 * In production, this should be persisted to database or log aggregation service
 */
const auditLogStore: SecurityAuditEntry[] = [];
const MAX_LOG_SIZE = 10000; // Keep last 10k entries in memory

/**
 * Get severity level for event type
 */
function getEventSeverity(eventType: SecurityEventType): SecuritySeverity {
  const severityMap: Record<SecurityEventType, SecuritySeverity> = {
    // Info level
    'LOGIN_SUCCESS': 'info',
    'LOGOUT': 'info',
    'SESSION_CREATED': 'info',
    'SESSION_EXPIRED': 'info',
    'REGISTER_SUCCESS': 'info',
    'PASSWORD_CHANGED': 'info',
    '2FA_ENABLED': 'info',
    '2FA_DISABLED': 'info',
    '2FA_VERIFIED': 'info',
    'EMAIL_VERIFICATION_SENT': 'info',
    'EMAIL_VERIFIED': 'info',
    'EMAIL_CHANGE_REQUESTED': 'info',
    'EMAIL_CHANGED': 'info',
    'OAUTH_LINKED': 'info',
    'OAUTH_UNLINKED': 'info',
    'PASSWORD_RESET_REQUESTED': 'info',
    'PASSWORD_RESET_SUCCESS': 'info',
    'REPORT_SUBMITTED': 'info',
    'REPORT_RESOLVED': 'info',
    'ADMIN_SETTINGS_CHANGED': 'info',
    
    // Warning level
    'LOGIN_FAILURE': 'warning',
    'PASSWORD_RESET_FAILURE': 'warning',
    '2FA_FAILED': 'warning',
    '2FA_BACKUP_USED': 'warning',
    'CONTENT_FLAGGED_SPAM': 'warning',
    'CONTENT_BLOCKED_RATE_LIMIT': 'warning',
    'CONTENT_BLOCKED_UNVERIFIED': 'warning',
    'REGISTER_FAILURE': 'warning',
    'SESSION_REVOKED': 'warning',
    
    // Error level
    'LOGIN_BLOCKED_RATE_LIMIT': 'error',
    'LOGIN_BLOCKED_BOT': 'error',
    'REGISTER_BLOCKED_RATE_LIMIT': 'error',
    'REGISTER_BLOCKED_BOT': 'error',
    'REGISTER_BLOCKED_DISPOSABLE_EMAIL': 'error',
    'BOT_DETECTED': 'error',
    'HONEYPOT_TRIGGERED': 'error',
    'MULTIPLE_FAILED_ATTEMPTS': 'error',
    'SUSPICIOUS_ACTIVITY': 'error',
    'UNUSUAL_LOCATION': 'error',
    'ADMIN_GAME_REMOVED': 'error',
    'ADMIN_CONTENT_REMOVED': 'error',
    
    // Critical level
    'ACCOUNT_DELETED': 'critical',
    'ACCOUNT_SUSPENDED': 'critical',
    'ACCOUNT_UNSUSPENDED': 'critical',
    'SESSION_HIJACK_SUSPECTED': 'critical',
    'ADMIN_USER_SUSPENDED': 'critical',
    'ADMIN_USER_UNSUSPENDED': 'critical',
    'ADMIN_USER_DELETED': 'critical',
  };

  return severityMap[eventType] || 'info';
}

/**
 * Generate unique ID for log entry
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  data: {
    userId?: string;
    sessionId?: string;
    ipAddress: string;
    userAgent?: string;
    endpoint?: string;
    details?: Record<string, any>;
    success?: boolean;
  }
): SecurityAuditEntry {
  const entry: SecurityAuditEntry = {
    id: generateLogId(),
    timestamp: new Date(),
    eventType,
    severity: getEventSeverity(eventType),
    userId: data.userId,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    endpoint: data.endpoint,
    details: data.details || {},
    success: data.success ?? true,
  };

  // Add to in-memory store
  auditLogStore.push(entry);

  // Trim old entries if over limit
  if (auditLogStore.length > MAX_LOG_SIZE) {
    auditLogStore.splice(0, auditLogStore.length - MAX_LOG_SIZE);
  }

  // Console log for monitoring (in production, send to log aggregation)
  const logLevel = entry.severity === 'critical' || entry.severity === 'error' 
    ? 'error' 
    : entry.severity === 'warning' 
    ? 'warn' 
    : 'info';

  console[logLevel](
    `[SECURITY] ${entry.severity.toUpperCase()} - ${eventType}`,
    {
      id: entry.id,
      userId: entry.userId,
      ip: entry.ipAddress,
      endpoint: entry.endpoint,
      success: entry.success,
      details: entry.details,
    }
  );

  return entry;
}

/**
 * Get recent security events
 */
export function getRecentEvents(options?: {
  limit?: number;
  userId?: string;
  eventType?: SecurityEventType;
  severity?: SecuritySeverity;
  since?: Date;
}): SecurityAuditEntry[] {
  let filtered = [...auditLogStore];

  if (options?.userId) {
    filtered = filtered.filter(e => e.userId === options.userId);
  }
  if (options?.eventType) {
    filtered = filtered.filter(e => e.eventType === options.eventType);
  }
  if (options?.severity) {
    filtered = filtered.filter(e => e.severity === options.severity);
  }
  if (options?.since) {
    filtered = filtered.filter(e => e.timestamp >= options.since);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply limit
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Get security events for a specific user
 */
export function getUserSecurityEvents(
  userId: string,
  limit: number = 50
): SecurityAuditEntry[] {
  return getRecentEvents({ userId, limit });
}

/**
 * Get failed login attempts for an IP
 */
export function getFailedLoginAttempts(
  ipAddress: string,
  since: Date
): SecurityAuditEntry[] {
  return auditLogStore.filter(
    e => e.ipAddress === ipAddress &&
      e.eventType === 'LOGIN_FAILURE' &&
      e.timestamp >= since
  );
}

/**
 * Get suspicious activity count for an IP
 */
export function getSuspiciousActivityCount(
  ipAddress: string,
  since: Date
): number {
  const suspiciousTypes: SecurityEventType[] = [
    'LOGIN_FAILURE',
    'LOGIN_BLOCKED_RATE_LIMIT',
    'LOGIN_BLOCKED_BOT',
    'REGISTER_BLOCKED_RATE_LIMIT',
    'REGISTER_BLOCKED_BOT',
    'BOT_DETECTED',
    'HONEYPOT_TRIGGERED',
    'SUSPICIOUS_ACTIVITY',
  ];

  return auditLogStore.filter(
    e => e.ipAddress === ipAddress &&
      suspiciousTypes.includes(e.eventType) &&
      e.timestamp >= since
  ).length;
}

/**
 * Get security summary for admin dashboard
 */
export function getSecuritySummary(hours: number = 24): {
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<SecuritySeverity, number>;
  suspiciousIPs: Array<{ ip: string; count: number }>;
  recentCritical: SecurityAuditEntry[];
} {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recentEvents = auditLogStore.filter(e => e.timestamp >= since);

  // Count by type
  const byType: Record<string, number> = {};
  for (const event of recentEvents) {
    byType[event.eventType] = (byType[event.eventType] || 0) + 1;
  }

  // Count by severity
  const bySeverity: Record<SecuritySeverity, number> = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0,
  };
  for (const event of recentEvents) {
    bySeverity[event.severity]++;
  }

  // Find suspicious IPs
  const ipCounts: Record<string, number> = {};
  const suspiciousTypes: SecurityEventType[] = [
    'LOGIN_FAILURE',
    'LOGIN_BLOCKED_RATE_LIMIT',
    'BOT_DETECTED',
    'HONEYPOT_TRIGGERED',
    'SUSPICIOUS_ACTIVITY',
  ];
  
  for (const event of recentEvents) {
    if (suspiciousTypes.includes(event.eventType)) {
      ipCounts[event.ipAddress] = (ipCounts[event.ipAddress] || 0) + 1;
    }
  }
  
  const suspiciousIPs = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .filter(item => item.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent critical events
  const recentCritical = recentEvents
    .filter(e => e.severity === 'critical')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return {
    totalEvents: recentEvents.length,
    byType,
    bySeverity,
    suspiciousIPs,
    recentCritical,
  };
}

/**
 * Clear old audit logs (for cleanup)
 */
export function clearOldLogs(olderThan: Date): number {
  const before = auditLogStore.length;
  const filtered = auditLogStore.filter(e => e.timestamp >= olderThan);
  auditLogStore.length = 0;
  auditLogStore.push(...filtered);
  return before - auditLogStore.length;
}

/**
 * Export logs for backup/analysis
 */
export function exportLogs(since?: Date): SecurityAuditEntry[] {
  if (since) {
    return auditLogStore.filter(e => e.timestamp >= since);
  }
  return [...auditLogStore];
}

