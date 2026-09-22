import { useMemo } from 'react';
import { useAppState } from '../state/store';
import { cargaPorPersona } from '../lib/workload';
import { TrafficLight } from './TrafficLight';
import { EmptyState } from './EmptyState';

export function WorkloadSummary() {
  const { state } = useAppState();
  const { asignaciones, personas } = state;

  const cargas = useMemo(
    () => cargaPorPersona(asignaciones, personas),
    [asignaciones, personas],
  );

  if (personas.length === 0) {
    return (
      <EmptyState
        titulo="Sin personas"
        mensaje="No hay personas en el equipo para calcular su carga."
      />
    );
  }

  return (
    <section>
      <div className="seccion-cabecera">
        <h2>Carga por persona</h2>
        <p className="muted">
          Suma de dedicación de todas las asignaciones · Holgura &lt;70% · OK
          70–100% · Sobrecarga &gt;100%
        </p>
      </div>

      <div className="cards">
        {cargas.map(({ persona, totalPct, estado, numAsignaciones }) => (
          <article key={persona.id} className={`card card--${estado}`}>
            <div className="card__top">
              <div>
                <h3 className="card__nombre">{persona.nombre}</h3>
                <p className="muted">{persona.rol}</p>
              </div>
              <TrafficLight estado={estado} />
            </div>
            <div className="card__pct">{totalPct}%</div>
            <div className="barra">
              <div
                className={`barra__relleno barra__relleno--${estado}`}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              />
            </div>
            <p className="muted card__meta">
              {numAsignaciones} asignación{numAsignaciones === 1 ? '' : 'es'}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
