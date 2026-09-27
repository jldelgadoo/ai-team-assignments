# confidentiality-guard (Kiro Power)

Power empaquetado según la especificación **Agent Plugins v1.0.0**. Revisa que un
repositorio use solo datos sintéticos y no filtre información real de ninguna
organización.

## Contenido

```
confidentiality-guard/
├── plugin.json                              # manifiesto (Agent Plugins 1.0.0)
└── skills/
    └── confidentiality-review/
        ├── SKILL.md                         # guía del skill
        ├── references/
        │   └── report-template.md           # plantilla del informe
        └── scripts/
            └── scan.sh                       # barrido de rastros (solo lectura)
```

## Qué demuestra

- **Lección 5 — Powers:** el revisor de confidencialidad, que en el proyecto vive
  como custom agent (`.kiro/agents/confidentiality-reviewer.md`), aquí se
  reempaqueta como Power portable e instalable.
- **Bonus 2 — Empaquetar un Power:** incluye `plugin.json` conforme al schema
  `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` y un skill con
  `references/` y `scripts/`.

## Instalación

Como cualquier Power de Kiro: apuntando al directorio del plugin (que contiene
`plugin.json`). Kiro carga el contexto y el skill cuando aparecen palabras clave
como *confidencialidad*, *datos sintéticos* o *NIST AI RMF*.

## Uso rápido del script

```bash
cd powers/confidentiality-guard/skills/confidentiality-review/scripts
./scan.sh ../../../../..        # escanea la raíz del repo
```

El script es de solo lectura: imprime coincidencias con archivo:línea y no
modifica nada. Revisa el contexto de cada coincidencia (hay falsos positivos,
como versiones de librerías que parecen IPs).
