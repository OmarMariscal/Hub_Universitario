# CONTEXT.md — Hub Universitario Personal

## 1. Contexto del proyecto
Hub Universitario Personal es una plataforma web para centralizar, organizar, priorizar y dar seguimiento a las actividades académicas de un estudiante universitario.
El Hub no reemplaza a Google Classroom ni a otros LMS. Funciona como una capa de organización y productividad sobre la información académica.
La visión futura contempla integrar fuentes externas, principalmente Google Classroom, y posteriormente otras herramientas como Calendar, Notion, Moodle, Pomodoro, bots e IA.

## 2. Alcance actual: Sprint 1
El Sprint 1 tiene como objetivo construir la primera funcionalidad y establecer la base técnica y de calidad del proyecto.
La única funcionalidad de negocio actual es:
**HU-01 — Registrar una actividad académica**
Como estudiante, quiero registrar manualmente una actividad académica proporcionando su información principal, para llevar un control de mis pendientes aunque la actividad no provenga de una plataforma externa.

**Fuera de alcance de Sprint 1 (No implementar):**
Google Classroom, Moodle, Calendar, Notion, Pomodoro, bots, IA, dashboard, matriz visual de priorización, planificación avanzada, microservicios completos.
La arquitectura debe permitir evolución futura, pero no implementar funcionalidades futuras por anticipación.

## 3. Modelo de dominio
La entidad principal es: `AcademicActivity`
Campos:
- id: UUID
- title: string
- description: string | optional
- course: string
- dueDate: date/date-time
- status: PENDING | IN_PROGRESS | COMPLETED
- priority: LOW | MEDIUM | HIGH
- source: MANUAL | CLASSROOM

**Reglas de HU-01:**
Una actividad creada manualmente debe iniciar con: `status = PENDING` y `source = MANUAL`.
`title`, `course`, `dueDate` y `priority` son obligatorios. `description` es opcional.
La actividad debe rechazarse cuando falte información obligatoria o se utilicen valores no permitidos.
No inventar nuevas reglas de negocio sin justificación (Ej. no asumir que una fecha pasada es inválida si el requisito no lo establece).

## 4. Futuro de la priorización
El diferenciador previsto del Hub será un dashboard de priorización. La futura matriz podrá utilizar conceptos como urgencia e importancia, pero todavía no está definida.
Por lo tanto, NO crear por iniciativa propia: `urgency`, `importance`, `priorityScore` o algoritmos de priorización.
El atributo actual `priority` únicamente representa: LOW, MEDIUM, HIGH.

## 5. Stack técnico
- **Backend:** Node.js, TypeScript estricto, NestJS.
- **Base de datos:** PostgreSQL, Prisma 7.x.
- **Arquitectura:** Clean Architecture + DDD pragmático. Monolito modular.
- **Testing:** Jest, Cucumber (BDD).
- **Versionado:** Git, GitHub Flow.

## 6. Regla arquitectónica principal
El dominio y la aplicación no deben depender directamente de frameworks o infraestructura.
Conceptualmente: `Presentation -> Application -> Domain` (e Infrastructure implementa los puertos necesarios).
Domain y Application no deben depender directamente de NestJS, Prisma, PostgreSQL o servicios externos.

## 7. Lenguaje Ubicuo (Glosario Estricto)
Para mantener consistencia, utilizar EXCLUSIVAMENTE estos términos. Prohibido inventar sinónimos:
- `AcademicActivity`: Entidad central. (NO Task, Homework).
- `dueDate`: Fecha de entrega. (NO deadline, deliveryDate o fechaEntrega).
- `course`: Materia. (NO subject, class).
- `source`: Origen de la actividad.

## 8. Desarrollo orientado a calidad (El Flujo)
User Story -> Acceptance Criteria -> BDD -> TDD -> Implementation -> Refactor -> Code Review.

**BDD y Planeación:**
- Los escenarios Gherkin (`.feature`) se almacenan en: `backend/src/core/application/features/`
- Los planes de diseño técnico generados por la IA deben guardarse en: `docs/sprints/`

**TDD (RED -> GREEN -> REFACTOR):**
- **RED:** Crear únicamente la prueba unitaria que falla. NO generar la implementación.
- **GREEN:** Implementar únicamente lo necesario para hacer pasar la prueba.
- **REFACTOR:** Mejorar la solución sin cambiar su comportamiento.

## 9. Reglas de calidad del código
Priorizar: claridad, bajo acoplamiento, responsabilidad única, nombres descriptivos, testabilidad.
NO introducir abstracciones, patrones o capas únicamente para aparentar una arquitectura avanzada. La solución debe ser proporcional al problema.

## 10. Reglas para el agente de IA
- Antes de modificar código: inspeccionar el estado actual y revisar las pruebas.
- El agente NO debe: inventar requisitos, crear microservicios prematuramente, o generar implementaciones completas cuando se está trabajando en fase RED.
- **Ambigüedad:** Si afecta al comportamiento o dominio, el agente debe preguntar/señalar la ambigüedad antes de codificar.
- Toda funcionalidad debe tener trazabilidad estricta. La evidencia (commits, pruebas) debe ser real, no fabricada para aparentar cumplimiento.
- El agente NO debe modificar unilateralmente el modelo de dominio, criterios de aceptación, estados, prioridades, source o alcance de una historia.