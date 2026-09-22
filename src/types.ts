export type RiesgoNIST = 'bajo' | 'medio' | 'alto';

export const NIVELES_RIESGO: RiesgoNIST[] = ['bajo', 'medio', 'alto'];

export interface Persona {
  id: string;
  nombre: string;
  rol: string;
}

export interface CasoUso {
  id: string;
  nombre: string;
  riesgoNIST: RiesgoNIST;
  descripcion: string;
}

export interface Asignacion {
  id: string;
  personaId: string;
  casoUsoId: string;
  /** Porcentaje de dedicación (1..100). */
  dedicacionPct: number;
  /** Fecha ISO 'YYYY-MM-DD'. */
  desde: string;
  /** Fecha ISO 'YYYY-MM-DD'. */
  hasta: string;
}

export interface SeedData {
  personas: Persona[];
  casosUso: CasoUso[];
  asignaciones: Asignacion[];
}
