const dashboardState = {
    lastUpdatedAt: '2024-05-23T14:45:00Z',
    user: {
        name: 'Isai Martínez',
        email: 'isai@cedralsales.com',
        avatar: '',
    },
    summary: {
        published: 12,
        drafts: 3,
        review: 1,
        paused: 2,
    },
    analytics: {
        views: { value: 1842, trend: 12.5 },
        inquiries: { value: 47, trend: -5.4 },
        chats: { value: 6, trend: 0 },
        weeklyViews: [
            { label: 'Lun', value: 210 },
            { label: 'Mar', value: 265 },
            { label: 'Mié', value: 320 },
            { label: 'Jue', value: 298 },
            { label: 'Vie', value: 360 },
            { label: 'Sáb', value: 402 },
            { label: 'Dom', value: 287 },
        ],
    },
    alerts: [
        {
            id: 'alert-review',
            type: 'critical',
            title: 'Anuncio rechazado',
            message: 'Tu anuncio "Loft Cancún" fue rechazado. Revisa las observaciones del equipo de calidad.',
            meta: 'Hace 2 horas',
            actions: [
                { label: 'Ver motivos', variant: 'primary', action: 'review', payload: { entity: 'Loft Cancún' } },
                { label: 'Marcar como resuelto', variant: 'ghost', action: 'dismiss' },
            ],
        },
        {
            id: 'alert-messages',
            type: 'warning',
            title: 'Mensajes sin responder',
            message: 'Tienes 3 mensajes nuevos pendientes de respuesta.',
            meta: 'Hace 45 minutos',
            actions: [
                { label: 'Abrir bandeja', variant: 'secondary', action: 'navigate', payload: { target: 'mensajes' } },
                { label: 'Ignorar por ahora', variant: 'ghost', action: 'dismiss' },
            ],
        },
        {
            id: 'alert-verification',
            type: 'info',
            title: 'Verifica tu cuenta',
            message: 'Completa la verificación de identidad para activar todas las funcionalidades del panel.',
            meta: 'Ayer',
            actions: [
                { label: 'Continuar verificación', variant: 'primary', action: 'verify' },
            ],
        },
    ],
};

const numberFormatter = new Intl.NumberFormat('es-MX');
const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const computeInitials = (name = '') => {
    const trimmed = name.trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatTrend = (trendValue) => {
    if (trendValue > 0) {
        return { label: `▲ ${trendValue.toFixed(1)}% vs. semana pasada`, modifier: 'up' };
    }
    if (trendValue < 0) {
        return { label: `▼ ${Math.abs(trendValue).toFixed(1)}% vs. semana pasada`, modifier: 'down' };
    }
    return { label: '• Sin cambios vs. semana pasada', modifier: 'neutral' };
};

const createToastManager = () => {
    let container = document.querySelector('.dashboard__toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'dashboard__toast-container';
        document.body.appendChild(container);
    }

    return (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `dashboard__toast dashboard__toast--${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('dashboard__toast--visible');
        });

        const hideTimeout = setTimeout(() => {
            toast.classList.remove('dashboard__toast--visible');
            const removeTimeout = setTimeout(() => {
                toast.remove();
                clearTimeout(removeTimeout);
            }, 320);
        }, 2800);

        return () => {
            clearTimeout(hideTimeout);
            toast.classList.remove('dashboard__toast--visible');
            setTimeout(() => toast.remove(), 320);
        };
    };
};

const showToast = createToastManager();

const renderUserInfo = (user) => {
    const nameElement = document.querySelector('[data-profile-name]');
    const initialsElement = document.querySelector('[data-profile-initials]');
    const photoElement = document.querySelector('[data-profile-photo]');

    if (nameElement) {
        nameElement.textContent = user?.name || 'Usuario';
    }

    if (photoElement && user?.avatar) {
        photoElement.src = user.avatar;
        photoElement.alt = `Foto de perfil de ${user.name || 'usuario'}`;
        photoElement.hidden = false;
        if (initialsElement) {
            initialsElement.hidden = true;
        }
    } else if (initialsElement) {
        initialsElement.textContent = computeInitials(user?.name || user?.email);
        initialsElement.hidden = false;
        if (photoElement) {
            photoElement.hidden = true;
        }
    }
};

const renderLastUpdated = (isoDate) => {
    const target = document.querySelector('[data-dashboard-date]');
    if (!target || !isoDate) return;

    const updatedAt = new Date(isoDate);
    const now = new Date();
    const diffMs = updatedAt.getTime() - now.getTime();

    const diffMinutes = Math.round(diffMs / (1000 * 60));
    let relativeLabel;
    if (Math.abs(diffMinutes) < 60 * 24) {
        relativeLabel = RELATIVE_TIME_FORMATTER.format(Math.round(diffMinutes / 60), 'hour');
    } else {
        relativeLabel = RELATIVE_TIME_FORMATTER.format(Math.round(diffMinutes / (60 * 24)), 'day');
    }

    target.textContent = `Actualizado ${relativeLabel} • ${dateTimeFormatter.format(updatedAt)}`;
};

const renderSummary = (summary) => {
    Object.entries(summary).forEach(([key, value]) => {
        const element = document.querySelector(`[data-summary="${key}"]`);
        if (element) {
            element.textContent = numberFormatter.format(value);
        }
    });
};

const renderAnalytics = (analytics) => {
    Object.entries({ views: 'views', inquiries: 'inquiries', chats: 'chats' }).forEach(([key]) => {
        const valueElement = document.querySelector(`[data-analytics="${key}"]`);
        const trendElement = document.querySelector(`[data-analytics-trend="${key}"]`);
        const metric = analytics?.[key];
        if (!metric) return;

        if (valueElement) {
            valueElement.textContent = numberFormatter.format(metric.value);
        }

        if (trendElement) {
            trendElement.classList.remove('dashboard__kpi-trend--up', 'dashboard__kpi-trend--down', 'dashboard__kpi-trend--neutral');
            const { label, modifier } = formatTrend(metric.trend);
            trendElement.textContent = label;
            trendElement.classList.add(`dashboard__kpi-trend--${modifier}`);
        }
    });

    const chartContainer = document.querySelector('[data-chart]');
    if (!chartContainer) return;
    chartContainer.textContent = '';

    const weeklyData = analytics?.weeklyViews || [];
    if (!weeklyData.length) {
        chartContainer.innerHTML = '<p>No hay datos disponibles.</p>';
        return;
    }

    const maxValue = Math.max(...weeklyData.map((item) => item.value));
    weeklyData.forEach((item) => {
        const column = document.createElement('div');
        column.className = 'dashboard__chart-column';

        const bar = document.createElement('div');
        bar.className = 'dashboard__chart-bar';
        const height = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0;
        bar.style.height = `${height}%`;
        bar.setAttribute('data-value', `${numberFormatter.format(item.value)} vistas`);

        const label = document.createElement('span');
        label.className = 'dashboard__chart-label';
        label.textContent = item.label;

        column.appendChild(bar);
        column.appendChild(label);
        chartContainer.appendChild(column);
    });
};

const createAlertActionButton = ({ label, variant, action, payload = {} }, alertId) => {
    const button = document.createElement('button');
    button.className = `dashboard__button dashboard__button--${variant}`;
    button.type = 'button';
    button.textContent = label;
    button.dataset.alertAction = action;
    button.dataset.alertId = alertId;
    if (payload?.target) {
        button.dataset.alertTarget = payload.target;
    }
    if (payload?.entity) {
        button.dataset.alertEntity = payload.entity;
    }
    return button;
};

const renderAlerts = (alerts) => {
    const container = document.querySelector('[data-alerts]');
    if (!container) return;

    container.textContent = '';

    if (!alerts.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'dashboard__alerts-empty';
        emptyState.innerHTML = '<strong>No tienes alertas pendientes.</strong><br>¡Excelente trabajo!';
        container.appendChild(emptyState);
        return;
    }

    alerts.forEach((alert) => {
        const card = document.createElement('article');
        card.className = `dashboard__alert dashboard__alert--${alert.type || 'info'}`;
        card.dataset.alertId = alert.id;

        const info = document.createElement('div');
        info.className = 'dashboard__alert-info';

        const title = document.createElement('span');
        title.className = 'dashboard__alert-title';
        title.textContent = alert.title;
        info.appendChild(title);

        const text = document.createElement('span');
        text.className = 'dashboard__alert-text';
        text.textContent = alert.message;
        info.appendChild(text);

        if (alert.meta) {
            const meta = document.createElement('span');
            meta.className = 'dashboard__alert-meta';
            meta.textContent = alert.meta;
            info.appendChild(meta);
        }

        const actions = document.createElement('div');
        actions.className = 'dashboard__alert-actions';
        alert.actions?.forEach((action) => {
            actions.appendChild(createAlertActionButton(action, alert.id));
        });

        card.appendChild(info);
        card.appendChild(actions);
        container.appendChild(card);
    });
};

const initializeNavigation = () => {
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = document.querySelectorAll('[data-section]');

    const setActiveSection = (target) => {
        sections.forEach((section) => {
            const isTarget = section.dataset.section === target;
            section.hidden = !isTarget;
        });

        navLinks.forEach((link) => {
            if (link.dataset.nav === target) {
                link.classList.add('dashboard__nav-link--active');
            } else {
                link.classList.remove('dashboard__nav-link--active');
            }
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = link.dataset.nav;
            setActiveSection(target);
            if (target !== 'inicio') {
                showToast('Esta vista estará disponible muy pronto.', 'info');
            }
        });
    });

    setActiveSection('inicio');
};

const initializeAlertsInteractions = (state) => {
    const container = document.querySelector('[data-alerts]');
    if (!container) return;

    container.addEventListener('click', (event) => {
        const button = event.target.closest('[data-alert-action]');
        if (!button) return;

        const action = button.dataset.alertAction;
        const alertId = button.dataset.alertId;
        const alertIndex = state.alerts.findIndex((item) => item.id === alertId);
        if (alertIndex === -1) return;

        const [alert] = state.alerts.splice(alertIndex, 1);
        renderAlerts(state.alerts);

        switch (action) {
            case 'review':
                showToast(`Revisando observaciones para ${button.dataset.alertEntity || 'el anuncio'}.`, 'info');
                break;
            case 'navigate':
                showToast('Redirigiendo a la vista seleccionada…', 'info');
                break;
            case 'verify':
                showToast('Dirigiéndote al proceso de verificación.', 'warning');
                break;
            default:
                showToast('Alerta marcada como resuelta. ¡Bien hecho!', 'success');
                break;
        }
    });
};

const initializeProfileDashboard = () => {
    renderUserInfo(dashboardState.user);
    renderLastUpdated(dashboardState.lastUpdatedAt);
    renderSummary(dashboardState.summary);
    renderAnalytics(dashboardState.analytics);
    renderAlerts(dashboardState.alerts);
    initializeNavigation();
    initializeAlertsInteractions(dashboardState);
};

document.addEventListener('DOMContentLoaded', initializeProfileDashboard);
