import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type { Asignacion, CasoUso, Persona, SeedData } from '../types';

const STORAGE_KEY = 'ai-team-assignments:v1';

export interface AppState {
  personas: Persona[];
  casosUso: CasoUso[];
  asignaciones: Asignacion[];
  status: 'loading' | 'ready' | 'error';
  error?: string;
}

type Action =
  | { type: 'LOAD_OK'; payload: SeedData }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_ASSIGNMENT'; payload: Asignacion }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Asignacion }
  | { type: 'DELETE_ASSIGNMENT'; id: string }
  | { type: 'ADD_PERSONA'; payload: Persona }
  | { type: 'UPDATE_PERSONA'; payload: Persona }
  | { type: 'DELETE_PERSONA'; id: string }
  | { type: 'ADD_CASO'; payload: CasoUso }
  | { type: 'UPDATE_CASO'; payload: CasoUso }
  | { type: 'DELETE_CASO'; id: string };

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

    case 'ADD_PERSONA':
      return { ...state, personas: [...state.personas, action.payload] };
    case 'UPDATE_PERSONA':
      return {
        ...state,
        personas: state.personas.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case 'DELETE_PERSONA':
      return {
        ...state,
        personas: state.personas.filter((p) => p.id !== action.id),
      };

    case 'ADD_CASO':
      return { ...state, casosUso: [...state.casosUso, action.payload] };
    case 'UPDATE_CASO':
      return {
        ...state,
        casosUso: state.casosUso.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case 'DELETE_CASO':
      return {
        ...state,
        casosUso: state.casosUso.filter((c) => c.id !== action.id),
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
  addPersona: (p: Persona) => void;
  updatePersona: (p: Persona) => void;
  deletePersona: (id: string) => void;
  addCaso: (c: CasoUso) => void;
  updateCaso: (c: CasoUso) => void;
  deleteCaso: (id: string) => void;
  reiniciarDesdeSeed: () => void;
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

function leerLocalStorage(): SeedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSeed(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function guardarLocalStorage(state: AppState): void {
  if (state.status !== 'ready') return;
  try {
    const data: SeedData = {
      personas: state.personas,
      casosUso: state.casosUso,
      asignaciones: state.asignaciones,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* localStorage no disponible: se ignora silenciosamente */
  }
}

async function cargarSeed(): Promise<SeedData> {
  const res = await fetch(`${import.meta.env.BASE_URL}seed.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!isValidSeed(data)) {
    throw new Error('El formato de seed.json no es válido.');
  }
  return data;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Carga inicial: primero localStorage, si no existe se recurre al seed.
  useEffect(() => {
    let cancelled = false;

    const guardado = leerLocalStorage();
    if (guardado) {
      dispatch({ type: 'LOAD_OK', payload: guardado });
      return;
    }

    (async () => {
      try {
        const data = await cargarSeed();
        if (!cancelled) dispatch({ type: 'LOAD_OK', payload: data });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Error desconocido';
          dispatch({ type: 'LOAD_ERROR', error: msg });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persistencia: guarda en cada cambio del estado listo.
  useEffect(() => {
    guardarLocalStorage(state);
  }, [state]);

  const value: AppContextValue = {
    state,
    addAsignacion: (a) => dispatch({ type: 'ADD_ASSIGNMENT', payload: a }),
    updateAsignacion: (a) => dispatch({ type: 'UPDATE_ASSIGNMENT', payload: a }),
    deleteAsignacion: (id) => dispatch({ type: 'DELETE_ASSIGNMENT', id }),
    addPersona: (p) => dispatch({ type: 'ADD_PERSONA', payload: p }),
    updatePersona: (p) => dispatch({ type: 'UPDATE_PERSONA', payload: p }),
    deletePersona: (id) => dispatch({ type: 'DELETE_PERSONA', id }),
    addCaso: (c) => dispatch({ type: 'ADD_CASO', payload: c }),
    updateCaso: (c) => dispatch({ type: 'UPDATE_CASO', payload: c }),
    deleteCaso: (id) => dispatch({ type: 'DELETE_CASO', id }),
    reiniciarDesdeSeed: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      cargarSeed()
        .then((data) => dispatch({ type: 'LOAD_OK', payload: data }))
        .catch((e) => {
          const msg = e instanceof Error ? e.message : 'Error desconocido';
          dispatch({ type: 'LOAD_ERROR', error: msg });
        });
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de <AppProvider>.');
  return ctx;
}
