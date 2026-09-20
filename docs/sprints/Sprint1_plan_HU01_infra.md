# Sprint 1 — Plan de Vuelo Técnico: HU-01 Capa de Infraestructura

## Metadatos

| Campo              | Valor                                                         |
|--------------------|---------------------------------------------------------------|
| Historia           | HU-01 — Registrar una actividad académica                     |
| Sprint             | Sprint 1                                                      |
| Fase               | Infraestructura (Adaptadores de entrada y salida + Módulo)    |
| Metodología        | BDD → TDD (RED → GREEN → REFACTOR)                            |
| Arquitectura       | Clean Architecture + DDD pragmático. Monolito modular.        |
| Stack              | NestJS · TypeScript estricto · Prisma 7 · Jest · Supertest    |
| Prerequisito       | Dominio y Aplicación de HU-01 completados y en verde          |
| Fecha de creación  | 2026-09-19                                                    |

---

## 0. Contexto de partida y precondiciones

Antes de iniciar cualquier fase, el agente ejecutor **DEBE** verificar el estado del proyecto:

```bash
# Desde: backend/
npm test                  # Todos los spec existentes deben estar en VERDE
npx tsc --noEmit          # Cero errores de compilación TypeScript
```

Si alguna prueba preexistente falla, detener el plan e informar al usuario. **No continuar con trabajo roto.**

### Árbol de archivos existentes (punto de partida)

```
backend/
├── prisma/
│   └── schema.prisma                          ← Solo tiene generator + datasource (sin modelos)
├── src/
│   ├── app.module.ts                          ← AppModule vacío (imports: [])
│   ├── main.ts
│   └── core/
│       ├── domain/
│       │   └── entities/
│       │       └── academic-activity.entity.ts  ← [YA EXISTE] Entidad de dominio pura
│       └── application/
│           ├── features/
│           │   └── registrar_actividad.feature  ← [YA EXISTE] Escenarios BDD (fuente de verdad)
│           ├── ports/
│           │   └── academic-activity.repository.ts  ← [YA EXISTE] Puerto/interfaz
│           └── use-cases/
│               └── register-academic-activity/
│                   ├── register-academic-activity.use-case.ts       ← [YA EXISTE]
│                   └── register-academic-activity.use-case.spec.ts  ← [YA EXISTE] 3 specs en verde
└── test/
    ├── jest-e2e.json
    └── app.e2e-spec.ts                        ← Archivo E2E existente (vacío o de scaffold)
```

### Árbol objetivo al finalizar este plan

```
backend/
├── prisma/
│   └── schema.prisma                          ← [MODIFICAR] Agregar modelo AcademicActivity
├── src/
│   ├── app.module.ts                          ← [MODIFICAR] Importar AcademicActivityModule
│   └── core/
│       └── infrastructure/                    ← [NUEVO] Capa de infraestructura
│           ├── persistence/
│           │   ├── prisma-academic-activity.repository.ts       ← Adaptador de salida
│           │   └── prisma-academic-activity.repository.spec.ts  ← Prueba de integración
│           ├── http/
│           │   └── academic-activity.controller.ts              ← Adaptador de entrada
│           └── modules/
│               └── academic-activity.module.ts                  ← Módulo NestJS (DI)
└── test/
    └── academic-activity.e2e-spec.ts          ← [NUEVO] Prueba E2E con Supertest
```

---

## 1. Escenarios BDD de referencia (fuente de verdad)

Los tres escenarios del archivo `registrar_actividad.feature` dictan el comportamiento **observable desde HTTP** que las pruebas E2E deben verificar. El agente ejecutor **DEBE** leerlo antes de escribir cualquier prueba.

| Escenario (del .feature)                                     | Criterios CA | HTTP esperado          |
|--------------------------------------------------------------|--------------|------------------------|
| Registro exitoso con todos los campos obligatorios           | CA-1,2,3,7   | `201 Created` + body   |
| Fallo por campo obligatorio ausente (`title`)                | CA-1, CA-5   | `400 Bad Request`      |
| Fallo por valor de `priority` no permitido (`URGENT`)        | CA-4, CA-6   | `400 Bad Request`      |

---

## 2. Invariantes arquitectónicas (no negociables)

El agente ejecutor debe verificar estas restricciones **al final de cada fase GREEN**:

| Restricción | Cómo verificar |
|---|---|
| `infrastructure/` puede importar de `application/` y `domain/`, nunca al revés | `grep -r "infrastructure" src/core/domain/ src/core/application/` debe estar vacío |
| El repositorio Prisma importa `PrismaClient` desde `../../../generated/prisma` (output del generador) | Revisar el import en el adaptador |
| El controlador no contiene lógica de negocio: solo recibe, delega al use case y responde | Revisión manual |
| `AcademicActivityModule` provee el repositorio como token de la interfaz (`IAcademicActivityRepository`) | Ver el array `providers` del módulo |
| Ningún archivo de `domain/` ni `application/` tiene nuevas importaciones de NestJS o Prisma | `npx tsc --noEmit` + revisión de imports |

---

## 3. Fase A — Schema Prisma y migración

> **Objetivo:** Definir el modelo `AcademicActivity` en Prisma y ejecutar la migración inicial.
> Esta fase no tiene prueba TDD asociada, pero es prerequisito bloqueante para las siguientes.

### A.1 — Modificar `schema.prisma`

**Archivo:** `backend/prisma/schema.prisma`

Añadir al final del archivo, **después** del bloque `datasource`, el siguiente modelo.
No modificar el `generator` ni el `datasource` existentes. Solo agregar el modelo.

El modelo debe mapear exactamente los campos de `AcademicActivityProps`:

```
model AcademicActivity {
  id          String   @id
  title       String
  description String?
  course      String
  dueDate     DateTime
  status      String
  priority    String
  source      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("academic_activities")
}
```

> **Nota de diseño:** `status`, `priority` y `source` se almacenan como `String` (no como `enum` de Prisma).
> El dominio ya garantiza los valores válidos mediante la validación del caso de uso.
> Usar enums de Prisma añadiría acoplamiento innecesario entre la base de datos y el modelo de dominio.

### A.2 — Ejecutar la migración de desarrollo

```bash
# Desde: backend/
npx prisma migrate dev --name add_academic_activity
```

Esto debe:
1. Crear la carpeta `prisma/migrations/` con el archivo SQL de la migración.
2. Generar el cliente Prisma en `backend/generated/prisma/`.
3. Aplicar la migración en la base de datos de desarrollo.

**Verificación:**
```bash
npx prisma studio   # La tabla academic_activities debe aparecer en la UI
npx tsc --noEmit    # Sin errores
npm test            # Las 3 pruebas unitarias existentes siguen en verde
```

---

## 4. Fase B — Adaptador de Salida: `PrismaAcademicActivityRepository`

> **Metodología:** RED → GREEN → REFACTOR
> **Tipo de prueba:** Integración (usa la BD real de test)

### B.1 — RED: Crear la prueba de integración (que falla)

**Crear archivo:** `backend/src/core/infrastructure/persistence/prisma-academic-activity.repository.spec.ts`

#### Instrucciones estrictas para el agente:

1. Crear **únicamente** el archivo de prueba. **No crear** el repositorio todavía.
2. En el `beforeEach`, instanciar un `PrismaClient` real y limpiar la tabla:
   ```
   await prisma.academicActivity.deleteMany();
   ```
3. En el `afterAll`, desconectar el cliente:
   ```
   await prisma.$disconnect();
   ```
4. Escribir **un solo** bloque `it` que:
   - Construya una instancia de `AcademicActivity` válida (con todos los campos del dominio).
   - Instancie `PrismaAcademicActivityRepository` pasándole el `PrismaClient`.
   - Llame a `repository.save(activity)`.
   - Consulte directamente via `prisma.academicActivity.findUnique({ where: { id: activity.id } })`.
   - Afirme que el registro encontrado no es `null`.
   - Afirme que `found.title === activity.title`.
   - Afirme que `found.status === 'PENDING'`.

5. Ejecutar la prueba:
   ```bash
   npm test -- --testPathPattern=prisma-academic-activity.repository.spec
   ```
   **Resultado esperado: ROJO** — La clase `PrismaAcademicActivityRepository` no existe.

> **⚠️ STOP:** No continuar hasta confirmar el fallo.

---

### B.2 — GREEN: Implementar el repositorio

**Crear archivo:** `backend/src/core/infrastructure/persistence/prisma-academic-activity.repository.ts`

#### Instrucciones estrictas para el agente:

1. La clase **debe** implementar la interfaz `IAcademicActivityRepository`.
2. El constructor recibe un `PrismaClient` como dependencia inyectada (no instanciarlo internamente).
3. El método `save(activity: AcademicActivity): Promise<void>` debe:
   - Llamar a `this.prisma.academicActivity.create({ data: { ...campos } })`.
   - Mapear **todos** los campos de la entidad `AcademicActivity` al modelo Prisma.
   - No añadir transformaciones de negocio: persistir los valores tal como los entrega el dominio.
   - No retornar nada (retornar `void`).
4. El import del `PrismaClient` debe ser: `import { PrismaClient } from '../../../../generated/prisma'`.
5. **No** añadir métodos adicionales (`findAll`, `findById`, etc.): solo lo necesario para que la prueba pase.

Ejecutar:
```bash
npm test -- --testPathPattern=prisma-academic-activity.repository.spec
```
**Resultado esperado: VERDE** — La prueba de integración pasa.

También ejecutar:
```bash
npm test   # Las 4 pruebas (3 unitarias + 1 integración) deben estar en verde
```

---

### B.3 — REFACTOR: Repositorio

**Con las pruebas en verde**, revisar y mejorar sin cambiar comportamiento:

- [ ] **B.3.1** Verificar que no hay `any` explícito en el archivo del repositorio.
- [ ] **B.3.2** Verificar que el mapeo de campos es explícito (no usar spread `...activity` directamente sobre el objeto de dominio, ya que puede incluir métodos o propiedades no deseadas). Mapear campo a campo.
- [ ] **B.3.3** Confirmar que la clase no importa nada de `@nestjs/*` (se inyectará desde el módulo, no directamente aquí).
- [ ] **B.3.4** Ejecutar `npm test` nuevamente para confirmar verde.

---

## 5. Fase C — Adaptador de Entrada: `AcademicActivityController`

> **Metodología:** RED → GREEN → REFACTOR
> **Tipo de prueba:** E2E con Supertest (levanta la aplicación NestJS completa en memoria)

### C.1 — RED: Crear la prueba E2E (que falla)

**Crear archivo:** `backend/test/academic-activity.e2e-spec.ts`

#### Instrucciones estrictas para el agente:

La prueba E2E levanta el módulo NestJS **completo**, pero sustituye el repositorio Prisma real por un **mock** en memoria, para que la prueba E2E sea determinista y no requiera BD:

```typescript
// Fragmento de estructura — el agente debe completar los imports y el cuerpo completo

describe('POST /activities (E2E — HU-01)', () => {
  let app: INestApplication;
  const saveMock = jest.fn().mockResolvedValue(undefined);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      // Importar AcademicActivityModule aquí
    })
      .overrideProvider('IAcademicActivityRepository')
      .useValue({ save: saveMock })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    saveMock.mockClear();
  });

  // Los tres it-blocks van aquí (ver detalle abajo)
});
```

**Los tres bloques `it` deben corresponder exactamente a los tres escenarios del `.feature`:**

**`it` 1 — Escenario: Registro exitoso**
- Enviar `POST /activities` con body JSON `{ title, course, dueDate, priority: 'HIGH' }`.
- Afirmar: código de respuesta `201`.
- Afirmar: body contiene `status: 'PENDING'`.
- Afirmar: body contiene `source: 'MANUAL'`.
- Afirmar: body contiene `id` que cumple el patrón UUID v4.
- Afirmar: `saveMock` fue llamado exactamente 1 vez.

**`it` 2 — Escenario: Campo obligatorio ausente**
- Enviar `POST /activities` con body JSON sin el campo `title`.
- Afirmar: código de respuesta `400`.
- Afirmar: el body de error menciona `title` (verificar el campo `message` del body).
- Afirmar: `saveMock` **no** fue llamado (0 veces).

**`it` 3 — Escenario: Priority inválida**
- Enviar `POST /activities` con `priority: 'URGENT'`.
- Afirmar: código de respuesta `400`.
- Afirmar: el body de error menciona `priority`.
- Afirmar: `saveMock` **no** fue llamado (0 veces).

Ejecutar:
```bash
npm run test:e2e -- --testPathPattern=academic-activity.e2e-spec
```
**Resultado esperado: ROJO** — `AcademicActivityModule` y el controlador no existen.

> **⚠️ STOP:** No continuar hasta confirmar el fallo (módulo no encontrado o `Cannot POST /activities`).

---

### C.2 — GREEN Paso 1: Crear el módulo NestJS

**Crear archivo:** `backend/src/core/infrastructure/modules/academic-activity.module.ts`

#### Instrucciones estrictas para el agente:

1. Declarar `AcademicActivityModule` como un `@Module` de NestJS.
2. El módulo debe proveer:
   - El caso de uso `RegisterAcademicActivityUseCase` en el array `providers`.
   - El repositorio `PrismaAcademicActivityRepository` como implementación del token `'IAcademicActivityRepository'`:
     ```typescript
     {
       provide: 'IAcademicActivityRepository',
       useClass: PrismaAcademicActivityRepository,
     }
     ```
3. El módulo debe declarar el controlador `AcademicActivityController` en el array `controllers`.
4. El módulo **no** debe exportar nada por ahora.

> **Nota de implementación:** `PrismaClient` también debe proveerse en este módulo para que NestJS pueda inyectarlo en el repositorio:
> ```typescript
> { provide: PrismaClient, useValue: new PrismaClient() }
> ```

---

### C.3 — GREEN Paso 2: Crear el controlador

**Crear archivo:** `backend/src/core/infrastructure/http/academic-activity.controller.ts`

#### Instrucciones estrictas para el agente:

1. Decorar la clase con `@Controller('activities')`.
2. Inyectar `RegisterAcademicActivityUseCase` en el constructor usando `@Inject(RegisterAcademicActivityUseCase)`.
3. Implementar **un único método** `create(@Body() body: unknown)` decorado con `@Post()` y `@HttpCode(201)`.
4. El cuerpo del método debe:
   - Construir el DTO `RegisterAcademicActivityDto` a partir del `body` recibido.
   - Llamar a `await this.registerUseCase.execute(dto)`.
   - **Capturar** el error lanzado por el caso de uso (el `Error` estándar de validación) y relanzarlo como `BadRequestException` de NestJS.
   - Retornar el objeto `AcademicActivity` resultante (NestJS lo serializará a JSON automáticamente).

   Estructura del bloque try/catch:
   ```typescript
   try {
     const activity = await this.registerUseCase.execute(dto);
     return activity;
   } catch (error) {
     if (error instanceof Error) {
       throw new BadRequestException(error.message);
     }
     throw error;
   }
   ```

5. **No** añadir validaciones propias en el controlador (como `class-validator` o pipes personalizados). La validación de dominio ya existe en el caso de uso.
6. **No** crear un DTO de HTTP separado. El controlador pasa el body directamente al caso de uso como `RegisterAcademicActivityDto`. Tipar el body como `RegisterAcademicActivityDto` usando la interfaz ya existente en el use case.

---

### C.4 — GREEN Paso 3: Registrar el módulo en `AppModule`

**Modificar archivo:** `backend/src/app.module.ts`

Importar `AcademicActivityModule` en el array `imports` de `AppModule`:

```typescript
import { Module } from '@nestjs/common';
import { AcademicActivityModule } from './core/infrastructure/modules/academic-activity.module';

@Module({
  imports: [AcademicActivityModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Ejecutar la prueba E2E:
```bash
npm run test:e2e -- --testPathPattern=academic-activity.e2e-spec
```
**Resultado esperado: VERDE** — Los 3 tests E2E pasan.

También ejecutar todas las pruebas juntas:
```bash
npm test && npm run test:e2e
```
**Resultado esperado: VERDE** — Las 3 unitarias + 1 integración + 3 E2E = 7 pruebas totales en verde.

---

### C.5 — REFACTOR: Controlador y Módulo

**Con todas las pruebas en verde**, aplicar el siguiente checklist:

- [ ] **C.5.1** El controlador no mezcla lógica de negocio con lógica de presentación: solo convierte `body → DTO`, delega, captura errores de dominio y responde.
- [ ] **C.5.2** Verificar que el tipo del parámetro `body` en el controlador es `RegisterAcademicActivityDto` (no `any`, no `object`, no `unknown`) para que TypeScript detecte discrepancias de tipo.
- [ ] **C.5.3** El módulo no instancia directamente `PrismaClient` fuera del array `providers`. Debe estar como un proveedor explícito, no como una constante flotante.
- [ ] **C.5.4** Ejecutar `npx tsc --noEmit` → cero errores.
- [ ] **C.5.5** Ejecutar `npm test && npm run test:e2e` → todas las pruebas en verde.

---

## 6. Estructura de archivos finales (resumen)

```
backend/src/core/infrastructure/
├── persistence/
│   ├── prisma-academic-activity.repository.ts        ← Adaptador de salida (implementa IAcademicActivityRepository)
│   └── prisma-academic-activity.repository.spec.ts   ← Prueba de integración (1 spec)
├── http/
│   └── academic-activity.controller.ts               ← Adaptador de entrada (POST /activities)
└── modules/
    └── academic-activity.module.ts                   ← Módulo NestJS con DI configurado
```

---

## 7. Comandos de referencia

```bash
# Desde: backend/

# Migraciones Prisma
npx prisma migrate dev --name add_academic_activity
npx prisma generate

# Pruebas unitarias + integración
npm test

# Sólo el repositorio (integración)
npm test -- --testPathPattern=prisma-academic-activity.repository.spec

# Pruebas E2E
npm run test:e2e

# Sólo el E2E de actividades
npm run test:e2e -- --testPathPattern=academic-activity.e2e-spec

# Todo junto con cobertura
npm run test:cov

# Verificar compilación
npx tsc --noEmit
```

---

## 8. Mapa de trazabilidad completo

| Escenario BDD (.feature)                        | Criterio CA | Prueba unitaria (spec) | Prueba integración (spec) | Prueba E2E         |
|-------------------------------------------------|-------------|------------------------|---------------------------|--------------------|
| Registro exitoso                                | CA-1,2,3,7  | `it` 1 (use-case.spec) | `it` 1 (repository.spec)  | `it` 1 (e2e-spec)  |
| Fallo por campo obligatorio ausente (`title`)   | CA-1, CA-5  | `it` 2 (use-case.spec) | N/A                       | `it` 2 (e2e-spec)  |
| Fallo por `priority` no permitida (`URGENT`)    | CA-4, CA-6  | `it` 3 (use-case.spec) | N/A                       | `it` 3 (e2e-spec)  |

---

## 9. Definición de Terminado (DoD) — Capa de Infraestructura HU-01

- [ ] `schema.prisma` contiene el modelo `AcademicActivity` y la migración aplicada existe en `prisma/migrations/`.
- [ ] `PrismaAcademicActivityRepository` implementa `IAcademicActivityRepository` y su prueba de integración pasa en verde.
- [ ] `AcademicActivityController` expone `POST /activities` y sus 3 pruebas E2E pasan en verde.
- [ ] `AcademicActivityModule` inyecta todas las dependencias correctamente.
- [ ] `AppModule` importa `AcademicActivityModule`.
- [ ] `npm test` → 4 specs en verde (3 unitarias + 1 integración).
- [ ] `npm run test:e2e` → 3 specs en verde.
- [ ] `npm run test:cov` → cobertura de línea ≥ 90 % sobre los archivos nuevos de infraestructura.
- [ ] `npx tsc --noEmit` → cero errores.
- [ ] Ningún archivo de `domain/` ni `application/` importa desde `infrastructure/`.
- [ ] El código revisado y aprobado en Pull Request antes de mergear a `main`.
