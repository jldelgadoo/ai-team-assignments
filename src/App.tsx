import { useState } from 'react';
import { useAppState } from './state/store';
import { ErrorState } from './components/ErrorState';
import { AssignmentsTable } from './components/AssignmentsTable';
import { WorkloadSummary } from './components/WorkloadSummary';
import { TeamFocus } from './components/TeamFocus';

type Vista = 'tabla' | 'resumen' | 'foco';

const TABS: { id: Vista; label: string }[] = [
  { id: 'tabla', label: 'Asignaciones' },
  { id: 'resumen', label: 'Carga por persona' },
  { id: 'foco', label: 'Foco del equipo' },
];

export function App() {
  const { state } = useAppState();
  const [vista, setVista] = useState<Vista>('tabla');

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>AI Team Assignments</h1>
          <p className="app__subtitle">
            Tablero de visibilidad de asignaciones del equipo de IA · datos ficticios
          </p>
        </div>
      </header>

      {state.status === 'error' ? (
        <ErrorState mensaje={state.error ?? 'Error desconocido'} />
      ) : state.status === 'loading' ? (
        <div className="loading">Cargando datos…</div>
      ) : (
        <>
          <nav className="nav" aria-label="Vistas">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`nav__tab ${vista === t.id ? 'nav__tab--active' : ''}`}
                onClick={() => setVista(t.id)}
                aria-current={vista === t.id}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main className="app__main">
            {vista === 'tabla' && <AssignmentsTable />}
            {vista === 'resumen' && <WorkloadSummary />}
            {vista === 'foco' && <TeamFocus />}
          </main>
        </>
      )}

      <footer className="app__footer">
        Niveles de riesgo basados en el marco público NIST AI RMF 1.0. Todos los
        datos son ficticios.
      </footer>
    </div>
  );
}
