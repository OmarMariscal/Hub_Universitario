# Hub Universitario Personal

Plataforma web personal orientada a centralizar, organizar y priorizar las actividades académicas de estudiantes universitarios. 

Este proyecto está diseñado bajo estrictos estándares de Calidad de Software, preparándose desde su concepción para la evaluación bajo modelos de madurez de procesos (CMMI, ISO/IEC 15504) y normativas de calidad de producto (ISO/IEC 25010).

## 🏗️ Arquitectura y Diseño

El sistema opera en un entorno monorepo separando claramente las responsabilidades del cliente y el servidor. El núcleo del sistema (Backend) está construido utilizando **Clean Architecture** y **Domain-Driven Design (DDD)**. 

Esta decisión arquitectónica aísla las reglas de negocio del framework (NestJS) y la base de datos (PostgreSQL), garantizando:
- **Alta Testeabilidad:** Ejecución de pruebas unitarias en milisegundos.
- **Mantenibilidad:** Facilidad para aplicar reingeniería e integraciones futuras (Google Classroom, Notion, Pomodoro).
- **Escalabilidad:** Transición natural hacia una arquitectura de microservicios.

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, NestJS, TypeScript
- **Base de Datos:** PostgreSQL, Prisma ORM
- **Pruebas (TDD/BDD):** Jest, Cucumber (Jest-Cucumber)
- **Control de Versiones:** Git, GitHub (GitHub Flow)

## 📁 Estructura del Repositorio

```text
├── backend/            # API REST, Lógica de Dominio e Infraestructura (NestJS)
├── frontend/           # (Próximamente) Aplicación cliente 
└── README.md           # Documentación principal
```

## ⚙️ Configuración y Ejecución 
(Desarrollo): Actualmente, el proyecto se encuentra en la Fase 1 centrada en el Backend. 

Para levantar el entorno local:

- Clonar el repositorio:Bashgit clone <https://github.com/OmarMariscal/Hub_Universitario>
- cd Hub_Universitario
- Navegar al entorno backend:Bashcd backend
- Instalar dependencias aisladas:Bashnpm install
- Configurar variables de entorno y base de datos:(Las instrucciones detalladas de Prisma y PostgreSQL se añadirán al estabilizar la infraestructura).

## 🧪 Metodología y Calidad (Sprint 1)
El equipo sigue un enfoque ágil guiado por tres pilares de calidad metodológica:   
- TDD (Test-Driven Development): Todo código de producción se escribe siguiendo el ciclo RED -> GREEN -> REFACTOR. La evidencia de esta práctica reside en el historial de commits.   
- BDD (Behavior-Driven Development): El comportamiento del sistema se define colaborativamente mediante archivos .feature (Gherkin) antes de la implementación, validando los criterios de aceptación desde el inicio.   
- Clean Code: Estricta revisión por pares (Code Review) en cada Pull Request para asegurar nombres significativos, funciones de responsabilidad única y bajo acoplamiento.   

## 👥 Equipo y Responsabilidades Iniciales
Para asegurar la paralelización del trabajo en este primer incremento, las responsabilidades se distribuyen de la siguiente manera:   
- Integrante 1 (Proyecto y Arquitectura): Mantiene la visión común, define historias de usuario (ej. HU-01), estructura el backlog y gestiona la documentación técnica y de integración.   
- Integrante 2 (Desarrollo Base y TDD): Construye la base técnica, diseña el modelo de dominio en TypeScript puro, y ejecuta el ciclo estricto de TDD implementando la persistencia e infraestructura.
- Integrante 3 (Calidad y Evidencia BDD): Traduce los criterios de aceptación en pruebas de comportamiento (Cucumber), define los estándares de calidad (Definition of Done), y audita los Pull Requests para garantizar el cumplimiento del Clean Code.

## 🌿 Flujo de Trabajo (GitHub Flow)
Se prohíben los commits directos a main. Toda nueva funcionalidad o prueba se desarrolla en una rama específica (ej. feature/HU-01-registrar-actividad). Se integran los cambios mediante Pull Requests, requiriendo la aprobación de QA tras validar la ejecución de todas las suites de pruebas automatizadas y la cobertura de los criterios de aceptación.