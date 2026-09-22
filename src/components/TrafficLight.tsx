import type { EstadoSemaforo } from '../lib/workload';

const ETIQUETAS: Record<EstadoSemaforo, string> = {
  holgura: 'Holgura',
  ok: 'OK',
  sobrecarga: 'Sobrecarga',
};

export function TrafficLight({ estado }: { estado: EstadoSemaforo }) {
  return (
    <span className={`semaforo semaforo--${estado}`}>
      <span className="semaforo__punto" aria-hidden="true" />
      {ETIQUETAS[estado]}
    </span>
  );
}
