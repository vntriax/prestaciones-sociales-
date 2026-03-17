const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Inicializar la base de datos SQLite
const dbPath = path.join(__dirname, '..', 'database', 'prestaciones.db');
const db = new sqlite3.Database(dbPath);

console.log('Conectando a la base de datos...');

db.serialize(() => {
    // Crear tablas
    console.log('Creando tablas de la base de datos...');

    // Tabla: entes_publicos
    db.run(`
        CREATE TABLE IF NOT EXISTS entes_publicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            rif TEXT UNIQUE NOT NULL,
            direccion TEXT,
            telefono TEXT,
            email TEXT,
            pagina_web TEXT,
            logo TEXT,
            tasa_intereses REAL DEFAULT 12,
            tipo_cambio REAL DEFAULT 0,
            salario_minimo REAL DEFAULT 0,
            bono_alimentacion REAL DEFAULT 0,
            mision TEXT,
            notas TEXT,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla: trabajadores
    db.run(`
        CREATE TABLE IF NOT EXISTS trabajadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cedula TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            fecha_nacimiento DATE,
            fecha_ingreso DATE NOT NULL,
            fecha_egreso DATE,
            cargo TEXT NOT NULL,
            departamento TEXT,
            salario_base REAL NOT NULL,
            tipo_personal TEXT DEFAULT 'ordinario',
            estado TEXT DEFAULT 'activo',
            otras_bonificaciones REAL DEFAULT 0,
            observaciones TEXT,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla: parametros_lott
    db.run(`
        CREATE TABLE IF NOT EXISTS parametros_lott (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dias_vacaciones_base INTEGER DEFAULT 15,
            dias_bono_vacacional_base INTEGER DEFAULT 7,
            dias_utilidades_base INTEGER DEFAULT 30,
            tasa_interes_legal REAL DEFAULT 12,
            tope_dias_vacaciones INTEGER DEFAULT 15,
            tope_dias_bono INTEGER DEFAULT 7,
            tope_dias_utilidades INTEGER DEFAULT 120,
            tope_prestaciones INTEGER DEFAULT 30,
            fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla: calculos_prestaciones
    db.run(`
        CREATE TABLE IF NOT EXISTS calculos_prestaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trabajador_id INTEGER NOT NULL,
            fecha_calculo DATE NOT NULL,
            tipo_calculo TEXT DEFAULT 'consulta',
            motivo TEXT,
            tiempo_servicio_anios INTEGER,
            tiempo_servicio_meses INTEGER,
            tiempo_servicio_dias INTEGER,
            salario_integral REAL,
            prestaciones_antiguedad REAL,
            intereses_prestaciones REAL,
            vacaciones REAL,
            bono_vacacional REAL,
            utilidades REAL,
            total_pagar REAL,
            detalle_json TEXT,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE
        )
    `);

    // Tabla: historial_cambios
    db.run(`
        CREATE TABLE IF NOT EXISTS historial_cambios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tabla_afectada TEXT NOT NULL,
            registro_id INTEGER NOT NULL,
            accion TEXT NOT NULL,
            datos_anteriores TEXT,
            datos_nuevos TEXT,
            usuario TEXT,
            fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Insertar datos por defecto
    console.log('Insertando datos por defecto...');

    // Insertar ente público por defecto si no existe
    db.get('SELECT COUNT(*) as count FROM entes_publicos', (err, row) => {
        if (err) console.error(err);
        if (row && row.count === 0) {
            db.run(`
                INSERT INTO entes_publicos (nombre, rif, tasa_intereses)
                VALUES (?, ?, ?)
            `, ['Ente Público', 'G-00000000-0', 12], (err) => {
                if (!err) console.log('✓ Ente público por defecto creado');
            });
        }
    });

    // Insertar parámetros LOTT por defecto si no existen
    db.get('SELECT COUNT(*) as count FROM parametros_lott', (err, row) => {
        if (err) console.error(err);
        if (row && row.count === 0) {
            db.run(`
                INSERT INTO parametros_lott (
                    dias_vacaciones_base, dias_bono_vacacional_base,
                    dias_utilidades_base, tasa_interes_legal,
                    tope_dias_vacaciones, tope_dias_bono,
                    tope_dias_utilidades, tope_prestaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [15, 7, 30, 12, 15, 7, 120, 30], (err) => {
                if (!err) console.log('✓ Parámetros LOTT por defecto creados');
            });
        }
    });

    // Crear índices para mejorar rendimiento
    console.log('Creando índices...');
    db.run('CREATE INDEX IF NOT EXISTS idx_trabajadores_cedula ON trabajadores(cedula)');
    db.run('CREATE INDEX IF NOT EXISTS idx_trabajadores_estado ON trabajadores(estado)');
    db.run('CREATE INDEX IF NOT EXISTS idx_calculos_trabajador ON calculos_prestaciones(trabajador_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_calculos_fecha ON calculos_prestaciones(fecha_calculo)');
    db.run('CREATE INDEX IF NOT EXISTS idx_historial_tabla ON historial_cambios(tabla_afectada)');

    console.log('\n✅ Base de datos creada exitosamente en:', dbPath);
    console.log('\nTablas creadas:');
    console.log('  - entes_publicos');
    console.log('  - trabajadores');
    console.log('  - parametros_lott');
    console.log('  - calculos_prestaciones');
    console.log('  - historial_cambios');

    // Cerrar conexión
    db.close((err) => {
        if (err) console.error('Error al cerrar:', err);
        else console.log('\nConexión cerrada.');
    });
});

module.exports = db;
