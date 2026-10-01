# language: es

Característica: Registro de un nuevo estudiante (HU-02)
  Como estudiante aspirante
  Quiero registrarme proporcionando mis datos personales y credenciales
  Para poder acceder a mi panel académico personalizado en Hub Universitario

  Reglas:
    - Los campos firstName, lastName, email, password y confirmPassword son obligatorios
    - El correo electrónico (email) debe ser único en el sistema
    - Las contraseñas (password y confirmPassword) deben coincidir exactamente
    - La contraseña debe cumplir con los criterios mínimos de seguridad (mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial)
    - La respuesta exitosa nunca incluye el campo password ni su hash

  Antecedentes:
    Dado que el sistema de autenticación está disponible
    Y no existe ningún usuario registrado con el correo "omar.mariscal@alumnos.udg.mx"

  Escenario: Registro exitoso de un nuevo estudiante
    Dado que el estudiante desea crear una cuenta en la plataforma
    Cuando el estudiante envía los datos de registro válidos:
      | campo           | valor                        |
      | firstName       | Omar Jesús                   |
      | lastName        | Mariscal Rodríguez           |
      | email           | omar.mariscal@alumnos.udg.mx |
      | password        | SecurePassword123!           |
      | confirmPassword | SecurePassword123!           |
    Entonces el sistema crea la cuenta de usuario exitosamente
    Y el sistema responde con un código HTTP 201 Created
    Y la respuesta incluye los campos id, firstName, lastName y email del usuario creado
    Y la respuesta no contiene el campo password ni su representación cifrada

  Escenario: Fallo en el registro por contraseñas que no coinciden
    Dado que el estudiante desea crear una cuenta en la plataforma
    Cuando el estudiante envía los datos de registro con contraseñas distintas:
      | campo           | valor                        |
      | firstName       | Omar Jesús                   |
      | lastName        | Mariscal Rodríguez           |
      | email           | omar.mariscal@alumnos.udg.mx |
      | password        | SecurePassword123!           |
      | confirmPassword | PasswordDiferente999!        |
    Entonces el sistema rechaza la solicitud de registro
    Y el sistema devuelve un error HTTP 400 Bad Request indicando que las contraseñas no coinciden
    Y ninguna cuenta es almacenada en la base de datos

  Escenario: Fallo en el registro por correo electrónico duplicado
    Dado que ya existe un usuario registrado con el correo "omar.mariscal@alumnos.udg.mx"
    Cuando un nuevo estudiante intenta registrarse utilizando el mismo correo electrónico
    Entonces el sistema rechaza la solicitud de registro
    Y el sistema devuelve un error HTTP 409 Conflict indicando que el correo ya se encuentra registrado
    Y ninguna cuenta adicional es almacenada en la base de datos

  Escenario: Fallo en el registro por campos obligatorios ausentes
    Dado que el estudiante desea crear una cuenta en la plataforma
    Cuando el estudiante envía los datos de registro omitiendo el campo "email":
      | campo           | valor              |
      | firstName       | Omar Jesús         |
      | lastName        | Mariscal Rodríguez |
      | password        | SecurePassword123! |
      | confirmPassword | SecurePassword123! |
    Entonces el sistema rechaza la solicitud de registro
    Y el sistema devuelve un error HTTP 400 Bad Request indicando que el campo "email" es obligatorio
    Y ninguna cuenta es almacenada en la base de datos
