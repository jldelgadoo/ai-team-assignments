import type { ReactNode } from 'react';

export function EmptyState({
  titulo,
  mensaje,
  accion,
}: {
  titulo: string;
  mensaje: string;
  accion?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{titulo}</h3>
      <p>{mensaje}</p>
      {accion}
    </div>
  );
}
