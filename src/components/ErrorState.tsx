export function ErrorState({ mensaje }: { mensaje: string }) {
  return (
    <div className="error-state" role="alert">
      <h2>No se pudieron cargar los datos</h2>
      <p>{mensaje}</p>
      <p className="error-state__hint">
        Revisa que <code>seed.json</code> exista y tenga un formato válido, y vuelve
        a cargar la página.
      </p>
    </div>
  );
}
