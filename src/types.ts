export type DemoRole = 'manager' | 'caregiver' | 'clinician' | 'family';

export type MedicationStatus =
  | 'pending'
  | 'administered'
  | 'declined'
  | 'withheld'
  | 'missed'
  | 'not_confirmed';

export interface Resident {
  id: string;
  name: string;
  age: number;
  room: string;
  careLevel: 'Standard' | 'Enhanced' | 'High support';
  familyName: string;
  familyEmail: string;
  shareWithFamily: boolean;
  notes: string;
}

export interface MedicationEvent {
  id: string;
  residentId: string;
  medication: string;
  dose: string;
  dueMinutes: number;
  status: MedicationStatus;
  recordedAt?: number;
  recordedBy?: string;
  note?: string;
}

export interface HealthReading {
  id: string;
  residentId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  activity: number;
  measuredAt: number;
  source: string;
  reviewed: boolean;
  followUp?: string;
}

export interface AuditEntry {
  id: string;
  time: number;
  actor: string;
  action: string;
  detail: string;
}

export interface FinancialInputs {
  acquisitionMultiplier: number;
  servicingMultiplier: number;
  siteFee: number;
  residentFee: number;
  residentsPerSite: number;
}

export interface FinancialYear {
  year: number;
  newInstitutions: number;
  yearEndInstitutions: number;
  averageActiveInstitutions: number;
  subscriptionRevenue: number;
  implementationRevenue: number;
  hardwareRevenue: number;
  totalRevenue: number;
  servicingCosts: number;
  hardwareCosts: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  capitalExpenditure: number;
  netCashFlow: number;
  openingCash: number;
  closingCash: number;
}
