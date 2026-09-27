import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validarAsignacion, esValido } from './validation';

/**
 * Property-based tests para la validación del formulario de asignación.
 * Propiedades derivadas de los requisitos 3.x (campos obligatorios,
 * dedicación entera 1..100, y hasta >= desde).
 */

const fechaArb = fc
  .date({
    min: new Date('2020-01-01'),
    max: new Date('2030-12-31'),
    noInvalidDate: true,
  })
  .map((d) => d.toISOString().slice(0, 10));

describe('validarAsignacion — propiedades', () => {
  // REQ 3.5: la dedicación debe ser un entero entre 1 y 100 (inclusive).
  it('acepta cualquier dedicación entera en 1..100 con el resto de campos válidos', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (pct) => {
        const errores = validarAsignacion({
          personaId: 'p1',
          casoUsoId: 'c1',
          dedicacionPct: String(pct),
          desde: '2026-01-01',
          hasta: '2026-06-01',
        });
        return errores.dedicacionPct === undefined;
      }),
    );
  });

  it('rechaza toda dedicación fuera de 1..100 o no entera', () => {
    const invalidaArb = fc.oneof(
      fc.integer({ min: -1000, max: 0 }).map(String),
      fc.integer({ min: 101, max: 1000 }).map(String),
      fc
        .float({ min: 1, max: 100, noNaN: true })
        .filter((n) => !Number.isInteger(n))
        .map(String),
      fc.constantFrom('', ' ', 'abc', 'NaN'),
    );
    fc.assert(
      fc.property(invalidaArb, (pct) => {
        const errores = validarAsignacion({
          personaId: 'p1',
          casoUsoId: 'c1',
          dedicacionPct: pct,
          desde: '2026-01-01',
          hasta: '2026-06-01',
        });
        return errores.dedicacionPct !== undefined;
      }),
    );
  });

  // REQ 3.6: la fecha "hasta" no puede ser anterior a "desde".
  it('reporta error en "hasta" siempre que hasta < desde', () => {
    fc.assert(
      fc.property(fechaArb, fechaArb, (f1, f2) => {
        const [antes, despues] = f1 <= f2 ? [f1, f2] : [f2, f1];
        // Forzamos hasta estrictamente anterior a desde.
        if (antes === despues) return true; // sin inversión posible
        const errores = validarAsignacion({
          personaId: 'p1',
          casoUsoId: 'c1',
          dedicacionPct: '50',
          desde: despues,
          hasta: antes,
        });
        return errores.hasta !== undefined;
      }),
    );
  });

  // REQ 3.4: persona y caso de uso son obligatorios.
  it('exige persona y caso de uso: vacíos siempre generan error', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', 'p1'),
        fc.constantFrom('', 'c1'),
        (personaId, casoUsoId) => {
          const errores = validarAsignacion({
            personaId,
            casoUsoId,
            dedicacionPct: '50',
            desde: '2026-01-01',
            hasta: '2026-06-01',
          });
          if (personaId === '') expect(errores.personaId).toBeDefined();
          if (casoUsoId === '') expect(errores.casoUsoId).toBeDefined();
        },
      ),
    );
  });

  it('una asignación completamente válida no produce ningún error', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (pct) => {
        const errores = validarAsignacion({
          personaId: 'p1',
          casoUsoId: 'c1',
          dedicacionPct: String(pct),
          desde: '2026-01-01',
          hasta: '2026-12-31',
        });
        return esValido(errores);
      }),
    );
  });
});
