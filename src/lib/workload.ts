import type { Asignacion, Persona } from '../types';

export type EstadoSemaforo = 'holgura' | 'ok' | 'sobrecarga';

/**
 * Clasifica la carga total según el semáforo del equipo:
 *  - < 70        -> 'holgura'
 *  - 70..100     -> 'ok'
 *  - > 100       -> 'sobrecarga'
 */
export function estadoSemaforo(totalPct: number): EstadoSemaforo {
  if (totalPct < 70) return 'holgura';
  if (totalPct <= 100) return 'ok';
  return 'sobrecarga';
}

export interface CargaPersona {
  persona: Persona;
  totalPct: number;
  estado: EstadoSemaforo;
  numAsignaciones: number;
}

/**
 * Carga total por persona = suma simple de dedicacionPct de sus asignaciones
 * (sin ponderar solapamiento temporal). Ordenada por carga descendente.
 */
export function cargaPorPersona(
  asignaciones: Asignacion[],
  personas: Persona[],
): CargaPersona[] {
  return personas
    .map((persona) => {
      const propias = asignaciones.filter((a) => a.personaId === persona.id);
      const totalPct = propias.reduce((sum, a) => sum + a.dedicacionPct, 0);
      return {
        persona,
        totalPct,
        estado: estadoSemaforo(totalPct),
        numAsignaciones: propias.length,
      };
    })
    .sort((a, b) => b.totalPct - a.totalPct);
}
