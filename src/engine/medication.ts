import type { HealthReading, MedicationEvent, MedicationStatus } from '../types';

export function isOverdue(event: MedicationEvent, simulatedMinutes: number): boolean {
  return event.status === 'pending' && simulatedMinutes >= event.dueMinutes + 10;
}

export function getMedicationDisplayStatus(
  event: MedicationEvent,
  simulatedMinutes: number,
): MedicationStatus | 'overdue' {
  return isOverdue(event, simulatedMinutes) ? 'overdue' : event.status;
}

/**
 * Illustrative demo thresholds only. They are not clinical guidance and must
 * not be used to make care decisions.
 */
export function getHealthFlags(reading: HealthReading): string[] {
  const flags: string[] = [];
  if (reading.systolic >= 160 || reading.systolic < 90) flags.push('Systolic review threshold');
  if (reading.diastolic >= 100 || reading.diastolic < 55) flags.push('Diastolic review threshold');
  if (reading.heartRate > 110 || reading.heartRate < 50) flags.push('Heart-rate review threshold');
  return flags;
}

export function formatClock(minutes: number): string {
  const safe = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(safe / 60).toString().padStart(2, '0');
  const mins = (safe % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}
