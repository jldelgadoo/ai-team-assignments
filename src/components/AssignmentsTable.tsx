import { useMemo, useState } from 'react';
import { useAppState } from '../state/store';
import type { Asignacion, RiesgoNIST } from '../types';
import { NIVELES_RIESGO } from '../types';
import { RiskBadge } from './RiskBadge';
import { EmptyState } from './EmptyState';
import { AssignmentForm } from './AssignmentForm';

function formatoFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function AssignmentsTable() {
  const { state, deleteAsignacion } = useAppState();
  const { asignaciones, personas, casosUso } = state;

  const [filtroPersona, setFiltroPersona] = useState<string>('');
  const [filtroRiesgo, setFiltroRiesgo] = useState<RiesgoNIST | ''>('');
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Asignacion | null>(null);

  const personaPorId = useMemo(
    () => new Map(personas.map((p) => [p.id, p])),
    [personas],
  );
  const casoPorId = useMemo(
    () => new Map(casosUso.map((c) => [c.id, c])),
    [casosUso],
  );

  const filas = useMemo(() => {
    return asignaciones
      .filter((a) => (filtroPersona ? a.personaId === filtroPersona : true))
      .filter((a) => {
        if (!filtroRiesgo) return true;
        return casoPorId.get(a.casoUsoId)?.riesgoNIST === filtroRiesgo;
      })
      .map((a) => ({
        asignacion: a,
        persona: personaPorId.get(a.personaId),
        caso: casoPorId.get(a.casoUsoId),
      }))
      .sort((x, y) =>
        (x.persona?.nombre ?? '').localeCompare(y.persona?.nombre ?? ''),
      );
  }, [asignaciones, filtroPersona, filtroRiesgo, personaPorId, casoPorId]);

  function abrirNueva() {
    setEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(a: Asignacion) {
    setEditando(a);
    setFormAbierto(true);
  }

  function onEliminar(a: Asignacion) {
    const persona = personaPorId.get(a.personaId)?.nombre ?? 'esta persona';
    const caso = casoPorId.get(a.casoUsoId)?.nombre ?? 'este caso de uso';
    if (window.confirm(`¿Eliminar la asignación de ${persona} en "${caso}"?`)) {
      deleteAsignacion(a.id);
    }
  }

  return (
    <section>
      <div className="toolbar">
        <div className="toolbar__filtros">
          <label>
            Persona
            <select
              value={filtroPersona}
              onChange={(e) => setFiltroPersona(e.target.value)}
            >
              <option value="">Todas</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Riesgo NIST
            <select
              value={filtroRiesgo}
              onChange={(e) => setFiltroRiesgo(e.target.value as RiesgoNIST | '')}
            >
              <option value="">Todos</option>
              {NIVELES_RIESGO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn btn--primary" onClick={abrirNueva}>
          + Nueva asignación
        </button>
      </div>

      {filas.length === 0 ? (
        <EmptyState
          titulo="Sin asignaciones"
          mensaje={
            asignaciones.length === 0
              ? 'Aún no hay asignaciones. Crea la primera para empezar.'
              : 'Ninguna asignación coincide con los filtros seleccionados.'
          }
          accion={
            asignaciones.length === 0 ? (
              <button className="btn btn--primary" onClick={abrirNueva}>
                + Nueva asignación
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Rol</th>
                <th>Caso de uso</th>
                <th>Riesgo</th>
                <th className="num">% Dedicación</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ asignacion, persona, caso }) => (
                <tr key={asignacion.id}>
                  <td>{persona?.nombre ?? '—'}</td>
                  <td className="muted">{persona?.rol ?? '—'}</td>
                  <td>{caso?.nombre ?? '—'}</td>
                  <td>{caso ? <RiskBadge riesgo={caso.riesgoNIST} /> : '—'}</td>
                  <td className="num">{asignacion.dedicacionPct}%</td>
                  <td>{formatoFecha(asignacion.desde)}</td>
                  <td>{formatoFecha(asignacion.hasta)}</td>
                  <td className="acciones">
                    <button
                      className="btn btn--sm"
                      onClick={() => abrirEdicion(asignacion)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => onEliminar(asignacion)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formAbierto && (
        <AssignmentForm
          asignacion={editando}
          onClose={() => setFormAbierto(false)}
        />
      )}
    </section>
  );
}
