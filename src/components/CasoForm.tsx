import { useState } from 'react';
import { useAppState } from '../state/store';
import type { CasoUso, RiesgoNIST } from '../types';
import { NIVELES_RIESGO } from '../types';
import {
  validarCaso,
  type CasoFormValues,
  type CasoFormErrors,
} from '../lib/validation';

function esValido(errors: CasoFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function CasoForm({
  caso,
  onClose,
}: {
  caso: CasoUso | null;
  onClose: () => void;
}) {
  const { addCaso, updateCaso } = useAppState();
  const esEdicion = caso !== null;

  const [values, setValues] = useState<CasoFormValues>({
    nombre: caso?.nombre ?? '',
    riesgoNIST: caso?.riesgoNIST ?? '',
    descripcion: caso?.descripcion ?? '',
  });
  const [errors, setErrors] = useState<CasoFormErrors>({});
  const [intentado, setIntentado] = useState(false);

  function actualizar(campo: keyof CasoFormValues, valor: string) {
    const next = { ...values, [campo]: valor };
    setValues(next);
    if (intentado) setErrors(validarCaso(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIntentado(true);
    const errs = validarCaso(values);
    setErrors(errs);
    if (!esValido(errs)) return;

    const base: CasoUso = {
      id: caso?.id ?? crypto.randomUUID(),
      nombre: values.nombre.trim(),
      riesgoNIST: values.riesgoNIST as RiesgoNIST,
      descripcion: values.descripcion.trim(),
    };
    if (esEdicion) updateCaso(base);
    else addCaso(base);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Caso de uso">
        <h2>{esEdicion ? 'Editar caso de uso' : 'Nuevo caso de uso'}</h2>
        <form onSubmit={onSubmit} noValidate>
          <div className="campo">
            <label htmlFor="c-nombre">Nombre</label>
            <input
              id="c-nombre"
              value={values.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
            />
            {errors.nombre && <span className="campo__error">{errors.nombre}</span>}
          </div>
          <div className="campo">
            <label htmlFor="c-riesgo">Riesgo NIST</label>
            <select
              id="c-riesgo"
              value={values.riesgoNIST}
              onChange={(e) => actualizar('riesgoNIST', e.target.value)}
            >
              <option value="">Selecciona…</option>
              {NIVELES_RIESGO.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.riesgoNIST && (
              <span className="campo__error">{errors.riesgoNIST}</span>
            )}
          </div>
          <div className="campo">
            <label htmlFor="c-desc">Descripción</label>
            <textarea
              id="c-desc"
              rows={3}
              value={values.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
            />
            {errors.descripcion && (
              <span className="campo__error">{errors.descripcion}</span>
            )}
          </div>
          <div className="modal__acciones">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              {esEdicion ? 'Guardar cambios' : 'Crear caso de uso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
