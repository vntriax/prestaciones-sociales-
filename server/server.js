const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Inicializar base de datos
const dbPath = path.join(__dirname, '..', 'database', 'prestaciones.db');
const db = new sqlite3.Database(dbPath);

// Función helper para ejecutar queries con promesas
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

// ============================================
// RUTAS DE LA API - ENTES PÚBLICOS
// ============================================

// Obtener ente público
app.get('/api/ente', (req, res) => {
    try {
        const ente = db.prepare('SELECT * FROM entes_publicos LIMIT 1').get();
        if (!ente) {
            return res.status(404).json({ error: 'Ente no encontrado' });
        }
        res.json(ente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar ente público
app.put('/api/ente/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const stmt = db.prepare(`
            UPDATE entes_publicos 
            SET nombre = ?, rif = ?, direccion = ?, telefono = ?, 
                email = ?, pagina_web = ?, logo = ?, tasa_intereses = ?,
                tipo_cambio = ?, salario_minimo = ?, bono_alimentacion = ?,
                mision = ?, notas = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            data.nombre, data.rif, data.direccion, data.telefono,
            data.email, data.pagina_web, data.logo, data.tasa_intereses,
            data.tipo_cambio, data.salario_minimo, data.bono_alimentacion,
            data.mision, data.notas, id
        );
        
        const updated = db.prepare('SELECT * FROM entes_publicos WHERE id = ?').get(id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTAS DE LA API - TRABAJADORES
// ============================================

// Obtener todos los trabajadores
app.get('/api/trabajadores', (req, res) => {
    try {
        const { estado, busqueda } = req.query;
        let query = 'SELECT * FROM trabajadores WHERE 1=1';
        const params = [];
        
        if (estado && estado !== 'todos') {
            query += ' AND estado = ?';
            params.push(estado);
        }
        
        if (busqueda) {
            query += ' AND (cedula LIKE ? OR nombre LIKE ? OR cargo LIKE ?)';
            const searchTerm = `%${busqueda}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        query += ' ORDER BY nombre ASC';
        
        const trabajadores = db.prepare(query).all(...params);
        res.json(trabajadores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener trabajador por ID
app.get('/api/trabajadores/:id', (req, res) => {
    try {
        const { id } = req.params;
        const trabajador = db.prepare('SELECT * FROM trabajadores WHERE id = ?').get(id);
        
        if (!trabajador) {
            return res.status(404).json({ error: 'Trabajador no encontrado' });
        }
        
        res.json(trabajador);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear trabajador
app.post('/api/trabajadores', (req, res) => {
    try {
        const data = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO trabajadores (
                cedula, nombre, fecha_nacimiento, fecha_ingreso, fecha_egreso,
                cargo, departamento, salario_base, tipo_personal, estado,
                otras_bonificaciones, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            data.cedula, data.nombre, data.fecha_nacimiento, data.fecha_ingreso, data.fecha_egreso,
            data.cargo, data.departamento, data.salario_base, data.tipo_personal, data.estado,
            data.otras_bonificaciones || 0, data.observaciones
        );
        
        const nuevo = db.prepare('SELECT * FROM trabajadores WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(nuevo);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'La cédula ya está registrada' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Actualizar trabajador
app.put('/api/trabajadores/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const stmt = db.prepare(`
            UPDATE trabajadores 
            SET cedula = ?, nombre = ?, fecha_nacimiento = ?, fecha_ingreso = ?,
                fecha_egreso = ?, cargo = ?, departamento = ?, salario_base = ?,
                tipo_personal = ?, estado = ?, otras_bonificaciones = ?,
                observaciones = ?, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            data.cedula, data.nombre, data.fecha_nacimiento, data.fecha_ingreso,
            data.fecha_egreso, data.cargo, data.departamento, data.salario_base,
            data.tipo_personal, data.estado, data.otras_bonificaciones || 0,
            data.observaciones, id
        );
        
        const updated = db.prepare('SELECT * FROM trabajadores WHERE id = ?').get(id);
        res.json(updated);
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({ error: 'La cédula ya está registrada' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Eliminar trabajador
app.delete('/api/trabajadores/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM trabajadores WHERE id = ?').run(id);
        res.json({ message: 'Trabajador eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTAS DE LA API - PARÁMETROS LOTT
// ============================================

// Obtener parámetros
app.get('/api/parametros', (req, res) => {
    try {
        const parametros = db.prepare('SELECT * FROM parametros_lott LIMIT 1').get();
        if (!parametros) {
            return res.status(404).json({ error: 'Parámetros no encontrados' });
        }
        res.json(parametros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar parámetros
app.put('/api/parametros/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const stmt = db.prepare(`
            UPDATE parametros_lott 
            SET dias_vacaciones_base = ?, dias_bono_vacacional_base = ?,
                dias_utilidades_base = ?, tasa_interes_legal = ?,
                tope_dias_vacaciones = ?, tope_dias_bono = ?,
                tope_dias_utilidades = ?, tope_prestaciones = ?,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            data.dias_vacaciones_base, data.dias_bono_vacacional_base,
            data.dias_utilidades_base, data.tasa_interes_legal,
            data.tope_dias_vacaciones, data.tope_dias_bono,
            data.tope_dias_utilidades, data.tope_prestaciones, id
        );
        
        const updated = db.prepare('SELECT * FROM parametros_lott WHERE id = ?').get(id);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTAS DE LA API - CÁLCULOS DE PRESTACIONES
// ============================================

// Obtener cálculos
app.get('/api/calculos', (req, res) => {
    try {
        const { trabajador_id } = req.query;
        let query = `
            SELECT c.*, t.nombre as trabajador_nombre, t.cedula as trabajador_cedula
            FROM calculos_prestaciones c
            JOIN trabajadores t ON c.trabajador_id = t.id
            WHERE 1=1
        `;
        const params = [];
        
        if (trabajador_id) {
            query += ' AND c.trabajador_id = ?';
            params.push(trabajador_id);
        }
        
        query += ' ORDER BY c.fecha_calculo DESC';
        
        const calculos = db.prepare(query).all(...params);
        res.json(calculos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Guardar cálculo
app.post('/api/calculos', (req, res) => {
    try {
        const data = req.body;
        
        const stmt = db.prepare(`
            INSERT INTO calculos_prestaciones (
                trabajador_id, fecha_calculo, tipo_calculo, motivo,
                tiempo_servicio_anios, tiempo_servicio_meses, tiempo_servicio_dias,
                salario_integral, prestaciones_antiguedad, intereses_prestaciones,
                vacaciones, bono_vacacional, utilidades, total_pagar, detalle_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            data.trabajador_id, data.fecha_calculo, data.tipo_calculo, data.motivo,
            data.tiempo_servicio_anios, data.tiempo_servicio_meses, data.tiempo_servicio_dias,
            data.salario_integral, data.prestaciones_antiguedad, data.intereses_prestaciones,
            data.vacaciones, data.bono_vacacional, data.utilidades, data.total_pagar,
            JSON.stringify(data.detalle)
        );
        
        const nuevo = db.prepare('SELECT * FROM calculos_prestaciones WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTAS DE LA API - ESTADÍSTICAS DASHBOARD
// ============================================

app.get('/api/dashboard/stats', (req, res) => {
    try {
        const stats = {
            total_trabajadores: db.prepare('SELECT COUNT(*) as count FROM trabajadores').get().count,
            trabajadores_activos: db.prepare("SELECT COUNT(*) as count FROM trabajadores WHERE estado = 'activo'").get().count,
            trabajadores_inactivos: db.prepare("SELECT COUNT(*) as count FROM trabajadores WHERE estado IN ('egresado', 'suspendido')").get().count,
            total_calculos: db.prepare('SELECT COUNT(*) as count FROM calculos_prestaciones').get().count,
            pasivo_laboral: db.prepare('SELECT COALESCE(SUM(total_pagar), 0) as total FROM calculos_prestaciones WHERE fecha_calculo = (SELECT MAX(fecha_calculo) FROM calculos_prestaciones)').get().total
        };
        
        // Calcular antigüedad promedio
        const avgAntiguedad = db.prepare(`
            SELECT AVG(julianday('now') - julianday(fecha_ingreso)) / 365 as promedio
            FROM trabajadores 
            WHERE estado = 'activo'
        `).get();
        
        stats.antiguedad_promedio = avgAntiguedad ? avgAntiguedad.promedio.toFixed(1) : 0;
        
        // Cumpleaños del mes
        const cumpleanosMes = db.prepare(`
            SELECT COUNT(*) as count FROM trabajadores 
            WHERE strftime('%m', fecha_nacimiento) = strftime('%m', 'now')
            AND estado = 'activo'
        `).get();
        
        stats.cumpleanos_mes = cumpleanosMes ? cumpleanosMes.count : 0;
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUTA COMODÍN PARA SPA
// ============================================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 Servidor iniciado exitosamente');
    console.log(`📡 Puerto: http://localhost:${PORT}`);
    console.log(`💾 Base de datos: ${dbPath}`);
    console.log('========================================\n');
});

module.exports = app;
