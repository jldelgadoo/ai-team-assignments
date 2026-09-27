import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { capacidadPorRiesgo, totalCapacidad } from './risk';
import { NIVELES_RIESGO } from '../types';
import { escenarioArb } from './arbitraries';

/**
 * Property-based tests para la agregación de capacidad por nivel de riesgo NIST.
 * Propiedades derivadas de los requisitos 5.x del proyecto.
 */

describe('capacidadPorRiesgo — propiedades', () => {
  // REQ 5.3: los niveles sin asignaciones aparecen con valor 0 (nunca ausentes).
  it('siempre expone los tres niveles NIST con valores no negativos', () => {
    fc.assert(
      fc.property(escenarioArb, ({ asignaciones, casosUso }) => {
        const cap = capacidadPorRiesgo(asignaciones, casosUso);
        return NIVELES_RIESGO.every(
          (nivel) => typeof cap[nivel] === 'number' && cap[nivel] >= 0,
        );
      }),
    );
  });

  // REQ 5.1: agrega la dedicación por nivel de riesgo del caso asociado.
  it('la capacidad de cada nivel = suma de dedicación de asignaciones cuyo caso tiene ese riesgo', () => {
    fc.assert(
      fc.property(escenarioArb, ({ asignaciones, casosUso }) => {
        const cap = capacidadPorRiesgo(asignaciones, casosUso);
        const riesgoDeCaso = new Map(casosUso.map((c) => [c.id, c.riesgoNIST]));
        for (const nivel of NIVELES_RIESGO) {
          const esperado = asignaciones
            .filter((a) => riesgoDeCaso.get(a.casoUsoId) === nivel)
            .reduce((s, a) => s + a.dedicacionPct, 0);
          expect(cap[nivel]).toBe(esperado);
        }
      }),
    );
  });

  it('el total agregado iguala la suma de todas las asignaciones (todas con caso válido en el escenario)', () => {
    fc.assert(
      fc.property(escenarioArb, ({ asignaciones, casosUso }) => {
        const cap = capacidadPorRiesgo(asignaciones, casosUso);
        const total = totalCapacidad(cap);
        const esperado = asignaciones.reduce((s, a) => s + a.dedicacionPct, 0);
        expect(total).toBe(esperado);
      }),
    );
  });

  it('ignora asignaciones cuyo caso de uso no existe (no rompe ni suma de más)', () => {
    fc.assert(
      fc.property(escenarioArb, ({ asignaciones, casosUso }) => {
        const conHuerfana = [
          ...asignaciones,
          {
            id: '__huerfana__',
            personaId: 'x',
            casoUsoId: '__no_existe__',
            dedicacionPct: 50,
            desde: '2026-01-01',
            hasta: '2026-12-31',
          },
        ];
        const base = totalCapacidad(capacidadPorRiesgo(asignaciones, casosUso));
        const conExtra = totalCapacidad(
          capacidadPorRiesgo(conHuerfana, casosUso),
        );
        // La asignación huérfana no aporta a ningún nivel.
        expect(conExtra).toBe(base);
      }),
    );
  });
});
