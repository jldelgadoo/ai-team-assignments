import { useState } from 'react';
import { useAppState } from '../state/store';
import type { Persona } from '../types';
import {
  validarPersona,
  type PersonaFormValues,
  type PersonaFormErrors,
} from '../lib/validation';

function esValido(errors: PersonaFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function PersonaForm({
  persona,
  onClose,
}: {
  persona: Persona | null;
  onClose: () => void;
}) {
  const { addPersona, updatePersona } = useAppState();
  const esEdicion = persona !== null;

  const [values, setValues] = useState<PersonaFormValues>({
    nombre: persona?.nombre ?? '',
    rol: persona?.rol ?? '',
  });
  const [errors, setErrors] = useState<PersonaFormErrors>({});
  const [intentado, setIntentado] = useState(false);

  function actualizar(campo: keyof PersonaFormValues, valor: string) {
    const next = { ...values, [campo]: valor };
    setValues(next);
    if (intentado) setErrors(validarPersona(next));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIntentado(true);
    const errs = validarPersona(values);
    setErrors(errs);
    if (!esValido(errs)) return;

    const base: Persona = {
      id: persona?.id ?? crypto.randomUUID(),
      nombre: values.nombre.trim(),
      rol: values.rol.trim(),
    };
    if (esEdicion) updatePersona(base);
    else addPersona(base);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Persona">
        <h2>{esEdicion ? 'Editar persona' : 'Nueva persona'}</h2>
        <form onSubmit={onSubmit} noValidate>
          <div className="campo">
            <label htmlFor="p-nombre">Nombre</label>
            <input
              id="p-nombre"
              value={values.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
            />
            {errors.nombre && <span className="campo__error">{errors.nombre}</span>}
          </div>
          <div className="campo">
            <label htmlFor="p-rol">Rol</label>
            <input
              id="p-rol"
              value={values.rol}
              onChange={(e) => actualizar('rol', e.target.value)}
            />
            {errors.rol && <span className="campo__error">{errors.rol}</span>}
          </div>
          <div className="modal__acciones">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              {esEdicion ? 'Guardar cambios' : 'Crear persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
