import type { RiesgoNIST } from '../types';

const ETIQUETAS: Record<RiesgoNIST, string> = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
};

export function RiskBadge({ riesgo }: { riesgo: RiesgoNIST }) {
  return (
    <span className={`badge badge--riesgo-${riesgo}`} title="Nivel NIST AI RMF">
      {ETIQUETAS[riesgo]}
    </span>
  );
}
