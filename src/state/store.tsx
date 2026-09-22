import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { Asignacion, SeedData } from '../types';

export interface AppState {
  personas: SeedData['personas'];
  casosUso: SeedData['casosUso'];
  asignaciones: Asignacion[];
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

type Action =
  | { type: 'LOAD_OK'; payload: SeedData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Asignacion }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Asignacion }
  | { type: 'DELETE_ASSIGNMENT'; id: string };

const initialState: AppState = {
  personas: [],
  casosUso: [],
  asignaciones: [],
  status: 'loading',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_OK':
      return {
        ...state,
        personas: action.payload.personas,
        casosUso: action.payload.casosUso,
        asignaciones: action.payload.asignaciones,
        status: 'ready',
        error: undefined,
      };
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'ADD_ASSIGNMENT':
      return { ...state, asignaciones: [...state.asignaciones, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        asignaciones: state.asignaciones.map((a) =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        asignaciones: state.asignaciones.filter((a) => a.id !== action.id),
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addAsignacion: (a: Asignacion) => void;
  updateAsignacion: (a: Asignacion) => void;
  deleteAsignacion: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function isValidSeed(data: unknown): data is SeedData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    Array.isArray(d.personas) &&
    Array.isArray(d.casosUso) &&
    Array.isArray(d.asignaciones)
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}seed.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (!isValidSeed(data)) {
          throw new Error('El formato de seed.json no es válido.');
        }
        if (!cancelled) dispatch({ type: 'LOAD_OK', payload: data });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Error desconocido';
          dispatch({ type: 'LOAD_ERROR', error: msg });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AppContextValue = {
    state,
    addAsignacion: (a) => dispatch({ type: 'ADD_ASSIGNMENT', payload: a }),
    updateAsignacion: (a) => dispatch({ type: 'UPDATE_ASSIGNMENT', payload: a }),
    deleteAsignacion: (id) => dispatch({ type: 'DELETE_ASSIGNMENT', id }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de <AppProvider>.');
  return ctx;
}
