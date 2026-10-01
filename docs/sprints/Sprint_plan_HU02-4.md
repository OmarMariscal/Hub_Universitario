# Sprint Plan — HU-02 · HU-03 · HU-04
## Plan de vuelo TDD sobre Clean Architecture

> **Propósito de este documento:** Guiar al agente de IA paso a paso en la implementación del Sprint 2 siguiendo estrictamente el ciclo RED → GREEN → REFACTOR sobre Clean Architecture. Cada bloque de instrucción está diseñado para minimizar tokens: el agente recibe exactamente lo que necesita para cada fase sin información redundante.

---

## Contexto rápido para el agente

| Ítem | Valor |
|---|---|
| Arquitectura | Clean Architecture + DDD pragmático |
| Flujo de dependencias | `Presentation → Application → Domain` (Infrastructure implementa puertos) |
| Stack | NestJS · TypeScript strict · Prisma 7.x · PostgreSQL · Jest |
| Glosario vinculante | `User`, `Course`, `AcademicActivity`, `dueDate`, `source`, `course` |
| Feature files | `backend/src/core/application/features/` |
| Regla crítica | Domain y Application **no dependen** de NestJS, Prisma ni servicios externos |

---

## Estrategia de agrupación de pasos (eficiencia de tokens)

Las tres HU comparten infraestructura transversal (módulo `auth`, entidad `User`, Prisma schema, JWT). Agrupar su scaffolding en **un solo bloque de instrucción** al agente elimina tres conversaciones repetitivas de setup.

```
BLOQUE 0  → Infraestructura compartida (schema + puertos)        [1 sesión]
BLOQUE 1  → HU-02 ciclo TDD completo                             [1 sesión]
BLOQUE 2  → HU-03 ciclo TDD completo                             [1 sesión]
BLOQUE 3  → HU-04 ciclo TDD completo                             [1 sesión]
BLOQUE 4  → Integración final + smoke tests                      [1 sesión]
```

---

## BLOQUE 0 — Infraestructura compartida (Schema · Puertos · Módulo Auth)

> **Instrucción al agente:** Ejecuta este bloque antes de cualquier HU. No generes implementaciones de use-cases ni controllers todavía.

### 0.1 Prisma Schema — nuevas entidades

Añadir al `schema.prisma` existente:

```
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  courses   Course[]
  createdAt DateTime @default(now())
}

model Course {
  id        String  @id @default(uuid())
  name      String
  professor String?
  section   String?
  userId    String
  user      User    @relation(fields: [userId], references: [id])
}
```

Ejecutar: `npx prisma migrate dev --name add_user_course`

### 0.2 Puertos del dominio (interfaces — sin implementación)

Crear en `backend/src/core/domain/ports/`:

| Archivo | Interfaz | Métodos mínimos |
|---|---|---|
| `user.repository.port.ts` | `IUserRepository` | `save(user)`, `findByEmail(email)`, `findById(id)` |
| `course.repository.port.ts` | `ICourseRepository` | `save(course)`, `findAllByUserId(userId)` |
| `password-hasher.port.ts` | `IPasswordHasher` | `hash(plain)`, `compare(plain, hashed)` |
| `token.service.port.ts` | `ITokenService` | `sign(payload)`, `verify(token)` |

### 0.3 Entidades de dominio (puro TypeScript)

Crear en `backend/src/core/domain/entities/`:

- `user.entity.ts` — clase `User` con propiedades del modelo de dominio (sin decoradores NestJS/Prisma)
- `course.entity.ts` — clase `Course` con propiedades del modelo de dominio

### 0.4 Módulo Auth (NestJS — solo estructura vacía)

Crear estructura de carpetas:

```
backend/src/
  modules/
    auth/
      application/
        use-cases/
      infrastructure/
        repositories/
        services/
      presentation/
        controllers/
        dtos/
      auth.module.ts
    courses/
      application/
        use-cases/
      infrastructure/
        repositories/
      presentation/
        controllers/
        dtos/
      courses.module.ts
```

> **Checkpoint 0:** `npm run build` debe compilar sin errores. No hay tests que correr aún.

---

## BLOQUE 1 — HU-02: Registrar un nuevo estudiante

> **Feature file:** `registrar_estudiante.feature` — 4 escenarios

### PASO 1-RED: Prueba unitaria del use-case `RegisterUserUseCase`

**Instrucción al agente:** Crea únicamente el archivo de test. **No crees la implementación del use-case**.

Archivo: `backend/src/modules/auth/application/use-cases/register-user.use-case.spec.ts`

Casos de test a cubrir (mapean 1-a-1 a los escenarios Gherkin):

| Test | Entrada | Expectativa |
|---|---|---|
| `debe crear un usuario y devolver datos sin password` | DTO válido completo | Llama `hasher.hash()`, llama `repo.save()`, retorna objeto sin `password` |
| `debe lanzar error si las contraseñas no coinciden` | `password ≠ confirmPassword` | Lanza `BadRequestException` (mensaje: contraseñas no coinciden) |
| `debe lanzar error si el email ya existe` | `repo.findByEmail` devuelve usuario | Lanza `ConflictException` (mensaje: email ya registrado) |
| `debe lanzar error si falta un campo obligatorio` | DTO sin `email` | El DTO de validación lanza `BadRequestException` |

Mocks requeridos: `IUserRepository` (jest.fn), `IPasswordHasher` (jest.fn).

**Verificar:** `npm test -- register-user` → todos los tests en **ROJO**.

---

### PASO 1-GREEN: Implementar `RegisterUserUseCase`

**Instrucción al agente:** Implementa únicamente lo necesario para hacer pasar los 4 tests anteriores.

Lógica mínima:
1. Validar que `password === confirmPassword` → lanzar `BadRequestException`
2. Llamar `userRepo.findByEmail(email)` → si existe, lanzar `ConflictException`
3. Llamar `hasher.hash(password)` → obtener `hashedPassword`
4. Construir entidad `User` y llamar `userRepo.save(user)`
5. Retornar datos del usuario **sin** el campo `password`

**Verificar:** `npm test -- register-user` → todos los tests en **VERDE**.

---

### PASO 1-REFACTOR

Revisar: nombres descriptivos, sin lógica duplicada, responsabilidad única.  
No agregar funcionalidades nuevas. Re-ejecutar tests → sigue verde.

---

### PASO 1-INFRA: Implementaciones de infraestructura para HU-02

Solo después de tener el use-case verde:

1. `PrismaUserRepository` — implementa `IUserRepository` usando `PrismaClient`
2. `BcryptPasswordHasher` — implementa `IPasswordHasher` usando `bcrypt`
3. `RegisterUserDto` — class-validator decorators: `@IsNotEmpty`, `@IsEmail`, `@MinLength(8)`, etc.
4. `AuthController` — método `POST /auth/register` que llama al use-case
5. Registrar todo en `AuthModule` con providers e inyección de dependencias

---

## BLOQUE 2 — HU-03: Inicio de sesión

> **Feature file:** `iniciar_sesion.feature` — 4 escenarios

### PASO 2-RED: Prueba unitaria del use-case `LoginUserUseCase`

Archivo: `backend/src/modules/auth/application/use-cases/login-user.use-case.spec.ts`

| Test | Entrada | Expectativa |
|---|---|---|
| `debe emitir JWT y datos básicos con credenciales válidas` | email+password correctos | Llama `repo.findByEmail`, llama `hasher.compare` → true, llama `tokenService.sign`, retorna `{ token, user }` sin password |
| `debe lanzar 401 si la contraseña es incorrecta` | `hasher.compare` → false | Lanza `UnauthorizedException` |
| `debe lanzar 401 si el email no existe` | `repo.findByEmail` → null | Lanza `UnauthorizedException` (mismo mensaje — no revelar cuál campo) |
| `debe lanzar 400 si faltan campos obligatorios` | DTO sin `password` | Lanza `BadRequestException` |

Mocks requeridos: `IUserRepository`, `IPasswordHasher`, `ITokenService` (jest.fn).

> **Regla de seguridad:** Los escenarios 401 (contraseña incorrecta y email no existe) devuelven **exactamente el mismo mensaje** para evitar user enumeration.

**Verificar:** `npm test -- login-user` → ROJO.

---

### PASO 2-GREEN: Implementar `LoginUserUseCase`

Lógica mínima:
1. Llamar `userRepo.findByEmail(email)` → si null, lanzar `UnauthorizedException`
2. Llamar `hasher.compare(password, user.password)` → si false, lanzar `UnauthorizedException`
3. Llamar `tokenService.sign({ sub: user.id, email: user.email })` → obtener JWT
4. Retornar `{ accessToken, user: { id, firstName, lastName, email } }`

**Verificar:** `npm test -- login-user` → VERDE.

---

### PASO 2-REFACTOR

Re-verificar que el mensaje de error para email inexistente y contraseña incorrecta sea idéntico.

---

### PASO 2-INFRA: Implementaciones de infraestructura para HU-03

1. `JwtTokenService` — implementa `ITokenService` usando `@nestjs/jwt`
2. `JwtAuthGuard` — guard NestJS que verifica el token en cabecera `Authorization: Bearer`
3. `LoginUserDto` — `@IsEmail`, `@IsNotEmpty`
4. `AuthController` — método `POST /auth/login`
5. Registrar `JwtModule`, `JwtTokenService`, `JwtAuthGuard` en `AuthModule`

---

## BLOQUE 3 — HU-04: Registrar una materia académica

> **Feature file:** `registrar_materia.feature` — 4 escenarios

> **Dependencia:** HU-03 debe estar completa (necesita `JwtAuthGuard` funcional).

### PASO 3-RED: Prueba unitaria del use-case `RegisterCourseUseCase`

Archivo: `backend/src/modules/courses/application/use-cases/register-course.use-case.spec.ts`

| Test | Entrada | Expectativa |
|---|---|---|
| `debe crear materia con todos los campos y retornar UUID` | DTO completo + userId | Llama `repo.save`, retorna objeto con `id` UUID, `userId` correcto |
| `debe crear materia con campos opcionales nulos` | DTO solo con `name` + userId | `professor` y `section` son `null` en el objeto guardado |
| `debe lanzar 400 si el campo name está ausente` | DTO sin `name` | Lanza `BadRequestException` |
| `debe lanzar 401 si no hay userId (guard)` | Sin contexto de autenticación | El guard lanza `UnauthorizedException` antes de llegar al use-case |

> **Nota:** El escenario de JWT ausente se prueba a nivel de guard (test de integración/e2e), no en el unit test del use-case.

Mocks requeridos: `ICourseRepository` (jest.fn).

**Verificar:** `npm test -- register-course` → ROJO.

---

### PASO 3-GREEN: Implementar `RegisterCourseUseCase`

Lógica mínima:
1. Construir entidad `Course` con `{ id: uuid(), name, professor: professor ?? null, section: section ?? null, userId }`
2. Llamar `courseRepo.save(course)`
3. Retornar la entidad creada

**Verificar:** `npm test -- register-course` → VERDE.

---

### PASO 3-REFACTOR

Verificar que `professor` y `section` se traten de forma explícita como opcionales.

---

### PASO 3-INFRA: Implementaciones de infraestructura para HU-04

1. `PrismaCourseRepository` — implementa `ICourseRepository` usando `PrismaClient`
2. `CreateCourseDto` — `name: @IsNotEmpty @IsString`, `professor?: @IsOptional @IsString`, `section?: @IsOptional @IsString`
3. `CoursesController` — `POST /courses` decorado con `@UseGuards(JwtAuthGuard)`, extrae `userId` del JWT con `@Request()`
4. Registrar todo en `CoursesModule`, importar `AuthModule` para acceder al guard

---

## BLOQUE 4 — Integración final y smoke tests

> **Instrucción al agente:** Ejecutar en este orden.

### 4.1 Tests de integración (supertest)

Crear `backend/test/auth.e2e-spec.ts` y `backend/test/courses.e2e-spec.ts` cubriendo el flujo completo:

```
POST /auth/register  → 201 (HU-02 escenario 1)
POST /auth/register  → 409 email duplicado (HU-02 escenario 3)
POST /auth/login     → 200 + JWT (HU-03 escenario 1)
POST /auth/login     → 401 contraseña incorrecta (HU-03 escenario 2)
POST /courses        → 201 con JWT válido (HU-04 escenario 1)
POST /courses        → 401 sin JWT (HU-04 escenario 4)
```

### 4.2 Verificación final

```bash
npm run test          # Todos los tests unitarios en verde
npm run test:e2e      # Todos los tests de integración en verde
npm run build         # Sin errores de compilación TypeScript
```

### 4.3 Matriz de trazabilidad

| Historia | Use-Case | Unit Tests | E2E | HTTP Status cubiertos |
|---|---|---|---|---|
| HU-02 | `RegisterUserUseCase` | 4 | 2 | 201, 400, 409 |
| HU-03 | `LoginUserUseCase` | 4 | 2 | 200, 400, 401 |
| HU-04 | `RegisterCourseUseCase` | 3 | 2 | 201, 400, 401 |

---

## Árbol de archivos objetivo

```
backend/src/
├── core/
│   └── domain/
│       ├── entities/
│       │   ├── user.entity.ts                          [BLOQUE 0]
│       │   └── course.entity.ts                        [BLOQUE 0]
│       └── ports/
│           ├── user.repository.port.ts                 [BLOQUE 0]
│           ├── course.repository.port.ts               [BLOQUE 0]
│           ├── password-hasher.port.ts                 [BLOQUE 0]
│           └── token.service.port.ts                   [BLOQUE 0]
└── modules/
    ├── auth/
    │   ├── application/use-cases/
    │   │   ├── register-user.use-case.ts               [BLOQUE 1-GREEN]
    │   │   ├── register-user.use-case.spec.ts          [BLOQUE 1-RED]
    │   │   ├── login-user.use-case.ts                  [BLOQUE 2-GREEN]
    │   │   └── login-user.use-case.spec.ts             [BLOQUE 2-RED]
    │   ├── infrastructure/
    │   │   ├── repositories/prisma-user.repository.ts  [BLOQUE 1-INFRA]
    │   │   └── services/
    │   │       ├── bcrypt-password-hasher.service.ts   [BLOQUE 1-INFRA]
    │   │       └── jwt-token.service.ts                [BLOQUE 2-INFRA]
    │   ├── presentation/
    │   │   ├── controllers/auth.controller.ts          [BLOQUE 1-INFRA]
    │   │   ├── dtos/register-user.dto.ts               [BLOQUE 1-INFRA]
    │   │   └── dtos/login-user.dto.ts                  [BLOQUE 2-INFRA]
    │   └── auth.module.ts                              [BLOQUE 2-INFRA]
    └── courses/
        ├── application/use-cases/
        │   ├── register-course.use-case.ts             [BLOQUE 3-GREEN]
        │   └── register-course.use-case.spec.ts        [BLOQUE 3-RED]
        ├── infrastructure/repositories/
        │   └── prisma-course.repository.ts             [BLOQUE 3-INFRA]
        ├── presentation/
        │   ├── controllers/courses.controller.ts       [BLOQUE 3-INFRA]
        │   └── dtos/create-course.dto.ts               [BLOQUE 3-INFRA]
        └── courses.module.ts                           [BLOQUE 3-INFRA]
```

---

> **Nota para el agente:** Antes de comenzar cualquier bloque, leer el CONTEXT.md y los feature files correspondientes. No inventar campos, entidades ni comportamientos fuera del modelo de dominio definido. Si detectas ambigüedad en algún paso, señalarlo antes de codificar.
