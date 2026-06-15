import dayjs from 'dayjs';

import { isSystemMaintenanceAlertOpen } from '../utils';

describe('isSystemMaintenanceAlertOpen', () => {
  const fixedNow = new Date('2026-06-12T17:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(fixedNow);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    {
      scenario: 'config is null',
      config: null,
      expected: false,
    },
    {
      scenario: 'enabled flag is false',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: false,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
      },
      expected: false,
    },
    {
      scenario: 'message is empty',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: '',
      },
      expected: false,
    },
    {
      scenario: 'enabled with message and no date bounds',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
      },
      expected: true,
    },
    {
      scenario: 'now is between start and end timestamps',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_START_TIMESTAMP: dayjs(fixedNow).subtract(1, 'hour').toISOString(),
        MAINTENANCE_ALERT_END_TIMESTAMP: dayjs(fixedNow).add(1, 'hour').toISOString(),
      },
      expected: true,
    },
    {
      scenario: 'now is outside start/end window',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_START_TIMESTAMP: dayjs(fixedNow).add(1, 'hour').toISOString(),
        MAINTENANCE_ALERT_END_TIMESTAMP: dayjs(fixedNow).add(2, 'hour').toISOString(),
      },
      expected: false,
    },
    {
      scenario: 'start-only window when now is after start',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_START_TIMESTAMP: dayjs(fixedNow).subtract(1, 'hour').toISOString(),
      },
      expected: true,
    },
    {
      scenario: 'start-only window when now is before start',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_START_TIMESTAMP: dayjs(fixedNow).add(1, 'hour').toISOString(),
      },
      expected: false,
    },
    {
      scenario: 'end-only window when now is before end',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_END_TIMESTAMP: dayjs(fixedNow).add(1, 'hour').toISOString(),
      },
      expected: true,
    },
    {
      scenario: 'end-only window when now is after end',
      config: {
        IS_MAINTENANCE_ALERT_ENABLED: true,
        MAINTENANCE_ALERT_MESSAGE: 'Message',
        MAINTENANCE_ALERT_END_TIMESTAMP: dayjs(fixedNow).subtract(1, 'hour').toISOString(),
      },
      expected: false,
    },
  ])('returns $expected when $scenario', ({ config, expected }) => {
    expect(isSystemMaintenanceAlertOpen(config)).toBe(expected);
  });
});
