# CONTEXT.md — Hub Universitario Personal

## 1. Contexto del proyecto
Hub Universitario Personal es una plataforma web para centralizar, organizar, priorizar y dar seguimiento a las actividades académicas de un estudiante universitario.
El Hub no reemplaza a Google Classroom ni a otros LMS. Funciona como una capa de organización y productividad sobre la información académica.
La visión futura contempla integrar fuentes externas, principalmente Google Classroom, y posteriormente otras herramientas como Calendar, Notion, Moodle, Pomodoro, bots e IA.

## 2. Alcance actual: Sprint 1 y Sprint 2
El Sprint 1 tuvo como objetivo construir la primera funcionalidad y establecer la base técnica y de calidad del proyecto (HU-01 — Registrar una actividad académica). El Sprint 2 amplía el núcleo del sistema incorporando la gestión de identidad, autenticación segura y gestión de asignaturas:

- HU-02 — Registrar un nuevo estudiante: Como estudiante aspirante, quiero registrarme proporcionando mis datos personales y credenciales para poder acceder a mi panel académico personalizado.
- HU-03 — Iniciar sesión en el sistema: Como estudiante registrado, quiero iniciar sesión con mis credenciales para acceder de forma segura a mi espacio de trabajo académico mediante un token JWT.
- HU-04 — Registrar una materia académica: Como estudiante autenticado, quiero registrar una nueva asignatura proporcionando su nombre y datos complementarios para organizar mis materias y actividades del semestre.

Fuera de alcance actual (No implementar): Google Classroom, Moodle, Calendar, Notion, Pomodoro, bots, IA (salvo análisis futuros), matriz visual avanzada de priorización, microservicios completos.


## 3. Modelo de dominio
Entidad: `AcademicActivity`
Campos:
- id: UUID
- title: string
- description: string | optional
- course: string
- dueDate: date/date-time
- status: PENDING | IN_PROGRESS | COMPLETED
- priority: LOW | MEDIUM | HIGH
- source: MANUAL | CLASSROOM

Nuevas entidades para el sprint 2:

`User`:
id: UUID
email: string (único)
password: string (cifrado)
firstName: string
lastName: string
courses: Course[]

`Course`:
id: UUID
name: string
professor: string | optional
section: string | optional
userId: UUID (relación con User)


**Reglas de negocio por Historia**:
HU-01: Actividad manual inicia con status = PENDING y source = MANUAL. title, course, dueDate, priority obligatorios.
HU-02: firstName, lastName, email, password, confirmPassword obligatorios. Correo único. Contraseñas deben coincidir y cumplir seguridad mínima.
HU-03: email y password obligatorios. Credenciales válidas emiten token JWT de acceso.
HU-04: name obligatorio. professor y section opcionales. Asociada automáticamente al userId del estudiante autenticado mediante JWT Guard.


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