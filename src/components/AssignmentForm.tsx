import { useState } from 'react';
import { useAppState } from '../state/store';
import type { Asignacion } from '../types';
import {
  validarAsignacion,
  esValido,
  type AsignacionFormValues,
  type FormErrors,
} from '../lib/validation';

function valoresIniciales(a: Asignacion | null): AsignacionFormValues {
  return {
    personaId: a?.personaId ?? '',
    casoUsoId: a?.casoUsoId ?? '',
    dedicacionPct: a ? String(a.dedicacionPct) : '',
    desde: a?.desde ?? '',
    hasta: a?.hasta ?? '',
  };
}

export function AssignmentForm({
  asignacion,
  onClose,
}: {
  asignacion: Asignacion | null;
  onClose: () => void;
}) {
  const { state, addAsignacion, updateAsignacion } = useAppState();
  const { personas, casosUso } = state;

  const [values, setValues] = useState<AsignacionFormValues>(
    valoresIniciales(asignacion),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [intentado, setIntentado] = useState(false);

  const esEdicion = asignacion !== null;

  function actualizar<K extends keyof AsignacionFormValues>(
    campo: K,
    valor: AsignacionFormValues[K],
  ) {
    const next = { ...values, [campo]: valor };
    setValues(next);
    if (intentado) setErrors(validarAsignacion(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIntentado(true);
    const errs = validarAsignacion(values);
    setErrors(errs);
    if (!esValido(errs)) return;

    const base: Asignacion = {
      id: asignacion?.id ?? crypto.randomUUID(),
      personaId: values.personaId,
      casoUsoId: values.casoUsoId,
      dedicacionPct: Number(values.dedicacionPct),
      desde: values.desde,
      hasta: values.hasta,
    };

    if (esEdicion) updateAsignacion(base);
    else addAsignacion(base);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Asignación">
        <h2>{esEdicion ? 'Editar asignación' : 'Nueva asignación'}</h2>
        <form onSubmit={onSubmit} noValidate>
          <div className="campo">
            <label htmlFor="personaId">Persona</label>
            <select
              id="personaId"
              value={values.personaId}
              onChange={(e) => actualizar('personaId', e.target.value)}
            >
              <option value="">Selecciona…</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {p.rol}
                </option>
              ))}
            </select>
            {errors.personaId && <span className="campo__error">{errors.personaId}</span>}
          </div>

          <div className="campo">
            <label htmlFor="casoUsoId">Caso de uso</label>
            <select
              id="casoUsoId"
              value={values.casoUsoId}
              onChange={(e) => actualizar('casoUsoId', e.target.value)}
            >
              <option value="">Selecciona…</option>
              {casosUso.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.riesgoNIST})
                </option>
              ))}
            </select>
            {errors.casoUsoId && <span className="campo__error">{errors.casoUsoId}</span>}
          </div>

          <div className="campo">
            <label htmlFor="dedicacionPct">% Dedicación (1–100)</label>
            <input
              id="dedicacionPct"
              type="number"
              min={1}
              max={100}
              value={values.dedicacionPct}
              onChange={(e) => actualizar('dedicacionPct', e.target.value)}
            />
            {errors.dedicacionPct && (
              <span className="campo__error">{errors.dedicacionPct}</span>
            )}
          </div>

          <div className="campo-fila">
            <div className="campo">
              <label htmlFor="desde">Desde</label>
              <input
                id="desde"
                type="date"
                value={values.desde}
                onChange={(e) => actualizar('desde', e.target.value)}
              />
              {errors.desde && <span className="campo__error">{errors.desde}</span>}
            </div>
            <div className="campo">
              <label htmlFor="hasta">Hasta</label>
              <input
                id="hasta"
                type="date"
                value={values.hasta}
                onChange={(e) => actualizar('hasta', e.target.value)}
              />
              {errors.hasta && <span className="campo__error">{errors.hasta}</span>}
            </div>
          </div>

          <div className="modal__acciones">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              {esEdicion ? 'Guardar cambios' : 'Crear asignación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
