# language: es

Característica: Registrar una materia académica (HU-04)
  Como estudiante autenticado
  Quiero registrar una nueva asignatura proporcionando su nombre y datos complementarios
  Para organizar mis materias y actividades del semestre en Hub Universitario

  Reglas:
    - El campo "name" es obligatorio y no puede estar vacío
    - Los campos "professor" y "section" son opcionales; si se omiten se almacenan como nulos
    - La materia se asocia automáticamente al userId extraído del token JWT del estudiante autenticado
    - Se rechaza cualquier solicitud sin token válido con HTTP 401
    - Se rechaza cualquier solicitud con campo "name" ausente o vacío con HTTP 400
    - La respuesta exitosa incluye el identificador UUID generado para la materia

  Antecedentes:
    Dado que el sistema está disponible
    Y el estudiante "Omar Mariscal" se encuentra autenticado en el sistema con un token JWT válido
    Y no existen materias registradas previamente con el nombre "Ingeniería de Software" para este usuario

  Escenario: Registro exitoso de una materia con todos los campos completos
    Dado que el estudiante desea dar de alta una nueva asignatura
    Cuando el estudiante envía una petición POST a "/courses" con los siguientes datos:
      | campo     | valor                  |
      | name      | Ingeniería de Software |
      | professor | Dr. Alejandro Gómez    |
      | section   | Sección D04            |
    Entonces el sistema crea la materia exitosamente
    Y el sistema responde con un código HTTP 201 Created
    Y la materia queda asociada al userId del estudiante autenticado
    Y la respuesta incluye un identificador UUID único para la materia

  Escenario: Registro exitoso de una materia omitiendo campos opcionales
    Dado que el estudiante desea dar de alta una nueva asignatura
    Cuando el estudiante envía una petición POST a "/courses" proporcionando únicamente el campo obligatorio:
      | campo | valor                |
      | name  | Redes de Computadoras |
    Entonces el sistema crea la materia exitosamente
    Y el sistema responde con un código HTTP 201 Created
    Y la respuesta incluye un identificador UUID único para la materia
    Y los campos "professor" y "section" de la materia creada son nulos

  Escenario: Fallo al registrar una materia por omitir el campo obligatorio name
    Dado que el estudiante desea dar de alta una nueva asignatura
    Cuando el estudiante envía una petición POST a "/courses" omitiendo el campo "name":
      | campo     | valor              |
      | professor | Dra. María Sánchez |
      | section   | Aula 302           |
    Entonces el sistema rechaza la solicitud
    Y el sistema devuelve un error HTTP 400 Bad Request indicando que el campo "name" es obligatorio
    Y ninguna materia es almacenada en la base de datos

  Escenario: Fallo al registrar una materia sin autenticación
    Dado que el cliente no cuenta con un token JWT válido
    Cuando el cliente envía una petición POST a "/courses" con datos válidos de una materia:
      | campo | valor                  |
      | name  | Ingeniería de Software |
    Entonces el sistema rechaza la solicitud
    Y el sistema devuelve un error HTTP 401 Unauthorized indicando que se requiere un token de acceso válido
    Y ninguna materia es almacenada en la base de datos
