import type { Asignacion, CasoUso, RiesgoNIST } from '../types';
import { NIVELES_RIESGO } from '../types';

export type CapacidadPorRiesgo = Record<RiesgoNIST, number>;

/**
 * Agrega la dedicación total del equipo por nivel de riesgo NIST.
 * Los niveles sin asignaciones aparecen con valor 0.
 */
export function capacidadPorRiesgo(
  asignaciones: Asignacion[],
  casosUso: CasoUso[],
): CapacidadPorRiesgo {
  const riesgoDeCaso = new Map<string, RiesgoNIST>(
    casosUso.map((c) => [c.id, c.riesgoNIST]),
  );

  const base: CapacidadPorRiesgo = { bajo: 0, medio: 0, alto: 0 };

  for (const a of asignaciones) {
    const riesgo = riesgoDeCaso.get(a.casoUsoId);
    if (riesgo) base[riesgo] += a.dedicacionPct;
  }

  return base;
}

/** Total agregado de dedicación sobre todos los niveles de riesgo. */
export function totalCapacidad(cap: CapacidadPorRiesgo): number {
  return NIVELES_RIESGO.reduce((sum, nivel) => sum + cap[nivel], 0);
}
