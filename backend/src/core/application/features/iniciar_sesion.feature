# language: es

Característica: Inicio de sesión en el sistema (HU-03)
  Como estudiante registrado
  Quiero iniciar sesión con mis credenciales
  Para acceder de forma segura a mi espacio de trabajo académico

  Reglas:
    - Los campos email y password son obligatorios
    - Las credenciales deben coincidir con un usuario registrado y activo
    - Un inicio de sesión exitoso emite un token de acceso JWT
    - La respuesta exitosa incluye el token JWT y los datos básicos del perfil (sin password)
    - Credenciales incorrectas siempre devuelven HTTP 401 (sin revelar cuál campo es incorrecto)

  Antecedentes:
    Dado que el sistema de autenticación está disponible
    Y el estudiante "Omar Mariscal" está registrado en el sistema con correo "omar.mariscal@alumnos.udg.mx" y contraseña válida

  Escenario: Inicio de sesión exitoso con credenciales válidas
    Dado que el estudiante se encuentra en la pantalla de inicio de sesión
    Cuando el estudiante envía las credenciales:
      | campo    | valor                        |
      | email    | omar.mariscal@alumnos.udg.mx |
      | password | SecurePassword123!           |
    Entonces el sistema valida las credenciales exitosamente
    Y el sistema responde con un código HTTP 200 OK
    Y la respuesta incluye un token de acceso JWT válido
    Y la respuesta incluye los datos básicos del perfil del usuario (id, firstName, lastName, email)
    Y la respuesta no contiene el campo password

  Escenario: Fallo al iniciar sesión por contraseña incorrecta
    Dado que el estudiante se encuentra en la pantalla de inicio de sesión
    Cuando el estudiante envía las credenciales con contraseña incorrecta:
      | campo    | valor                        |
      | email    | omar.mariscal@alumnos.udg.mx |
      | password | ContraseñaEquivocada999!     |
    Entonces el sistema rechaza el inicio de sesión
    Y el sistema devuelve un error HTTP 401 Unauthorized indicando credenciales inválidas
    Y la respuesta no incluye ningún token de acceso

  Escenario: Fallo al iniciar sesión por campos obligatorios ausentes
    Dado que el estudiante se encuentra en la pantalla de inicio de sesión
    Cuando el estudiante intenta iniciar sesión omitiendo el campo "password":
      | campo | valor                        |
      | email | omar.mariscal@alumnos.udg.mx |
    Entonces el sistema rechaza la solicitud
    Y el sistema devuelve un error HTTP 400 Bad Request indicando que el campo "password" es obligatorio
    Y la respuesta no incluye ningún token de acceso

  Escenario: Fallo al iniciar sesión con correo no registrado
    Dado que el estudiante se encuentra en la pantalla de inicio de sesión
    Cuando el estudiante envía las credenciales con un correo que no existe en el sistema:
      | campo    | valor                          |
      | email    | noexiste@alumnos.udg.mx        |
      | password | SecurePassword123!             |
    Entonces el sistema rechaza el inicio de sesión
    Y el sistema devuelve un error HTTP 401 Unauthorized indicando credenciales inválidas
    Y la respuesta no incluye ningún token de acceso
