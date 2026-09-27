import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { estadoSemaforo, cargaPorPersona } from './workload';
import { escenarioArb, dedicacionValidaArb } from './arbitraries';

/**
 * Property-based tests para la lógica de carga de trabajo.
 *
 * Cada propiedad es un enunciado universal ("para toda entrada válida ...")
 * derivado de un requisito EARS del proyecto. fast-check genera cientos de
 * escenarios aleatorios y, si encuentra un contraejemplo, lo reduce
 * (shrinking) al caso mínimo que reproduce el fallo.
 */

describe('estadoSemaforo — propiedades', () => {
  // REQ 4.x: WHEN la carga total < 70 THE System SHALL marcar 'holgura';
  //          70..100 -> 'ok'; > 100 -> 'sobrecarga'.
  it('para cualquier total >= 0, el estado respeta las fronteras 70 y 100', () => {
    fc.assert(
      fc.property(fc.nat({ max: 1000 }), (total) => {
        const estado = estadoSemaforo(total);
        if (total < 70) return estado === 'holgura';
        if (total <= 100) return estado === 'ok';
        return estado === 'sobrecarga';
      }),
    );
  });

  it('es monótono: mayor carga nunca produce un estado "menos cargado"', () => {
    const rango = (e: ReturnType<typeof estadoSemaforo>) =>
      e === 'holgura' ? 0 : e === 'ok' ? 1 : 2;
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.nat({ max: 1000 }),
        (a, b) => {
          const [menor, mayor] = a <= b ? [a, b] : [b, a];
          return rango(estadoSemaforo(menor)) <= rango(estadoSemaforo(mayor));
        },
      ),
    );
  });
});

describe('cargaPorPersona — propiedades', () => {
  // REQ 4.1: la carga de una persona = suma simple de la dedicación de sus
  // asignaciones (sin ponderar solapamiento).
  it('el total por persona es la suma exacta de la dedicación de sus asignaciones', () => {
    fc.assert(
      fc.property(escenarioArb, ({ personas, asignaciones }) => {
        const cargas = cargaPorPersona(asignaciones, personas);
        for (const carga of cargas) {
          const esperado = asignaciones
            .filter((a) => a.personaId === carga.persona.id)
            .reduce((s, a) => s + a.dedicacionPct, 0);
          expect(carga.totalPct).toBe(esperado);
          expect(carga.numAsignaciones).toBe(
            asignaciones.filter((a) => a.personaId === carga.persona.id).length,
          );
        }
      }),
    );
  });

  it('devuelve exactamente una fila por persona y ninguna carga negativa', () => {
    fc.assert(
      fc.property(escenarioArb, ({ personas, asignaciones }) => {
        const cargas = cargaPorPersona(asignaciones, personas);
        expect(cargas).toHaveLength(personas.length);
        const ids = new Set(cargas.map((c) => c.persona.id));
        expect(ids.size).toBe(personas.length);
        return cargas.every((c) => c.totalPct >= 0);
      }),
    );
  });

  it('el estado de cada fila coincide con estadoSemaforo(totalPct)', () => {
    fc.assert(
      fc.property(escenarioArb, ({ personas, asignaciones }) => {
        const cargas = cargaPorPersona(asignaciones, personas);
        return cargas.every((c) => c.estado === estadoSemaforo(c.totalPct));
      }),
    );
  });

  it('el resultado queda ordenado por carga descendente', () => {
    fc.assert(
      fc.property(escenarioArb, ({ personas, asignaciones }) => {
        const cargas = cargaPorPersona(asignaciones, personas);
        for (let i = 1; i < cargas.length; i++) {
          if (cargas[i - 1].totalPct < cargas[i].totalPct) return false;
        }
        return true;
      }),
    );
  });

  it('la suma de las cargas por persona iguala la suma global de asignaciones', () => {
    fc.assert(
      fc.property(escenarioArb, ({ personas, asignaciones }) => {
        const cargas = cargaPorPersona(asignaciones, personas);
        const totalPorPersona = cargas.reduce((s, c) => s + c.totalPct, 0);
        // Todas las asignaciones referencian a una persona existente en el
        // escenario, por lo que ninguna dedicación se pierde.
        const totalGlobal = asignaciones.reduce((s, a) => s + a.dedicacionPct, 0);
        expect(totalPorPersona).toBe(totalGlobal);
      }),
    );
  });

  it('agregar una asignación aumenta la carga de esa persona en su dedicación', () => {
    fc.assert(
      fc.property(escenarioArb, dedicacionValidaArb, (esc, extra) => {
        const persona = esc.personas[0];
        const antes =
          cargaPorPersona(esc.asignaciones, esc.personas).find(
            (c) => c.persona.id === persona.id,
          )?.totalPct ?? 0;
        const nuevas = [
          ...esc.asignaciones,
          {
            id: '__extra__',
            personaId: persona.id,
            casoUsoId: esc.casosUso[0].id,
            dedicacionPct: extra,
            desde: '2026-01-01',
            hasta: '2026-12-31',
          },
        ];
        const despues =
          cargaPorPersona(nuevas, esc.personas).find(
            (c) => c.persona.id === persona.id,
          )?.totalPct ?? 0;
        expect(despues).toBe(antes + extra);
      }),
    );
  });
});
