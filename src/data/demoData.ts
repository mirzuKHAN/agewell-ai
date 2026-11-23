import type { AuditEntry, HealthReading, MedicationEvent, Resident } from '../types';

// All names and records below are fictional demonstration data.
export const DEMO_RESIDENTS: Resident[] = [
  {
    id: 'R-001', name: 'Chan Mei Ling', age: 82, room: 'A-12', careLevel: 'Enhanced',
    familyName: 'Wong family', familyEmail: 'family.wong@example.test', shareWithFamily: true,
    notes: 'Prefers Cantonese reminders. Family updates approved.',
  },
  {
    id: 'R-002', name: 'Lee Wai Ming', age: 79, room: 'A-14', careLevel: 'Standard',
    familyName: 'Lee family', familyEmail: 'family.lee@example.test', shareWithFamily: true,
    notes: 'Medication schedule verified by authorised staff.',
  },
  {
    id: 'R-003', name: 'Ho Suk Yin', age: 88, room: 'B-03', careLevel: 'High support',
    familyName: 'Ho family', familyEmail: 'family.ho@example.test', shareWithFamily: false,
    notes: 'Family sharing has not been enabled for this demo record.',
  },
  {
    id: 'R-004', name: 'Lau Kin Fai', age: 76, room: 'B-08', careLevel: 'Standard',
    familyName: 'Lau family', familyEmail: 'family.lau@example.test', shareWithFamily: true,
    notes: 'Uses large-text interface.',
  },
  {
    id: 'R-005', name: 'Yip Sze Ching', age: 84, room: 'C-02', careLevel: 'Enhanced',
    familyName: 'Yip family', familyEmail: 'family.yip@example.test', shareWithFamily: false,
    notes: 'No family portal access configured in this demo.',
  },
  {
    id: 'R-006', name: 'Mak Chun Kit', age: 81, room: 'C-11', careLevel: 'Standard',
    familyName: 'Mak family', familyEmail: 'family.mak@example.test', shareWithFamily: true,
    notes: 'Routine monitoring only.',
  },
];

export const DEMO_MEDICATION_EVENTS: MedicationEvent[] = [
  { id: 'MED-001', residentId: 'R-001', medication: 'Amlodipine', dose: '5 mg', dueMinutes: 9 * 60, status: 'pending' },
  { id: 'MED-002', residentId: 'R-002', medication: 'Metformin', dose: '500 mg', dueMinutes: 9 * 60, status: 'pending' },
  { id: 'MED-003', residentId: 'R-003', medication: 'Vitamin D', dose: '1,000 IU', dueMinutes: 9 * 60 + 15, status: 'pending' },
  { id: 'MED-004', residentId: 'R-004', medication: 'Losartan', dose: '50 mg', dueMinutes: 8 * 60 + 30, status: 'administered', recordedAt: 8 * 60 + 34, recordedBy: 'Caregiver A' },
  { id: 'MED-005', residentId: 'R-005', medication: 'Calcium supplement', dose: '600 mg', dueMinutes: 10 * 60, status: 'pending' },
  { id: 'MED-006', residentId: 'R-006', medication: 'Metformin', dose: '500 mg', dueMinutes: 10 * 60 + 30, status: 'pending' },
  { id: 'MED-007', residentId: 'R-001', medication: 'Eye drops', dose: '1 drop', dueMinutes: 11 * 60, status: 'pending' },
  { id: 'MED-008', residentId: 'R-002', medication: 'Vitamin B complex', dose: '1 tablet', dueMinutes: 8 * 60, status: 'declined', recordedAt: 8 * 60 + 5, recordedBy: 'Caregiver B', note: 'Resident declined; follow-up recorded.' },
];

export const DEMO_HEALTH_READINGS: HealthReading[] = [
  { id: 'HR-001', residentId: 'R-001', systolic: 138, diastolic: 82, heartRate: 76, activity: 42, measuredAt: 8 * 60 + 15, source: 'Demo BP monitor', reviewed: true, followUp: 'Reviewed; no further action recorded.' },
  { id: 'HR-002', residentId: 'R-002', systolic: 168, diastolic: 94, heartRate: 96, activity: 28, measuredAt: 8 * 60 + 25, source: 'Demo BP monitor', reviewed: false },
  { id: 'HR-003', residentId: 'R-003', systolic: 124, diastolic: 78, heartRate: 112, activity: 18, measuredAt: 8 * 60 + 32, source: 'Demo wearable', reviewed: false },
  { id: 'HR-004', residentId: 'R-004', systolic: 118, diastolic: 72, heartRate: 68, activity: 55, measuredAt: 8 * 60 + 40, source: 'Demo BP monitor', reviewed: true, followUp: 'Reviewed as part of routine checks.' },
  { id: 'HR-005', residentId: 'R-005', systolic: 132, diastolic: 80, heartRate: 82, activity: 31, measuredAt: 8 * 60 + 45, source: 'Demo wearable', reviewed: true },
  { id: 'HR-006', residentId: 'R-006', systolic: 126, diastolic: 76, heartRate: 74, activity: 48, measuredAt: 8 * 60 + 50, source: 'Demo BP monitor', reviewed: true },
];

export const DEMO_AUDIT: AuditEntry[] = [
  { id: 'LOG-001', time: 8 * 60 + 50, actor: 'System', action: 'Demo environment opened', detail: 'Synthetic care-home dataset loaded.' },
  { id: 'LOG-002', time: 8 * 60 + 40, actor: 'Caregiver A', action: 'Medication event recorded', detail: 'Losartan for resident R-004 marked as administered.' },
  { id: 'LOG-003', time: 8 * 60 + 32, actor: 'Monitoring service', action: 'Measurement received', detail: 'A synthetic heart-rate reading was added for resident R-003.' },
];

export const WEEKLY_MEDICATION_DATA = [
  { day: 'Mon', recorded: 92, due: 98 },
  { day: 'Tue', recorded: 95, due: 99 },
  { day: 'Wed', recorded: 91, due: 97 },
  { day: 'Thu', recorded: 96, due: 100 },
  { day: 'Fri', recorded: 94, due: 98 },
  { day: 'Sat', recorded: 97, due: 99 },
  { day: 'Sun', recorded: 94, due: 100 },
];

export const HEALTH_TREND_DATA = [
  { time: '04:00', systolic: 128, heartRate: 72 },
  { time: '05:00', systolic: 131, heartRate: 75 },
  { time: '06:00', systolic: 129, heartRate: 73 },
  { time: '07:00', systolic: 134, heartRate: 78 },
  { time: '08:00', systolic: 138, heartRate: 76 },
  { time: '09:00', systolic: 132, heartRate: 74 },
];
