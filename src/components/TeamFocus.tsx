import { useMemo } from 'react';
import { useAppState } from '../state/store';
import { capacidadPorRiesgo, totalCapacidad } from '../lib/risk';
import { NIVELES_RIESGO, type RiesgoNIST } from '../types';

const ETIQUETA: Record<RiesgoNIST, string> = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
};

export function TeamFocus() {
  const { state } = useAppState();
  const { asignaciones, casosUso } = state;

  const cap = useMemo(
    () => capacidadPorRiesgo(asignaciones, casosUso),
    [asignaciones, casosUso],
  );
  const total = totalCapacidad(cap);

  return (
    <section>
      <div className="seccion-cabecera">
        <h2>Foco del equipo por nivel de riesgo</h2>
        <p className="muted">
          Dedicación agregada del equipo según el nivel de riesgo NIST AI RMF del
          caso de uso.
        </p>
      </div>

      <div className="foco">
        {NIVELES_RIESGO.map((nivel) => {
          const valor = cap[nivel];
          const proporcion = total > 0 ? Math.round((valor / total) * 100) : 0;
          return (
            <div key={nivel} className="foco__fila">
              <div className="foco__etiqueta">
                <span className={`badge badge--riesgo-${nivel}`}>
                  {ETIQUETA[nivel]}
                </span>
              </div>
              <div className="foco__barra">
                <div
                  className={`foco__relleno foco__relleno--${nivel}`}
                  style={{ width: `${proporcion}%` }}
                />
              </div>
              <div className="foco__valor">
                <strong>{valor}%</strong>
                <span className="muted"> · {proporcion}% del total</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="atribucion">
        Clasificación de riesgo basada en el marco público{' '}
        <strong>NIST AI Risk Management Framework (AI RMF 1.0)</strong>.
      </p>
    </section>
  );
}
