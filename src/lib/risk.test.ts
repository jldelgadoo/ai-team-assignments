import { describe, it, expect } from 'vitest';
import { capacidadPorRiesgo, totalCapacidad } from './risk';
import type { Asignacion, CasoUso } from '../types';

const casos: CasoUso[] = [
  { id: 'c1', nombre: 'Bajo', riesgoNIST: 'bajo', descripcion: '' },
  { id: 'c2', nombre: 'Medio', riesgoNIST: 'medio', descripcion: '' },
  { id: 'c3', nombre: 'Alto', riesgoNIST: 'alto', descripcion: '' },
];

const asignaciones: Asignacion[] = [
  { id: 'a1', personaId: 'p1', casoUsoId: 'c1', dedicacionPct: 30, desde: '2026-01-01', hasta: '2026-06-01' },
  { id: 'a2', personaId: 'p2', casoUsoId: 'c1', dedicacionPct: 20, desde: '2026-01-01', hasta: '2026-06-01' },
  { id: 'a3', personaId: 'p3', casoUsoId: 'c3', dedicacionPct: 50, desde: '2026-01-01', hasta: '2026-06-01' },
];

describe('capacidadPorRiesgo', () => {
  it('agrega la dedicación por nivel de riesgo', () => {
    const cap = capacidadPorRiesgo(asignaciones, casos);
    expect(cap.bajo).toBe(50);
    expect(cap.alto).toBe(50);
  });

  it('devuelve 0 en niveles sin asignaciones', () => {
    const cap = capacidadPorRiesgo(asignaciones, casos);
    expect(cap.medio).toBe(0);
  });

  it('ignora asignaciones cuyo caso no existe', () => {
    const cap = capacidadPorRiesgo(
      [
        ...asignaciones,
        { id: 'x', personaId: 'p9', casoUsoId: 'inexistente', dedicacionPct: 99, desde: '2026-01-01', hasta: '2026-06-01' },
      ],
      casos,
    );
    expect(totalCapacidad(cap)).toBe(100);
  });
});

describe('totalCapacidad', () => {
  it('suma todos los niveles', () => {
    expect(totalCapacidad({ bajo: 10, medio: 20, alto: 30 })).toBe(60);
  });
});
