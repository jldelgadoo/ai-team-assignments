import { describe, it, expect } from 'vitest';
import { estadoSemaforo, cargaPorPersona } from './workload';
import type { Asignacion, Persona } from '../types';

describe('estadoSemaforo', () => {
  it('marca holgura por debajo de 70%', () => {
    expect(estadoSemaforo(0)).toBe('holgura');
    expect(estadoSemaforo(69)).toBe('holgura');
  });

  it('marca ok entre 70% y 100% inclusive', () => {
    expect(estadoSemaforo(70)).toBe('ok');
    expect(estadoSemaforo(85)).toBe('ok');
    expect(estadoSemaforo(100)).toBe('ok');
  });

  it('marca sobrecarga por encima de 100%', () => {
    expect(estadoSemaforo(101)).toBe('sobrecarga');
    expect(estadoSemaforo(150)).toBe('sobrecarga');
  });
});

describe('cargaPorPersona', () => {
  const personas: Persona[] = [
    { id: 'p1', nombre: 'Ana', rol: 'ML' },
    { id: 'p2', nombre: 'Beto', rol: 'DS' },
    { id: 'p3', nombre: 'Caro', rol: 'PM' },
  ];

  const asignaciones: Asignacion[] = [
    { id: 'a1', personaId: 'p1', casoUsoId: 'c1', dedicacionPct: 60, desde: '2026-01-01', hasta: '2026-06-01' },
    { id: 'a2', personaId: 'p1', casoUsoId: 'c2', dedicacionPct: 60, desde: '2026-01-01', hasta: '2026-06-01' },
    { id: 'a3', personaId: 'p2', casoUsoId: 'c1', dedicacionPct: 80, desde: '2026-01-01', hasta: '2026-06-01' },
  ];

  it('suma la dedicación de cada persona', () => {
    const cargas = cargaPorPersona(asignaciones, personas);
    const p1 = cargas.find((c) => c.persona.id === 'p1')!;
    expect(p1.totalPct).toBe(120);
    expect(p1.estado).toBe('sobrecarga');
    expect(p1.numAsignaciones).toBe(2);
  });

  it('asigna 0% y holgura a personas sin asignaciones', () => {
    const cargas = cargaPorPersona(asignaciones, personas);
    const p3 = cargas.find((c) => c.persona.id === 'p3')!;
    expect(p3.totalPct).toBe(0);
    expect(p3.estado).toBe('holgura');
    expect(p3.numAsignaciones).toBe(0);
  });

  it('ordena de mayor a menor carga', () => {
    const cargas = cargaPorPersona(asignaciones, personas);
    expect(cargas.map((c) => c.persona.id)).toEqual(['p1', 'p2', 'p3']);
  });
});
