# Sprint 1 — Plan de Vuelo Técnico: HU-01 Registrar una actividad académica

## Metadatos

| Campo              | Valor                                           |
|--------------------|-------------------------------------------------|
| Historia           | HU-01 — Registrar una actividad académica       |
| Sprint             | Sprint 1                                        |
| Metodología        | BDD → TDD (RED → GREEN → REFACTOR)              |
| Arquitectura       | Clean Architecture + DDD pragmático             |
| Stack              | NestJS · TypeScript estricto · Jest · Cucumber  |
| Fecha de creación  | 2026-09-18                                      |

---

## 1. Criterios de Aceptación (base del ciclo)

Derivados directamente de las reglas de dominio en `CONTEXT.md § 3`:

| ID   | Criterio                                                                                 |
|------|------------------------------------------------------------------------------------------|
| CA-1 | `title`, `course`, `dueDate` y `priority` son obligatorios.                             |
| CA-2 | `description` es opcional.                                                               |
| CA-3 | Una actividad registrada manualmente inicia con `status = PENDING` y `source = MANUAL`. |
| CA-4 | `priority` acepta únicamente: `LOW`, `MEDIUM`, `HIGH`.                                  |
| CA-5 | Se rechaza la solicitud si falta algún campo obligatorio.                                |
| CA-6 | Se rechaza la solicitud si `priority` tiene un valor no permitido.                       |
| CA-7 | La actividad creada recibe un `id` de tipo UUID.                                         |

---

## 2. Escenarios BDD cubiertos

Archivo fuente: `backend/src/core/application/features/registrar_actividad.feature`

| Escenario                                                    | Criterios cubiertos |
|--------------------------------------------------------------|---------------------|
| Registro exitoso con todos los campos obligatorios           | CA-1, CA-2, CA-3, CA-7 |
| Fallo por campo obligatorio ausente (`title`)                | CA-1, CA-5          |
| Fallo por valor de `priority` no permitido (`URGENT`)        | CA-4, CA-6          |

---

## 3. Estructura de capas y archivos a crear

Siguiendo el flujo `Presentation → Application → Domain` (infraestructura implementa puertos):

```
backend/src/core/
├── domain/
│   └── entities/
│       └── academic-activity.entity.ts       ← Entidad de dominio pura
│
└── application/
    ├── features/
    │   └── registrar_actividad.feature       ← [YA EXISTE] Escenarios BDD
    ├── ports/
    │   └── academic-activity.repository.ts   ← Puerto (interfaz) de persistencia
    └── use-cases/
        └── register-academic-activity/
            ├── register-academic-activity.use-case.ts      ← Caso de uso
            └── register-academic-activity.use-case.spec.ts ← Pruebas unitarias (TDD)
```

> **Nota de alcance:** Los adaptadores de infraestructura (Prisma, HTTP controller) se crean
> únicamente después de que el dominio y la capa de aplicación estén verdes y refactorizados.

---

## 4. Ciclo TDD paso a paso

### Fase 0 — Preparación (sin código de producción)

- [ ] **0.1** Verificar que `jest.config.ts` reconoce el patrón `*.spec.ts` en `src/`.
- [ ] **0.2** Confirmar que el entorno base compila (`npm run build` sin errores en los archivos scaffold existentes).
- [ ] **0.3** Leer el feature file completo para interiorizar los tres escenarios antes de escribir la primera prueba.

---

### Fase 1 — RED: Primera prueba que falla (CA-3 + CA-7)

**Objetivo:** Verificar que el caso de uso crea la actividad con `status = PENDING`, `source = MANUAL` e `id` UUID.

#### Pasos:

1. **Crear el archivo de prueba** `register-academic-activity.use-case.spec.ts`.
2. **Definir el `describe`** con la etiqueta `"RegisterAcademicActivityUseCase"`.
3. **Escribir el primer `it`** que:
   - Construye un DTO de entrada válido (title, course, dueDate, priority).
   - Crea un *stub* (objeto vacío) del repositorio que implementa el puerto `IAcademicActivityRepository` con un método `save()` que no hace nada.
   - Instancia el caso de uso pasando el stub como dependencia.
   - Llama al método `execute(dto)` del caso de uso.
   - Afirma (`expect`) que el resultado tiene `status === 'PENDING'`.
   - Afirma que el resultado tiene `source === 'MANUAL'`.
   - Afirma que el `id` es un string con formato UUID v4.
4. **Ejecutar `npx jest`** → debe fallar en rojo porque el caso de uso no existe aún.
5. **Confirmar el mensaje de error** esperado (módulo no encontrado o `is not a constructor`).

---

### Fase 2 — GREEN: Implementar lo mínimo para pasar la prueba (CA-3 + CA-7)

**Objetivo:** Solo hacer verde el primer `it`. Nada más.

#### Pasos:

1. **Crear la entidad** `AcademicActivity` con los campos del modelo de dominio (`id`, `title`, `description`, `course`, `dueDate`, `status`, `priority`, `source`). Sin lógica adicional, sin validaciones todavía.
2. **Crear el puerto** `IAcademicActivityRepository` con la firma `save(activity: AcademicActivity): Promise<void>`.
3. **Crear el caso de uso** `RegisterAcademicActivityUseCase` con el método `execute(dto)` que:
   - Genera un UUID.
   - Construye un `AcademicActivity` asignando `status = 'PENDING'` y `source = 'MANUAL'`.
   - Llama a `this.repository.save(activity)`.
   - Retorna la actividad creada.
4. **Ejecutar `npx jest`** → el primer `it` debe estar en verde.
5. **No añadir** validaciones ni lógica adicional todavía.

---

### Fase 3 — RED: Segunda prueba que falla (CA-1, CA-5 — campo obligatorio ausente)

**Objetivo:** Verificar que el caso de uso lanza un error cuando `title` está ausente.

#### Pasos:

1. **Añadir un segundo `it`** al mismo `describe`:
   - Construye un DTO de entrada **sin** el campo `title`.
   - Afirma que `execute(dto)` lanza (o rechaza) con un error que indica que `title` es obligatorio.
2. **Ejecutar `npx jest`** → debe fallar en rojo porque no hay validación.

---

### Fase 4 — GREEN: Hacer pasar la segunda prueba (CA-1, CA-5)

#### Pasos:

1. **Añadir validación en el caso de uso** `execute()`: antes de crear la entidad, verificar que `title`, `course`, `dueDate` y `priority` están presentes. Lanzar un error de dominio descriptivo si falta alguno.
2. **Ejecutar `npx jest`** → ambos `it` deben estar en verde.

---

### Fase 5 — RED: Tercera prueba que falla (CA-4, CA-6 — priority inválida)

**Objetivo:** Verificar que se rechaza un valor de `priority` no permitido.

#### Pasos:

1. **Añadir un tercer `it`**:
   - Construye un DTO con todos los campos obligatorios pero con `priority = 'URGENT'`.
   - Afirma que `execute(dto)` lanza un error indicando que `'URGENT'` no es un valor permitido para `priority`.
2. **Ejecutar `npx jest`** → debe fallar en rojo.

---

### Fase 6 — GREEN: Hacer pasar la tercera prueba (CA-4, CA-6)

#### Pasos:

1. **Extender la validación** en el caso de uso para verificar que `priority` pertenece al conjunto `['LOW', 'MEDIUM', 'HIGH']`.
2. **Ejecutar `npx jest`** → los tres `it` deben estar en verde.

---

### Fase 7 — REFACTOR

**Objetivo:** Mejorar la solución sin cambiar comportamiento. Las pruebas deben seguir en verde tras cada cambio.

#### Checklist de refactor:

- [ ] **7.1** Extraer la lógica de validación a un método privado o a la propia entidad `AcademicActivity` si la responsabilidad pertenece al dominio.
- [ ] **7.2** Verificar que los tipos del DTO de entrada (`RegisterAcademicActivityDto`) están correctamente tipados con TypeScript estricto (`strict: true`).
- [ ] **7.3** Asegurarse de que `AcademicActivity` no importa nada de NestJS, Prisma ni librerías de infraestructura.
- [ ] **7.4** Verificar que el caso de uso solo depende de la interfaz (puerto) del repositorio, nunca de su implementación concreta.
- [ ] **7.5** Eliminar cualquier `any` o comentario redundante.
- [ ] **7.6** Ejecutar `npx jest --coverage` y confirmar cobertura de los tres escenarios.

---

## 5. Comandos de referencia

```bash
# Ejecutar todas las pruebas en modo watch
npx jest --watch

# Ejecutar pruebas del caso de uso específico
npx jest register-academic-activity

# Ejecutar con reporte de cobertura
npx jest --coverage

# Verificar compilación TypeScript
npx tsc --noEmit
```

---

## 6. Invariantes arquitectónicas a respetar

| Restricción                                                              | Verificación               |
|--------------------------------------------------------------------------|----------------------------|
| `domain/` y `application/` no importan NestJS, Prisma ni librerías HTTP | Revisión manual de imports |
| El caso de uso depende del puerto (interfaz), no de la implementación    | Ver constructor del UseCase |
| `status` y `source` nunca provienen del DTO de entrada del estudiante    | Verificar en el `execute()` |
| No se crean campos (`urgency`, `importance`, `priorityScore`) no definidos en el modelo | Revisión de la entidad |

---

## 7. Definición de Terminado (DoD) para HU-01

- [ ] Los tres escenarios Gherkin tienen pasos implementados y ejecutables con Cucumber o mapeados a pruebas unitarias Jest.
- [ ] Las tres pruebas unitarias pasan en verde.
- [ ] Cobertura de línea ≥ 90 % sobre el caso de uso y la entidad.
- [ ] `npx tsc --noEmit` sin errores.
- [ ] No existen dependencias de infraestructura en `domain/` ni `application/`.
- [ ] El código revisado y aprobado en Pull Request antes de mergear a `main`.
