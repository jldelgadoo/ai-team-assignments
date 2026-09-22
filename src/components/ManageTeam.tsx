import { useMemo, useState } from 'react';
import { useAppState } from '../state/store';
import type { CasoUso, Persona } from '../types';
import { RiskBadge } from './RiskBadge';
import { EmptyState } from './EmptyState';
import { PersonaForm } from './PersonaForm';
import { CasoForm } from './CasoForm';

export function ManageTeam() {
  const { state, deletePersona, deleteCaso } = useAppState();
  const { personas, casosUso, asignaciones } = state;

  const [personaForm, setPersonaForm] = useState<{
    abierto: boolean;
    editando: Persona | null;
  }>({ abierto: false, editando: null });
  const [casoForm, setCasoForm] = useState<{
    abierto: boolean;
    editando: CasoUso | null;
  }>({ abierto: false, editando: null });

  // Nº de asignaciones que referencian cada persona / caso.
  const usoPersona = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of asignaciones) m.set(a.personaId, (m.get(a.personaId) ?? 0) + 1);
    return m;
  }, [asignaciones]);

  const usoCaso = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of asignaciones) m.set(a.casoUsoId, (m.get(a.casoUsoId) ?? 0) + 1);
    return m;
  }, [asignaciones]);

  function onEliminarPersona(p: Persona) {
    const usos = usoPersona.get(p.id) ?? 0;
    if (usos > 0) {
      window.alert(
        `No se puede eliminar a ${p.nombre}: tiene ${usos} asignación(es). ` +
          'Elimina primero sus asignaciones.',
      );
      return;
    }
    if (window.confirm(`¿Eliminar a ${p.nombre} del equipo?`)) deletePersona(p.id);
  }

  function onEliminarCaso(c: CasoUso) {
    const usos = usoCaso.get(c.id) ?? 0;
    if (usos > 0) {
      window.alert(
        `No se puede eliminar "${c.nombre}": tiene ${usos} asignación(es). ` +
          'Elimina primero esas asignaciones.',
      );
      return;
    }
    if (window.confirm(`¿Eliminar el caso de uso "${c.nombre}"?`)) deleteCaso(c.id);
  }

  return (
    <section className="manage">
      {/* Personas */}
      <div className="manage__bloque">
        <div className="toolbar">
          <div className="seccion-cabecera">
            <h2>Equipo</h2>
            <p className="muted">Personas del equipo de IA.</p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => setPersonaForm({ abierto: true, editando: null })}
          >
            + Nueva persona
          </button>
        </div>

        {personas.length === 0 ? (
          <EmptyState titulo="Sin personas" mensaje="Añade la primera persona." />
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th className="num">Asignaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td className="muted">{p.rol}</td>
                    <td className="num">{usoPersona.get(p.id) ?? 0}</td>
                    <td className="acciones">
                      <button
                        className="btn btn--sm"
                        onClick={() =>
                          setPersonaForm({ abierto: true, editando: p })
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => onEliminarPersona(p)}
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
      </div>

      {/* Casos de uso */}
      <div className="manage__bloque">
        <div className="toolbar">
          <div className="seccion-cabecera">
            <h2>Casos de uso</h2>
            <p className="muted">Casos de uso de IA con su nivel de riesgo NIST.</p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => setCasoForm({ abierto: true, editando: null })}
          >
            + Nuevo caso de uso
          </button>
        </div>

        {casosUso.length === 0 ? (
          <EmptyState titulo="Sin casos de uso" mensaje="Añade el primer caso." />
        ) : (
          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Riesgo</th>
                  <th>Descripción</th>
                  <th className="num">Asignaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {casosUso.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>
                      <RiskBadge riesgo={c.riesgoNIST} />
                    </td>
                    <td className="muted celda-desc">{c.descripcion}</td>
                    <td className="num">{usoCaso.get(c.id) ?? 0}</td>
                    <td className="acciones">
                      <button
                        className="btn btn--sm"
                        onClick={() => setCasoForm({ abierto: true, editando: c })}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--sm btn--danger"
                        onClick={() => onEliminarCaso(c)}
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
      </div>

      {personaForm.abierto && (
        <PersonaForm
          persona={personaForm.editando}
          onClose={() => setPersonaForm({ abierto: false, editando: null })}
        />
      )}
      {casoForm.abierto && (
        <CasoForm
          caso={casoForm.editando}
          onClose={() => setCasoForm({ abierto: false, editando: null })}
        />
      )}
    </section>
  );
}
