// Sistema de Prestaciones Sociales - LOTT Venezuela
// Aplicación JavaScript para gestión de personal y cálculo de prestaciones

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

const API_BASE_URL = window.location.origin + '/api';

// ============================================
// ALMACENAMIENTO DE DATOS (API REST con SQLite)
// ============================================

const DB = {
    // Obtener datos del ente público
    getEnte: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/ente`);
            if (!response.ok) throw new Error('Error al obtener ente');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return this.getEnteDefault();
        }
    },

    // Datos por defecto del ente
    getEnteDefault: function() {
        return {
            nombre: 'Ente Público',
            rif: 'G-00000000-0',
            direccion: '',
            telefono: '',
            email: '',
            pagina: '',
            logo: '',
            tasaIntereses: 12,
            tipoCambio: 0,
            salarioMinimo: 0,
            bonoAlimentacion: 0,
            mision: '',
            notas: ''
        };
    },

    // Guardar datos del ente
    saveEnte: async function(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/ente/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al guardar ente');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Obtener lista de trabajadores
    getTrabajadores: async function(filtros = {}) {
        try {
            const params = new URLSearchParams(filtros);
            const response = await fetch(`${API_BASE_URL}/trabajadores?${params}`);
            if (!response.ok) throw new Error('Error al obtener trabajadores');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Agregar trabajador
    addTrabajador: async function(trabajador) {
        try {
            const response = await fetch(`${API_BASE_URL}/trabajadores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trabajador)
            });
            if (!response.ok) throw new Error('Error al agregar trabajador');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Actualizar trabajador
    updateTrabajador: async function(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al actualizar trabajador');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Eliminar trabajador
    deleteTrabajador: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar trabajador');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Buscar trabajador por ID
    getTrabajadorById: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`);
            if (!response.ok) throw new Error('Error al obtener trabajador');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },

    // Obtener parámetros LOTT
    getParametros: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/parametros`);
            if (!response.ok) throw new Error('Error al obtener parámetros');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },

    // Guardar parámetros
    saveParametros: async function(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/parametros/${data.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Error al guardar parámetros');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Guardar cálculo
    saveCalculo: async function(calculo) {
        try {
            const response = await fetch(`${API_BASE_URL}/calculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(calculo)
            });
            if (!response.ok) throw new Error('Error al guardar cálculo');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    // Obtener cálculos
    getCalculos: async function(trabajador_id = null) {
        try {
            const params = trabajador_id ? `?trabajador_id=${trabajador_id}` : '';
            const response = await fetch(`${API_BASE_URL}/calculos${params}`);
            if (!response.ok) throw new Error('Error al obtener cálculos');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Obtener estadísticas del dashboard
    getDashboardStats: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
            if (!response.ok) throw new Error('Error al obtener estadísticas');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
};

// ============================================
// UTILIDADES
// ============================================

const Utils = {
    // Formatear moneda
    formatMoney: function(amount) {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'VES',
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Formatear fecha
    formatDate: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // Calcular diferencia de días entre dos fechas
    daysBetween: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Calcular tiempo de servicio en años, meses y días
    calculateServiceTime: function(fechaIngreso, fechaFin) {
        const inicio = new Date(fechaIngreso);
        const fin = fechaFin ? new Date(fechaFin) : new Date();

        let years = fin.getFullYear() - inicio.getFullYear();
        let months = fin.getMonth() - inicio.getMonth();
        let days = fin.getDate() - inicio.getDate();

        if (days < 0) {
            months--;
            days += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days, totalDays: this.daysBetween(fechaIngreso, fechaFin) };
    },

    // Validar RIF venezolano
    validateRIF: function(rif) {
        const pattern = /^[VEJPGvejpg]-\d{8}-\d$/;
        return pattern.test(rif);
    },

    // Generar ID único
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ============================================
// CÁLCULO DE PRESTACIONES (LOTT Venezuela)
// ============================================

const CalculadoraLOTT = {
    // Calcular salario integral
    calcularSalarioIntegral: function(salarioBase, bonificaciones = 0) {
        // Salario integral = salario base + alícuota de utilidades + alícuota de bono vacacional
        const alicuotaUtilidades = salarioBase / 12;
        const alicuotaBonoVacacional = salarioBase / 12;
        return salarioBase + alicuotaUtilidades + alicuotaBonoVacacional + bonificaciones;
    },

    // Calcular prestaciones por antigüedad (Art. 142 LOTT)
    calcularPrestacionesAntiguedad: function(salarioIntegral, tiempoServicio) {
        // 30 días por cada año de servicio o fracción superior a 6 meses
        const years = tiempoServicio.years;
        const months = tiempoServicio.months;

        // Calcular días acumulados
        let diasAcumulados = years * 30;

        // Si la fracción es mayor a 6 meses, se agrega otro mes
        if (months > 6) {
            diasAcumulados += 30;
        } else if (months > 0) {
            // Proporcional por los meses
            diasAcumulados += (months * 30) / 12;
        }

        // Calcular monto: (salario integral * días acumulados) / 30
        const monto = (salarioIntegral * diasAcumulados) / 30;

        return {
            diasAcumulados,
            monto,
            formula: `(${Utils.formatMoney(salarioIntegral)} × ${diasAcumulados} días) ÷ 30`
        };
    },

    // Calcular intereses sobre prestaciones (Art. 144 LOTT)
    calcularIntereses: function(prestaciones, tasaAnual, tiempoServicio) {
        // Tasa fija más 2 puntos porcentuales sobre la tasa activa bancaria
        const tasaAjustada = tasaAnual + 2;
        const anos = tiempoServicio.totalDays / 365;

        // Interés simple anual
        const interes = prestaciones * (tasaAjustada / 100) * anos;

        return {
            monto: interes,
            tasa: tasaAjustada,
            formula: `${Utils.formatMoney(prestaciones)} × ${(tasaAjustada).toFixed(2)}% × ${anos.toFixed(2)} años`
        };
    },

    // Calcular bono vacacional (Art. 190 LOTT)
    calcularBonoVacacional: function(salarioBase, aniosServicio, diasVacaciones = 15) {
        // 7 días adicionales por cada año después del primero
        let diasAdicionales = 0;
        if (aniosServicio > 1) {
            diasAdicionales = (aniosServicio - 1) * 7;
        }

        const diasTotales = diasVacaciones + diasAdicionales;
        const monto = (salarioBase * diasTotales) / 30;

        return {
            diasVacaciones: diasVacaciones,
            diasAdicionales: diasAdicionales,
            diasTotales: diasTotales,
            monto: monto,
            formula: `(${Utils.formatMoney(salarioBase)} × ${diasTotales} días) ÷ 30`
        };
    },

    // Calcular utilidades (Art. 174 LOTT)
    calcularUtilidades: function(salarioBase, diasTrabajados, diasAnio = 360) {
        // Mínimo 15 días, máximo 120 días de salario
        const diasProporcionales = (salarioBase * diasTrabajados) / diasAnio;
        const diasGarantizados = Math.max(15, diasProporcionales);

        return {
            dias: Math.min(120, diasGarantizados),
            monto: salarioBase * (Math.min(120, diasGarantizados) / 30),
            formula: `${Utils.formatMoney(salarioBase)} × días proporcionales`
        };
    },

    // Cálculo completo de prestaciones
    calcularPrestacionesCompletas: function(trabajador, params) {
        const fechaCalculo = params.fechaCalculo || new Date().toISOString();
        const tiempoServicio = Utils.calculateServiceTime(trabajador.fechaIngreso, fechaCalculo);

        const salarioIntegral = this.calcularSalarioIntegral(
            parseFloat(trabajador.salario),
            parseFloat(params.otrasBonificaciones || 0)
        );

        const prestaciones = this.calcularPrestacionesAntiguedad(salarioIntegral, tiempoServicio);
        const intereses = this.calcularIntereses(prestaciones.monto, params.tasaIntereses || 12, tiempoServicio);

        let total = prestaciones.monto;

        // Si es por egreso, se incluyen intereses
        if (params.tipoCalculo === 'egreso') {
            total += intereses.monto;
        }

        return {
            trabajador: trabajador,
            fechaCalculo: fechaCalculo,
            tipoCalculo: params.tipoCalculo,
            tiempoServicio: tiempoServicio,
            salarioIntegral: salarioIntegral,
            prestaciones: prestaciones,
            intereses: intereses,
            total: total,
            detalle: {
                concepto: 'Prestaciones por Antigüedad',
                formula: prestaciones.formula,
                monto: prestaciones.monto
            }
        };
    }
};

// ============================================
// MANEJO DEL DOM Y UI
// ============================================

const UI = {
    // Actualizar header con datos del ente
    updateHeader: function() {
        const ente = DB.getEnte();

        const headerLogo = document.getElementById('header-logo');
        const headerNombre = document.getElementById('ente-nombre');
        const headerRif = document.getElementById('ente-rif');

        if (headerLogo) {
            if (ente.logo) {
                headerLogo.src = ente.logo;
                headerLogo.style.display = 'block';
            } else {
                headerLogo.style.display = 'none';
            }
        }

        if (headerNombre) {
            headerNombre.textContent = ente.nombre;
        }

        if (headerRif) {
            headerRif.textContent = `RIF: ${ente.rif}`;
        }
    },

    // Mostrar notificación
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Confirmar acción
    confirmAction: function(message) {
        return confirm(message);
    }
};

// ============================================
// INICIALIZACIÓN POR PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Actualizar header en todas las páginas
    UI.updateHeader();

    // Detectar página actual y ejecutar inicialización correspondiente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    switch(currentPage) {
        case 'index.html':
        case '':
            initDashboard();
            break;
        case 'personal.html':
            initPersonalPage();
            break;
        case 'calculo.html':
            initCalculoPage();
            break;
        case 'configuracion.html':
            initConfigPage();
            break;
    }
});

// ============================================
// PÁGINA PRINCIPAL (DASHBOARD)
// ============================================

function initDashboard() {
    const trabajadores = DB.getTrabajadores();
    const activos = trabajadores.filter(t => t.estado === 'activo').length;
    const inactivos = trabajadores.filter(t => ['egresado', 'suspendido'].includes(t.estado)).length;
    const calculos = DB.getCalculos().length;

    document.getElementById('total-trabajadores').textContent = trabajadores.length;
    document.getElementById('trabajadores-activos').textContent = activos;
    document.getElementById('trabajadores-inactivos').textContent = inactivos;
    document.getElementById('prestaciones-calculadas').textContent = calculos;
}

// ============================================
// PÁGINA DE GESTIÓN DE PERSONAL
// ============================================

function initPersonalPage() {
    const form = document.getElementById('trabajador-form');
    const tabla = document.getElementById('tabla-trabajadores');
    const buscador = document.getElementById('buscador');
    const filtroEstado = document.getElementById('filtro-estado');

    // Cargar trabajadores en la tabla
    cargarTrabajadoresTabla();

    // Manejar envío del formulario
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const id = document.getElementById('trabajador-id').value;
            const trabajadorData = {
                cedula: document.getElementById('cedula').value,
                nombre: document.getElementById('nombre').value,
                fechaIngreso: document.getElementById('fecha-ingreso').value,
                cargo: document.getElementById('cargo').value,
                salario: parseFloat(document.getElementById('salario').value),
                departamento: document.getElementById('departamento').value,
                estado: document.getElementById('estado').value,
                fechaEgreso: document.getElementById('fecha-egreso').value || null
            };

            if (id) {
                // Actualizar existente
                DB.updateTrabajador(id, trabajadorData);
                UI.showNotification('Trabajador actualizado exitosamente', 'success');
            } else {
                // Crear nuevo
                DB.addTrabajador(trabajadorData);
                UI.showNotification('Trabajador agregado exitosamente', 'success');
            }

            form.reset();
            document.getElementById('trabajador-id').value = '';
            cargarTrabajadoresTabla();
        });
    }

    // Buscador
    if (buscador) {
        buscador.addEventListener('input', cargarTrabajadoresTabla);
    }

    // Filtro por estado
    if (filtroEstado) {
        filtroEstado.addEventListener('change', cargarTrabajadoresTabla);
    }

    function cargarTrabajadoresTabla() {
        const trabajadores = DB.getTrabajadores();
        const busqueda = buscador ? buscador.value.toLowerCase() : '';
        const estadoFiltro = filtroEstado ? filtroEstado.value : 'todos';

        let filtrados = trabajadores;

        // Filtrar por búsqueda
        if (busqueda) {
            filtrados = filtrados.filter(t =>
                t.cedula.toLowerCase().includes(busqueda) ||
                t.nombre.toLowerCase().includes(busqueda)
            );
        }

        // Filtrar por estado
        if (estadoFiltro !== 'todos') {
            filtrados = filtrados.filter(t => t.estado === estadoFiltro);
        }

        if (tabla) {
            tabla.innerHTML = filtrados.map(t => `
                <tr>
                    <td>${t.cedula}</td>
                    <td>${t.nombre}</td>
                    <td>${t.cargo}</td>
                    <td>${Utils.formatDate(t.fechaIngreso)}</td>
                    <td>${Utils.formatMoney(t.salario)}</td>
                    <td><span class="status-badge status-${t.estado}">${t.estado}</span></td>
                    <td>
                        <button class="action-btn action-btn-view" onclick="verTrabajador('${t.id}')">👁</button>
                        <button class="action-btn action-btn-edit" onclick="editarTrabajador('${t.id}')">✏️</button>
                        <button class="action-btn action-btn-delete" onclick="eliminarTrabajador('${t.id}')">🗑</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Hacer funciones globales
    window.editarTrabajador = function(id) {
        const trabajador = DB.getTrabajadorById(id);
        if (trabajador) {
            document.getElementById('trabajador-id').value = trabajador.id;
            document.getElementById('cedula').value = trabajador.cedula;
            document.getElementById('nombre').value = trabajador.nombre;
            document.getElementById('fecha-ingreso').value = trabajador.fechaIngreso;
            document.getElementById('cargo').value = trabajador.cargo;
            document.getElementById('salario').value = trabajador.salario;
            document.getElementById('departamento').value = trabajador.departamento;
            document.getElementById('estado').value = trabajador.estado;
            document.getElementById('fecha-egreso').value = trabajador.fechaEgreso || '';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.eliminarTrabajador = function(id) {
        if (UI.confirmAction('¿Está seguro de eliminar este trabajador? Esta acción no se puede deshacer.')) {
            DB.deleteTrabajador(id);
            UI.showNotification('Trabajador eliminado exitosamente', 'success');
            cargarTrabajadoresTabla();
        }
    };

    window.verTrabajador = function(id) {
        const trabajador = DB.getTrabajadorById(id);
        if (trabajador) {
            alert(`
                Cédula: ${trabajador.cedula}
                Nombre: ${trabajador.nombre}
                Cargo: ${trabajador.cargo}
                Fecha de Ingreso: ${Utils.formatDate(trabajador.fechaIngreso)}
                Salario: ${Utils.formatMoney(trabajador.salario)}
                Departamento: ${trabajador.departamento}
                Estado: ${trabajador.estado}
            `);
        }
    };
}

// ============================================
// PÁGINA DE CÁLCULO DE PRESTACIONES
// ============================================

function initCalculoPage() {
    const selectTrabajador = document.getElementById('trabajador-select');
    const btnCargar = document.getElementById('btn-cargar-trabajador');
    const btnCalcular = document.getElementById('btn-calcular');
    const btnImprimir = document.getElementById('btn-imprimir');

    // Llenar selector de trabajadores
    if (selectTrabajador) {
        const trabajadores = DB.getTrabajadores().filter(t => t.estado !== 'egresado');
        selectTrabajador.innerHTML = '<option value="">-- Seleccione un trabajador --</option>' +
            trabajadores.map(t => `<option value="${t.id}">${t.cedula} - ${t.nombre}</option>`).join('');
    }

    // Cargar información del trabajador
    if (btnCargar) {
        btnCargar.addEventListener('click', function() {
            const id = selectTrabajador.value;
            if (!id) {
                UI.showNotification('Seleccione un trabajador', 'error');
                return;
            }

            const trabajador = DB.getTrabajadorById(id);
            if (trabajador) {
                // Mostrar información
                document.getElementById('worker-info-display').style.display = 'block';
                document.getElementById('calculation-form').style.display = 'block';

                document.getElementById('info-cedula').textContent = trabajador.cedula;
                document.getElementById('info-nombre').textContent = trabajador.nombre;
                document.getElementById('info-cargo').textContent = trabajador.cargo;
                document.getElementById('info-ingreso').textContent = Utils.formatDate(trabajador.fechaIngreso);
                document.getElementById('info-salario').textContent = Utils.formatMoney(trabajador.salario);

                const tiempo = Utils.calculateServiceTime(trabajador.fechaIngreso);
                document.getElementById('info-tiempo').textContent =
                    `${tiempo.years} años, ${tiempo.months} meses, ${tiempo.days} días`;

                // Establecer fecha de cálculo como hoy
                document.getElementById('fecha-calculo').valueAsDate = new Date();

                // Calcular salario integral preliminar
                const salarioIntegral = CalculadoraLOTT.calcularSalarioIntegral(trabajador.salario);
                document.getElementById('salario-integral').value = salarioIntegral.toFixed(2);
            }
        });
    }

    // Calcular prestaciones
    if (btnCalcular) {
        btnCalcular.addEventListener('click', function() {
            const id = selectTrabajador.value;
            if (!id) {
                UI.showNotification('Seleccione un trabajador', 'error');
                return;
            }

            const trabajador = DB.getTrabajadorById(id);
            const params = {
                tipoCalculo: document.getElementById('tipo-calculo').value,
                fechaCalculo: document.getElementById('fecha-calculo').value,
                otrasBonificaciones: 0,
                tasaIntereses: DB.getEnte().tasaIntereses
            };

            const resultado = CalculadoraLOTT.calcularPrestacionesCompletas(trabajador, params);

            // Mostrar resultados
            document.getElementById('results-container').style.display = 'block';

            const tbody = document.getElementById('tabla-resultados');
            tbody.innerHTML = `
                <tr>
                    <td>Prestaciones por Antigüedad</td>
                    <td>${resultado.prestaciones.formula}</td>
                    <td>${Utils.formatMoney(resultado.prestaciones.monto)}</td>
                </tr>
                ${params.tipoCalculo === 'egreso' ? `
                <tr>
                    <td>Intereses sobre Prestaciones</td>
                    <td>${resultado.intereses.formula}</td>
                    <td>${Utils.formatMoney(resultado.intereses.monto)}</td>
                </tr>
                ` : ''}
            `;

            document.getElementById('total-prestaciones').textContent = Utils.formatMoney(resultado.total);

            // Mostrar detalles
            document.getElementById('detalle-antiguedad').textContent =
                `${resultado.tiempoServicio.years} años, ${resultado.tiempoServicio.months} meses y ${resultado.tiempoServicio.days} días de servicio`;

            document.getElementById('detalle-salario-integral').textContent =
                `Bs. ${Utils.formatMoney(resultado.salarioIntegral)} (incluye alícuotas de utilidades y bono vacacional)`;

            document.getElementById('detalle-intereses').textContent =
                `Tasa aplicada: ${(resultado.intereses.tasa).toFixed(2)}% anual durante ${resultado.tiempoServicio.totalDays} días`;

            // Guardar cálculo
            DB.saveCalculo(resultado);

            UI.showNotification('Cálculo realizado exitosamente', 'success');
        });
    }

    // Imprimir reporte
    if (btnImprimir) {
        btnImprimir.addEventListener('click', function() {
            window.print();
        });
    }
}

// ============================================
// PÁGINA DE CONFIGURACIÓN
// ============================================

function initConfigPage() {
    const form = document.getElementById('ente-form');
    const logoInput = document.getElementById('ente-logo');
    const logoPreview = document.getElementById('logo-preview');
    const btnLimpiar = document.getElementById('btn-limpiar-datos');

    // Cargar datos actuales
    const ente = DB.getEnte();

    if (form) {
        document.getElementById('ente-nombre-config').value = ente.nombre;
        document.getElementById('ente-rif-config').value = ente.rif;
        document.getElementById('ente-direccion').value = ente.direccion || '';
        document.getElementById('ente-telefono').value = ente.telefono || '';
        document.getElementById('ente-email').value = ente.email || '';
        document.getElementById('ente-pagina').value = ente.pagina || '';
        document.getElementById('tasa-intereses').value = ente.tasaIntereses || 12;
        document.getElementById('tipo-cambio').value = ente.tipoCambio || '';
        document.getElementById('salario-minimo').value = ente.salarioMinimo || '';
        document.getElementById('bono-alimentacion-base').value = ente.bonoAlimentacion || '';
        document.getElementById('ente-mision').value = ente.mision || '';
        document.getElementById('ente-notas').value = ente.notas || '';

        // Mostrar logo si existe
        if (ente.logo && logoPreview) {
            const img = logoPreview.querySelector('img');
            img.src = ente.logo;
            img.style.display = 'block';
            logoPreview.querySelector('span').style.display = 'none';
        }
    }

    // Manejar subida de logo
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    UI.showNotification('El archivo no debe superar 2MB', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = logoPreview.querySelector('img');
                    img.src = event.target.result;
                    img.style.display = 'block';
                    logoPreview.querySelector('span').style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Guardar configuración
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const enteData = {
                nombre: document.getElementById('ente-nombre-config').value,
                rif: document.getElementById('ente-rif-config').value,
                direccion: document.getElementById('ente-direccion').value,
                telefono: document.getElementById('ente-telefono').value,
                email: document.getElementById('ente-email').value,
                pagina: document.getElementById('ente-pagina').value,
                logo: logoPreview.querySelector('img').src || '',
                tasaIntereses: parseFloat(document.getElementById('tasa-intereses').value) || 12,
                tipoCambio: parseFloat(document.getElementById('tipo-cambio').value) || 0,
                salarioMinimo: parseFloat(document.getElementById('salario-minimo').value) || 0,
                bonoAlimentacion: parseFloat(document.getElementById('bono-alimentacion-base').value) || 0,
                mision: document.getElementById('ente-mision').value,
                notas: document.getElementById('ente-notas').value
            };

            DB.saveEnte(enteData);
            UI.updateHeader();
            UI.showNotification('Configuración guardada exitosamente', 'success');
        });
    }

    // Limpiar todos los datos
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            if (UI.confirmAction('⚠️ ADVERTENCIA: ¿Está seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
                localStorage.clear();
                UI.showNotification('Todos los datos han sido eliminados', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        });
    }
}
