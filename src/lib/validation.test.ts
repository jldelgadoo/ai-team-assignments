import { describe, it, expect } from 'vitest';
import {
  validarAsignacion,
  esValido,
  validarPersona,
  validarCaso,
  type AsignacionFormValues,
} from './validation';

const base: AsignacionFormValues = {
  personaId: 'p1',
  casoUsoId: 'c1',
  dedicacionPct: '50',
  desde: '2026-01-01',
  hasta: '2026-06-01',
};

describe('validarAsignacion', () => {
  it('acepta una asignación válida', () => {
    expect(esValido(validarAsignacion(base))).toBe(true);
  });

  it('rechaza dedicación fuera de 1..100', () => {
    expect(validarAsignacion({ ...base, dedicacionPct: '0' }).dedicacionPct).toBeDefined();
    expect(validarAsignacion({ ...base, dedicacionPct: '101' }).dedicacionPct).toBeDefined();
    expect(validarAsignacion({ ...base, dedicacionPct: '' }).dedicacionPct).toBeDefined();
    expect(validarAsignacion({ ...base, dedicacionPct: '12.5' }).dedicacionPct).toBeDefined();
  });

  it('rechaza rango de fechas invertido', () => {
    const errs = validarAsignacion({ ...base, desde: '2026-06-01', hasta: '2026-01-01' });
    expect(errs.hasta).toBeDefined();
  });

  it('exige persona y caso de uso', () => {
    const errs = validarAsignacion({ ...base, personaId: '', casoUsoId: '' });
    expect(errs.personaId).toBeDefined();
    expect(errs.casoUsoId).toBeDefined();
  });
});

describe('validarPersona', () => {
  it('exige nombre y rol', () => {
    const errs = validarPersona({ nombre: '', rol: '' });
    expect(errs.nombre).toBeDefined();
    expect(errs.rol).toBeDefined();
  });

  it('acepta una persona válida', () => {
    expect(validarPersona({ nombre: 'Ana', rol: 'ML' })).toEqual({});
  });
});

describe('validarCaso', () => {
  it('exige nombre, riesgo válido y descripción', () => {
    const errs = validarCaso({ nombre: '', riesgoNIST: 'x', descripcion: '' });
    expect(errs.nombre).toBeDefined();
    expect(errs.riesgoNIST).toBeDefined();
    expect(errs.descripcion).toBeDefined();
  });

  it('acepta un caso válido', () => {
    expect(
      validarCaso({ nombre: 'Chatbot', riesgoNIST: 'bajo', descripcion: 'Interno' }),
    ).toEqual({});
  });
});
