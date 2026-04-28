'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/app/services/api';
import { useAuth } from '@/app/contexts/AuthContext';
import type {
  SystemBlueprint,
  IdentityConfig,
  ModulesConfig,
  TechnicalConfig,
  ImplementationConfig,
  GuidedStep,
} from '@/app/types';

// ─── Default Values ─────────────────────────────────────

const DEFAULT_IDENTITY: IdentityConfig = {
  logoType: 'generic',
  logoFile: null,
  logoFileName: null,
  palette: 'green',
  clinicName: '',
};

const DEFAULT_MODULES: ModulesConfig = {
  doctor: {
    enabled: true,
    features: {
      dashboard: true,
      patientList: true,
      patientRecord: {
        enabled: true,
        files: true,
        allergies: true,
        fileUpload: true,
        aiEcg: false,
        prescriptions: true,
        prescriptionTemplate: false,
        digitalSignature: true,
        stampedPrescription: true,
        medicationControl: true,
      },
      consultationHistory: true,
      schedule: true,
    },
  },
  assistant: {
    enabled: true,
    scope: 'global',
    features: {
      scheduling: true,
      doctorScheduleView: true,
      patientManagement: true,
      billing: true,
      insurancePlans: true,
      checkInOut: true,
      billingCheckControl: true,
    },
  },
  management: {
    enabled: true,
    features: {
      doctorSchedules: true,
      attendanceControl: true,
      staffRegistration: true,
      billingControl: true,
      billingByDoctor: true,
      systemCost: true,
      dashboards: true,
    },
  },
  shared: {
    settings: true,
  },
};

const DEFAULT_TECHNICAL: TechnicalConfig = {
  deploymentType: 'web',
  environment: 'aws',
  hasDisasterRecovery: false,
  drSecondaryEnv: null,
  sizing: {
    minPatients: 50,
    maxPatients: 150,
    avgDoctors: 3,
    avgAssistants: 2,
  },
  estimatedPrice: {
    monthly: 0,
    setup: 0,
    currency: 'BRL',
  },
};

const DEFAULT_IMPLEMENTATION: ImplementationConfig = {
  type: 'managed',
  address: '',
};

// ─── Api helpers ───────────────────────────────

async function loadProjectsFromApi(token: string): Promise<SystemBlueprint[]> {
  try {
    const data = await api.listProjects(token);
    // Para simplificar, a API atualmente retorna chaves de string (prefixos).
    // Num cenário ideal, a API retornaria os JSONs completos.
    // Como a API atual só lista nomes de objetos, podemos ignorar a extração detalhada
    // se não houver um endpoint que retorne o conteúdo do arquivo.
    // MAS, vamos deixar este stub pronto.
    return data.projects || [];
  } catch (err) {
    console.error('Falha ao carregar projetos da API', err);
    return [];
  }
}

async function saveProjectToApi(token: string, project: SystemBlueprint) {
  try {
    await api.createProject(token, project);
  } catch (err) {
    console.error('Falha ao salvar projeto na API', err);
    throw err;
  }
}

async function deleteProjectFromApi(token: string, id: string) {
  try {
    await api.deleteProject(token, id);
  } catch (err) {
    console.error('Falha ao deletar projeto da API', err);
    throw err;
  }
}

// ─── State & Actions ────────────────────────────────────

interface SystemConfigState {
  currentStep: GuidedStep;
  identity: IdentityConfig;
  modules: ModulesConfig;
  technical: TechnicalConfig;
  implementation: ImplementationConfig;
  projects: SystemBlueprint[];
}

type SystemConfigAction =
  | { type: 'SET_STEP'; step: GuidedStep }
  | { type: 'UPDATE_IDENTITY'; payload: Partial<IdentityConfig> }
  | { type: 'UPDATE_MODULES'; payload: Partial<ModulesConfig> }
  | { type: 'UPDATE_TECHNICAL'; payload: Partial<TechnicalConfig> }
  | { type: 'UPDATE_IMPLEMENTATION'; payload: Partial<ImplementationConfig> }
  | { type: 'SAVE_PROJECT'; project: SystemBlueprint }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'LOAD_PROJECTS'; projects: SystemBlueprint[] }
  | { type: 'RESET' };

const INITIAL_STATE: SystemConfigState = {
  currentStep: 0,
  identity: DEFAULT_IDENTITY,
  modules: DEFAULT_MODULES,
  technical: DEFAULT_TECHNICAL,
  implementation: DEFAULT_IMPLEMENTATION,
  projects: [],
};

function systemConfigReducer(
  state: SystemConfigState,
  action: SystemConfigAction,
): SystemConfigState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'UPDATE_IDENTITY':
      return { ...state, identity: { ...state.identity, ...action.payload } };

    case 'UPDATE_MODULES':
      return {
        ...state,
        modules: deepMerge(state.modules, action.payload),
      };

    case 'UPDATE_TECHNICAL':
      return {
        ...state,
        technical: deepMerge(state.technical, action.payload),
      };

    case 'UPDATE_IMPLEMENTATION':
      return {
        ...state,
        implementation: { ...state.implementation, ...action.payload },
      };

    case 'SAVE_PROJECT': {
      const newProjects = [...state.projects, action.project];
      return { ...state, projects: newProjects };
    }

    case 'DELETE_PROJECT': {
      const filtered = state.projects.filter((p) => p.id !== action.id);
      return { ...state, projects: filtered };
    }

    case 'LOAD_PROJECTS':
      return { ...state, projects: action.projects };

    case 'RESET':
      return { ...INITIAL_STATE, projects: state.projects };

    default:
      return state;
  }
}

// ─── Deep Merge Utility ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as any;

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

    const sourceVal = source[key];
    const targetVal = (target as any)[key];

    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result as T;
}

// ─── Context ────────────────────────────────────────────

interface SystemConfigContextType {
  state: SystemConfigState;
  setStep: (step: GuidedStep) => void;
  updateIdentity: (payload: Partial<IdentityConfig>) => void;
  updateModules: (payload: Partial<ModulesConfig>) => void;
  updateTechnical: (payload: Partial<TechnicalConfig>) => void;
  updateImplementation: (payload: Partial<ImplementationConfig>) => void;
  reset: () => void;
  generateBlueprint: () => SystemBlueprint;
  saveProject: () => Promise<SystemBlueprint>;
  deleteProject: (id: string) => Promise<void>;
  goNext: () => void;
  goBack: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(
  undefined,
);

// ─── Provider ───────────────────────────────────────────

interface SystemConfigProviderProps {
  children: ReactNode;
}

export function SystemConfigProvider({ children }: SystemConfigProviderProps) {
  const [state, dispatch] = useReducer(systemConfigReducer, INITIAL_STATE);
  const { token, isAuthenticated } = useAuth();

  // Load projects from API on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadProjectsFromApi(token).then((projects) => {
        // Atualmente o back-end retorna só a lista de strings. Se estivéssemos retornando o objeto completo, populariamos o estado
        if (projects && projects.length > 0) {
          dispatch({ type: 'LOAD_PROJECTS', projects });
        }
      });
    } else {
      dispatch({ type: 'LOAD_PROJECTS', projects: [] });
    }
  }, [isAuthenticated, token]);

  const setStep = useCallback(
    (step: GuidedStep) => dispatch({ type: 'SET_STEP', step }),
    [],
  );

  const updateIdentity = useCallback(
    (payload: Partial<IdentityConfig>) =>
      dispatch({ type: 'UPDATE_IDENTITY', payload }),
    [],
  );

  const updateModules = useCallback(
    (payload: Partial<ModulesConfig>) =>
      dispatch({ type: 'UPDATE_MODULES', payload }),
    [],
  );

  const updateTechnical = useCallback(
    (payload: Partial<TechnicalConfig>) =>
      dispatch({ type: 'UPDATE_TECHNICAL', payload }),
    [],
  );

  const updateImplementation = useCallback(
    (payload: Partial<ImplementationConfig>) =>
      dispatch({ type: 'UPDATE_IMPLEMENTATION', payload }),
    [],
  );

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const generateBlueprint = useCallback((): SystemBlueprint => {
    return {
      id: uuidv4(),
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      identity: state.identity,
      modules: state.modules,
      technical: state.technical,
      implementation: state.implementation,
    };
  }, [state]);

  const saveProject = useCallback(async (): Promise<SystemBlueprint> => {
    if (!token) throw new Error('Não autorizado');
    const blueprint = generateBlueprint();
    await saveProjectToApi(token, blueprint);
    dispatch({ type: 'SAVE_PROJECT', project: blueprint });
    return blueprint;
  }, [generateBlueprint, token]);

  const deleteProject = useCallback(async (id: string) => {
    if (!token) return;
    await deleteProjectFromApi(token, id);
    dispatch({ type: 'DELETE_PROJECT', id });
  }, [token]);

  const goNext = useCallback(() => {
    if (state.currentStep < 3) {
      dispatch({ type: 'SET_STEP', step: (state.currentStep + 1) as GuidedStep });
    }
  }, [state.currentStep]);

  const goBack = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', step: (state.currentStep - 1) as GuidedStep });
    }
  }, [state.currentStep]);

  const canGoNext = state.currentStep < 3;
  const canGoBack = state.currentStep > 0;

  const value = useMemo(
    () => ({
      state,
      setStep,
      updateIdentity,
      updateModules,
      updateTechnical,
      updateImplementation,
      reset,
      generateBlueprint,
      saveProject,
      deleteProject,
      goNext,
      goBack,
      canGoNext,
      canGoBack,
    }),
    [
      state,
      setStep,
      updateIdentity,
      updateModules,
      updateTechnical,
      updateImplementation,
      reset,
      generateBlueprint,
      saveProject,
      deleteProject,
      goNext,
      goBack,
      canGoNext,
      canGoBack,
    ],
  );

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────

export function useSystemConfig(): SystemConfigContextType {
  const context = useContext(SystemConfigContext);

  if (!context) {
    throw new Error(
      'useSystemConfig deve ser utilizado dentro de um SystemConfigProvider',
    );
  }

  return context;
}
