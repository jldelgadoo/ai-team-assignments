export interface AsignacionFormValues {
  personaId: string;
  casoUsoId: string;
  dedicacionPct: string; // desde el input (string)
  desde: string;
  hasta: string;
}

export type FormErrors = Partial<Record<keyof AsignacionFormValues, string>>;

/**
 * Valida los valores del formulario de asignación.
 * Devuelve un objeto de errores por campo (vacío si es válido).
 */
export function validarAsignacion(values: AsignacionFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.personaId) errors.personaId = 'Selecciona una persona.';
  if (!values.casoUsoId) errors.casoUsoId = 'Selecciona un caso de uso.';

  const pct = Number(values.dedicacionPct);
  if (values.dedicacionPct.trim() === '' || Number.isNaN(pct)) {
    errors.dedicacionPct = 'Introduce un porcentaje.';
  } else if (!Number.isInteger(pct) || pct < 1 || pct > 100) {
    errors.dedicacionPct = 'La dedicación debe ser un entero entre 1 y 100.';
  }

  if (!values.desde) errors.desde = 'Indica la fecha de inicio.';
  if (!values.hasta) errors.hasta = 'Indica la fecha de fin.';

  if (values.desde && values.hasta && values.hasta < values.desde) {
    errors.hasta = 'La fecha "hasta" no puede ser anterior a "desde".';
  }

  return errors;
}

export function esValido(errors: FormErrors): boolean {
  return Object.keys(errors).length === 0;
}
