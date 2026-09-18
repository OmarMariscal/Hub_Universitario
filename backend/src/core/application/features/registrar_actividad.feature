# language: es

Característica: Registrar una actividad académica (HU-01)
  Como estudiante
  Quiero registrar manualmente una actividad académica proporcionando su información principal
  Para llevar un control de mis pendientes aunque la actividad no provenga de una plataforma externa

  Reglas:
    - Los campos title, course, dueDate y priority son obligatorios
    - El campo description es opcional
    - Una actividad registrada manualmente inicia siempre con status = PENDING y source = MANUAL
    - Los valores válidos de priority son: LOW, MEDIUM, HIGH
    - Se rechaza cualquier actividad con campos obligatorios ausentes o con valores no permitidos

  Antecedentes:
    Dado que el sistema está disponible y no existen actividades registradas

  Escenario: Registro exitoso de una actividad académica con todos los campos obligatorios
    Dado que el estudiante desea registrar una actividad académica
    Cuando el estudiante envía los siguientes datos:
      | campo       | valor                          |
      | title       | Entregar práctica de redes     |
      | course      | Redes de Computadoras          |
      | dueDate     | 2026-10-15T23:59:00            |
      | priority    | HIGH                           |
    Entonces el sistema crea la actividad con los datos proporcionados
    Y el campo "status" de la actividad creada es "PENDING"
    Y el campo "source" de la actividad creada es "MANUAL"
    Y la actividad recibe un identificador UUID único

  Escenario: Fallo al registrar una actividad con un campo obligatorio ausente
    Dado que el estudiante desea registrar una actividad académica
    Cuando el estudiante envía los siguientes datos omitiendo el campo "title":
      | campo       | valor                          |
      | course      | Calidad de Software            |
      | dueDate     | 2026-10-20T18:00:00            |
      | priority    | MEDIUM                         |
    Entonces el sistema rechaza la solicitud
    Y el sistema devuelve un error de validación indicando que el campo "title" es obligatorio
    Y ninguna actividad es almacenada en el sistema

  Escenario: Fallo al registrar una actividad con un valor de priority no permitido
    Dado que el estudiante desea registrar una actividad académica
    Cuando el estudiante envía los siguientes datos con un valor de priority inválido:
      | campo       | valor                          |
      | title       | Presentar proyecto final       |
      | course      | Ingeniería de Software         |
      | dueDate     | 2026-11-05T09:00:00            |
      | priority    | URGENT                         |
    Entonces el sistema rechaza la solicitud
    Y el sistema devuelve un error de validación indicando que "URGENT" no es un valor permitido para el campo "priority"
    Y ninguna actividad es almacenada en el sistema
