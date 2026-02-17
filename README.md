📋 Mini Módulo de Auditorías - Sistema de Gestión Resiliente 

Este proyecto es una interfaz de producto real diseñada para la gestión de auditorías y puntos de control. Se ha puesto especial énfasis en la arquitectura de datos, la simulación asíncrona y una experiencia de usuario (UX) profesional y accesible. 

**Ver Página (Vercel)**

**Stack Tecnológico y Justificación** 

He seleccionado estas herramientas para garantizar un desarrollo ágil, tipado y escalable: 

**React 18 + TypeScript:** Elección estándar para aplicaciones empresariales. TypeScript asegura la integridad de los datos (Audit, Check, Template) en todo el flujo de la aplicación. 

**Vite:** Como motor de construcción por su velocidad casi instantánea en el entorno de desarrollo. 

**Tailwind CSS v4:** Para una maquetación rápida y consistente, permitiendo un diseño responsive sin el overhead de archivos CSS externos. 

**React Router Dom:** Implementado para gestionar la navegación y, fundamentalmente, para la persistencia de filtros en la URL (Query Params). 

**Vitest:** Utilizado para garantizar que la lógica de negocio crítica (cálculo de progreso y estados) sea 100% fiable. 

**Arquitectura del Proyecto**

El código está organizado por capas para separar la lógica de la representación visual: 

**src/services:** Capa de abstracción de datos. Simula una API real con latencia variable (300-1200ms) y manejo de errores aleatorios (15%). 

**src/hooks:** Custom Hooks que orquestan el estado complejo, como el motor de ejecución secuencial y la sincronización con la URL. 

**src/utils:** Funciones puras de lógica de negocio desacopladas de React para facilitar su testeo unitario. 

**src/mocks:** Generación de un dataset realista (60+ auditorías, 10 plantillas, 12 responsables) cumpliendo con los requisitos de volumen del PDF. 

⚙️ Funcionalidades Destacadas 

**1. Motor de Simulación Asíncrona **

Al ejecutar una auditoría, los puntos de control pasan por un ciclo de vida real: PENDING → QUEUED → RUNNING → OK/KO. He implementado bloques try...finally para asegurar que la UI nunca se bloquee ante fallos de red simulados. 

**2. UI Optimista y Rollback**

En las evaluaciones manuales, la interfaz responde al instante. Si la persistencia en el "servidor" falla, el sistema realiza un rollback automático al estado anterior, garantizando que el usuario siempre vea información veraz. 

**3. Modo Offline Simulado**

He incluido un interruptor en la barra superior para forzar el estado Offline. Al activarlo, la aplicación sirve los datos desde el caché local (localStorage), demostrando la resiliencia del sistema en condiciones de baja conectividad. 

**Instalación y Arranque**

**Clonar el repositorio:**

``
git clone https://github.com/rafi412/PruebaFrontend.git 
``

**Instalar dependencias:**
``
npm install 
``

**Ejecutar en desarrollo:**

``
npm run dev 
``

**Ejecutar tests unitarios:**

``
npm run test 
``
 

**Próximos Pasos (Roadmap)**

Persistencia en Base de Datos: Migrar la capa de services a una API real (Node.js/Python). 

Edición de Evidencias: Permitir la subida de imágenes o texto en cada punto de control. 

Dashboard Estadístico: Implementar gráficos de cumplimiento por proceso utilizando Recharts. 

PWA: Configurar Service Workers para una experiencia offline nativa sin necesidad de simulación. 

 

**Nota para el evaluador**

La aplicación incluye una tasa de error aleatoria del 15% en las peticiones para demostrar el manejo de estados de error y el botón de reintento. Si experimenta un error de carga, es un comportamiento esperado y diseñado para la prueba. 

 
