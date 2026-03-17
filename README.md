# Sistema de Prestaciones Sociales - LOTT Venezuela

Sistema completo para la gestión de prestaciones sociales según la Ley Orgánica del Trabajo, Trabajadores y Trabajadoras (LOTT) de Venezuela.

## 🚀 Características Principales

### Versión 2.0 - Con Base de Datos SQLite

- **Base de datos SQLite**: Almacenamiento persistente y robusto
- **API RESTful**: Endpoints completos para todas las operaciones
- **Interfaz moderna**: Diseño responsive y profesional
- **Cálculos automáticos**: Prestaciones, intereses, vacaciones, utilidades y bono vacacional
- **Gestión de personal**: CRUD completo de trabajadores
- **Configuración del ente**: Parámetros personalizables
- **Dashboard estadístico**: Métricas en tiempo real
- **Historial de cálculos**: Registro de todas las liquidaciones

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Inicializar la base de datos

```bash
npm run init-db
```

### 3. Iniciar el servidor

```bash
npm start
```

Acceda a: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
/workspace
├── server/
│   ├── server.js          # Servidor Express y rutas API
│   └── init-db.js         # Inicialización de base de datos
├── database/
│   └── prestaciones.db    # Base de datos SQLite
├── index.html             # Dashboard principal
├── personal.html          # Gestión de trabajadores
├── calculo.html           # Calculadora de prestaciones
├── configuracion.html     # Configuración del sistema
├── app.js                 # Lógica del cliente y comunicación API
├── styles.css             # Estilos CSS
└── package.json           # Dependencias y scripts
```

## 🔌 Endpoints de la API

- `GET/PUT /api/ente` - Datos del ente público
- `GET/POST/PUT/DELETE /api/trabajadores` - Gestión de trabajadores
- `GET/PUT /api/parametros` - Parámetros LOTT
- `GET/POST /api/calculos` - Cálculos de prestaciones
- `GET /api/dashboard/stats` - Estadísticas

## 🧮 Cálculos LOTT

El sistema calcula automáticamente:
1. Prestaciones de Antigüedad (Art. 142)
2. Intereses sobre Prestaciones (Art. 144)
3. Vacaciones (Art. 223)
4. Bono Vacacional (Art. 174)
5. Utilidades (Art. 174)

## 📄 Licencia

MIT License
