// ─── Navegação ──────────────────────────────────────────

export enum PageRoute {
  LANDING = 'landing',
  LOGIN = 'login',
  REGISTER = 'register',
  SYSTEM_CREATION = 'system-creation',
}

// ─── Autenticação ───────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ClinicData {
  clinicName: string;
  cnpj: string;
  specialty: string;
  phone: string;
  address: AddressData;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  clinic: ClinicData;
}

export interface User {
  id: string;
  name: string;
  email: string;
  clinic: ClinicData;
}

// ─── Modo de Criação ────────────────────────────────────

export type SystemCreationMode = 'guided';

// ─── System Blueprint (Objeto Final) ────────────────────

export type PaletteOption = 'green' | 'blue' | 'red';
export type LogoType = 'custom' | 'generic';
export type DeploymentType = 'web' | 'desktop';
export type EnvironmentType = 'aws' | 'azure' | 'local';
export type AssistantScope = 'global' | 'per-doctor';
export type ImplementationType = 'managed';

export interface IdentityConfig {
  logoType: LogoType;
  logoFile: string | null;       // base64 data URL ou null
  logoFileName: string | null;
  palette: PaletteOption;
  clinicName: string;
}

export interface DoctorPatientRecordFeatures {
  enabled: boolean;
  files: boolean;
  allergies: boolean;
  fileUpload: boolean;
  aiEcg: boolean;
  prescriptions: boolean;
  prescriptionTemplate: boolean;
  digitalSignature: boolean;
  stampedPrescription: boolean;
  medicationControl: boolean;
}

export interface DoctorFeatures {
  dashboard: boolean;
  patientList: boolean;
  patientRecord: DoctorPatientRecordFeatures;
  consultationHistory: boolean;
  schedule: boolean;
}

export interface DoctorModule {
  enabled: boolean;
  features: DoctorFeatures;
}

export interface AssistantFeatures {
  scheduling: boolean;
  doctorScheduleView: boolean;
  patientManagement: boolean;
  billing: boolean;
  insurancePlans: boolean;
  checkInOut: boolean;
  billingCheckControl: boolean;
}

export interface AssistantModule {
  enabled: boolean;
  scope: AssistantScope;
  features: AssistantFeatures;
}

export interface ManagementFeatures {
  doctorSchedules: boolean;
  attendanceControl: boolean;
  staffRegistration: boolean;
  billingControl: boolean;
  billingByDoctor: boolean;
  systemCost: boolean;
  dashboards: boolean;
}

export interface ManagementModule {
  enabled: boolean;
  features: ManagementFeatures;
}

export interface SharedModule {
  settings: boolean;
}

export interface ModulesConfig {
  doctor: DoctorModule;
  assistant: AssistantModule;
  management: ManagementModule;
  shared: SharedModule;
}

export interface SizingConfig {
  minPatients: number;
  maxPatients: number;
  avgDoctors: number;
  avgAssistants: number;
}

export interface PriceEstimate {
  monthly: number;
  setup: number;
  currency: 'BRL';
}

export interface TechnicalConfig {
  deploymentType: DeploymentType;
  environment: EnvironmentType;
  hasDisasterRecovery: boolean;
  drSecondaryEnv: EnvironmentType | null;
  sizing: SizingConfig;
  estimatedPrice: PriceEstimate;
}

export interface ImplementationConfig {
  type: ImplementationType;
  address: string;
}

export interface SystemBlueprint {
  id: string;
  version: string;
  createdAt: string;
  identity: IdentityConfig;
  modules: ModulesConfig;
  technical: TechnicalConfig;
  implementation: ImplementationConfig;
}

// ─── Wizard Steps ───────────────────────────────────────

export type GuidedStep = 0 | 1 | 2 | 3;

export const GUIDED_STEP_LABELS = [
  'Identidade Visual',
  'Módulos do Sistema',
  'Questões Técnicas',
  'Finalização',
] as const;
