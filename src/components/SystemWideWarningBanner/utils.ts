import dayjs from '@/utils/dayjs';

/**
 * Check if system maintenance alert is open, based on configuration.
 * @param {Object} config
 * @returns {boolean}
 */
export function isSystemMaintenanceAlertOpen(config): boolean {
  if (!config) {
    return false;
  }
  const isEnabledWithMessage = (
    config.IS_MAINTENANCE_ALERT_ENABLED && config.MAINTENANCE_ALERT_MESSAGE
  );
  if (!isEnabledWithMessage) {
    return false;
  }
  const startTimestamp = config.MAINTENANCE_ALERT_START_TIMESTAMP;
  const endTimestamp = config.MAINTENANCE_ALERT_END_TIMESTAMP;
  if (startTimestamp && endTimestamp) {
    return dayjs().isBetween(dayjs(startTimestamp), dayjs(endTimestamp));
  }
  if (startTimestamp) {
    return dayjs().isAfter(dayjs(startTimestamp));
  }
  if (endTimestamp) {
    return dayjs().isBefore(dayjs(endTimestamp));
  }

  // Given no start timestamp and no end timestamp, the system maintenance alert should be open, as
  // it's enabled and has a message.
  return true;
}
