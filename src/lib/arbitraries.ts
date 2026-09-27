import fc from 'fast-check';
import type { Asignacion, CasoUso, Persona, RiesgoNIST } from '../types';
import { NIVELES_RIESGO } from '../types';

/**
 * Generadores (arbitraries) compartidos para las pruebas basadas en
 * propiedades (property-based testing con fast-check).
 *
 * La idea del PBT es no enumerar ejemplos a mano, sino describir cómo luce un
 * dato válido del dominio y dejar que fast-check genere cientos de casos
 * (incluyendo bordes y valores raros) para intentar violar cada invariante.
 */

/** Identificador no vacío y razonable (ids de personas y casos). */
export const idArb = fc.string({ minLength: 1, maxLength: 12 });

/** Nivel de riesgo NIST válido: 'bajo' | 'medio' | 'alto'. */
export const riesgoArb: fc.Arbitrary<RiesgoNIST> = fc.constantFrom(
  ...NIVELES_RIESGO,
);

/** Porcentaje de dedicación válido según el dominio: entero 1..100. */
export const dedicacionValidaArb = fc.integer({ min: 1, max: 100 });

export const personaArb: fc.Arbitrary<Persona> = fc.record({
  id: idArb,
  nombre: fc.string({ minLength: 1, maxLength: 40 }),
  rol: fc.string({ minLength: 1, maxLength: 40 }),
});

export const casoUsoArb: fc.Arbitrary<CasoUso> = fc.record({
  id: idArb,
  nombre: fc.string({ minLength: 1, maxLength: 40 }),
  riesgoNIST: riesgoArb,
  descripcion: fc.string({ maxLength: 120 }),
});

/**
 * Genera un conjunto coherente de personas, casos y asignaciones donde cada
 * asignación referencia una persona y un caso existentes. Devuelve ids únicos
 * para evitar colisiones que enmascaren invariantes.
 */
export const escenarioArb = fc
  .record({
    personas: fc.uniqueArray(personaArb, {
      minLength: 1,
      maxLength: 6,
      selector: (p) => p.id,
    }),
    casosUso: fc.uniqueArray(casoUsoArb, {
      minLength: 1,
      maxLength: 6,
      selector: (c) => c.id,
    }),
  })
  .chain(({ personas, casosUso }) => {
    const asignacionArb: fc.Arbitrary<Asignacion> = fc.record({
      id: idArb,
      personaId: fc.constantFrom(...personas.map((p) => p.id)),
      casoUsoId: fc.constantFrom(...casosUso.map((c) => c.id)),
      dedicacionPct: dedicacionValidaArb,
      desde: fc.constant('2026-01-01'),
      hasta: fc.constant('2026-12-31'),
    });
    return fc.record({
      personas: fc.constant(personas),
      casosUso: fc.constant(casosUso),
      asignaciones: fc.array(asignacionArb, { maxLength: 30 }),
    });
  });
