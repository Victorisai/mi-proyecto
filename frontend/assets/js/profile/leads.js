(function (global) {
    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'leads' || panel.dataset.leadsInitialized === 'true') {
            return;
        }
        panel.dataset.leadsInitialized = 'true';

        const leadsData = [
            { id: 1, name: 'Juan Pérez', phone: '+52 999 123 4567', email: 'juan@mail.com', property: 'Lote Holbox · ID #L25', message: 'Estoy interesado en el lote cerca de la playa.', date: '2025-10-08', state: 'new' },
            { id: 2, name: 'Ana López', phone: '+52 998 111 2233', email: 'ana@correo.com', property: 'Casa Cancún · ID #A102', message: '¿Se puede visitar el sábado?', date: '2025-10-07', state: 'progress' },
            { id: 3, name: 'Carlos Ruiz', phone: '+52 984 321 7788', email: 'carlos@mx.com', property: 'Depto Centro · ID #D9', message: 'Busco financiamiento, ¿tienen opciones?', date: '2025-10-06', state: 'done' },
            { id: 4, name: 'María Gómez', phone: '+52 55 222 3344', email: 'maria@gm.com', property: 'Casa Cancún · ID #A102', message: 'Quiero más fotos y planos.', date: '2025-10-06', state: 'new' },
            { id: 5, name: 'Pedro Lara', phone: '+52 81 888 3344', email: 'pedro@ej.com', property: 'Lote Holbox · ID #L25', message: '¿Cuál es el precio final?', date: '2025-10-05', state: 'progress' },
            { id: 6, name: 'Laura Méndez', phone: '+52 442 555 8899', email: 'laura@me.com', property: 'Depto Centro · ID #D9', message: '¿Aceptan crédito bancario?', date: '2025-10-05', state: 'new' },
            { id: 7, name: 'Iván Soto', phone: '+52 33 777 9090', email: 'ivan@so.com', property: 'Casa Cancún · ID #A102', message: 'Estoy listo para ofertar.', date: '2025-10-04', state: 'progress' },
            { id: 8, name: 'Paula Ríos', phone: '+52 222 444 6666', email: 'paula@ri.com', property: 'Lote Holbox · ID #L25', message: 'Me interesa para inversión.', date: '2025-10-04', state: 'new' },
            { id: 9, name: 'Diego León', phone: '+52 55 444 8899', email: 'diego@le.com', property: 'Depto Centro · ID #D9', message: '¿Cuota de mantenimiento?', date: '2025-10-03', state: 'done' },
            { id: 10, name: 'Sofía Cruz', phone: '+52 81 333 1122', email: 'sofia@cr.com', property: 'Casa Cancún · ID #A102', message: 'Agendemos llamada mañana.', date: '2025-10-02', state: 'new' },
            { id: 11, name: 'Raúl Peña', phone: '+52 618 777 6655', email: 'raul@pe.com', property: 'Lote Holbox · ID #L25', message: '¿Se puede escriturar pronto?', date: '2025-10-02', state: 'progress' },
            { id: 12, name: 'Nadia Vega', phone: '+52 662 909 1122', email: 'nadia@ve.com', property: 'Depto Centro · ID #D9', message: 'Estoy comparando opciones.', date: '2025-10-01', state: 'new' }
        ];

        const pagination = { index: 0, size: 10 };
        const $ = (selector) => panel.querySelector(selector);

        const elements = {
            search: $('#leadSearch'),
            stateFilter: $('#leadStateFilter'),
            propertyFilter: $('#leadPropertyFilter'),
            dateRange: $('#leadDateRange'),
            tableBody: $('#leadRows'),
            countLabel: $('#leadsCount'),
            totalCount: $('#leadsTotal'),
            newCount: $('#leadsNew'),
            progressCount: $('#leadsProgress'),
            doneCount: $('#leadsDone'),
            rangeLabel: $('#leadsRange'),
            prevBtn: $('#leadsPrev'),
            nextBtn: $('#leadsNext'),
            exportBtn: $('#exportBtn'),
            drawer: $('#leadDrawer'),
            drawerName: $('#drawerName'),
            drawerEmail: $('#drawerEmail'),
            drawerPhone: $('#drawerPhone'),
            drawerProperty: $('#drawerProperty'),
            drawerDate: $('#drawerDate'),
            drawerState: $('#drawerState'),
            drawerMessage: $('#drawerMessage'),
            drawerMailto: $('#drawerMailto'),
            drawerWhats: $('#drawerWhats'),
            drawerMarkProgress: $('#drawerMarkProgress'),
            drawerMarkDone: $('#drawerMarkDone')
        };

        if (!elements.tableBody || !elements.search || !elements.stateFilter || !elements.propertyFilter || !elements.dateRange || !elements.prevBtn || !elements.nextBtn || !elements.exportBtn || !elements.drawer) {
            return;
        }

        const formatDate = (isoDate) => {
            const date = new Date(`${isoDate}T00:00:00`);
            return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
        };

        const stateIconMarkup = `
            <svg class="leads-state__icon" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="6"></circle>
            </svg>
        `.trim();

        const stateLabels = {
            new: 'Nuevo',
            progress: 'En seguimiento',
            done: 'Cerrado'
        };

        const stateClasses = {
            new: 'leads-state leads-state--new',
            progress: 'leads-state leads-state--progress',
            done: 'leads-state leads-state--done'
        };

        const buildStateBadge = (state) => {
            const safeState = stateClasses[state] ? state : 'new';
            const badgeLabel = stateLabels[safeState];
            const badgeClass = stateClasses[safeState];

            return `<span class="${badgeClass}">${stateIconMarkup}<span class="leads-state__label">${badgeLabel}</span></span>`;
        };

        let lastFiltered = leadsData.slice();

        const closeDrawer = () => {
            if (!elements.drawer) {
                return;
            }
            elements.drawer.classList.remove('is-active');
            elements.drawer.setAttribute('aria-hidden', 'true');
        };

        const openDrawer = (id) => {
            const lead = leadsData.find((item) => item.id === id);
            if (!lead || !elements.drawer) {
                return;
            }

            if (elements.drawerName) {
                elements.drawerName.textContent = lead.name;
            }
            if (elements.drawerEmail) {
                elements.drawerEmail.innerHTML = `<a class="leads-link" href="mailto:${lead.email}">${lead.email}</a>`;
            }
            if (elements.drawerPhone) {
                elements.drawerPhone.innerHTML = `<a class="leads-link" href="tel:${lead.phone}">${lead.phone}</a>`;
            }
            if (elements.drawerProperty) {
                elements.drawerProperty.textContent = lead.property;
            }
            if (elements.drawerDate) {
                elements.drawerDate.textContent = new Date(`${lead.date}T00:00:00`).toLocaleDateString('es-MX');
            }
            if (elements.drawerState) {
                elements.drawerState.innerHTML = buildStateBadge(lead.state);
            }
            if (elements.drawerMessage) {
                elements.drawerMessage.textContent = lead.message;
            }
            if (elements.drawerMailto) {
                elements.drawerMailto.href = `mailto:${lead.email}?subject=Interés%20en%20${encodeURIComponent(lead.property)}`;
            }
            if (elements.drawerWhats) {
                const whatsappNumber = lead.phone.replace(/\D/g, '');
                elements.drawerWhats.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${lead.name}, vi tu interés en ${lead.property}`)}`;
            }
            if (elements.drawerMarkProgress) {
                elements.drawerMarkProgress.onclick = () => {
                    lead.state = 'progress';
                    closeDrawer();
                    renderTable();
                };
            }
            if (elements.drawerMarkDone) {
                elements.drawerMarkDone.onclick = () => {
                    lead.state = 'done';
                    closeDrawer();
                    renderTable();
                };
            }

            elements.drawer.classList.add('is-active');
            elements.drawer.setAttribute('aria-hidden', 'false');
        };

        const openWhatsApp = (id) => {
            const lead = leadsData.find((item) => item.id === id);
            if (!lead) {
                return;
            }
            const whatsappNumber = lead.phone.replace(/\D/g, '');
            window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${lead.name}, vi tu interés en ${lead.property}`)}`, '_blank');
        };

        const eyeIcon = `
            <svg class="leads-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1.5 12s3.6-6.5 10.5-6.5S22.5 12 22.5 12s-3.6 6.5-10.5 6.5S1.5 12 1.5 12Z"></path>
                <circle cx="12" cy="12" r="3.5"></circle>
            </svg>
        `.trim();

        const chatIcon = `
            <svg class="leads-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H9.9L5.7 19.5v-3H4.5A1.5 1.5 0 0 1 3 15V6a1.5 1.5 0 0 1 1.5-1.5Z"></path>
                <path d="M8.25 9.75h7.5"></path>
                <path d="M8.25 12.75h4.5"></path>
            </svg>
        `.trim();

        const renderTable = () => {
            const query = (elements.search.value || '').trim().toLowerCase();
            const stateFilter = elements.stateFilter.value;
            const propertyFilter = elements.propertyFilter.value;
            const dateRange = elements.dateRange.value;

            let filtered = leadsData.filter((lead) => {
                const searchable = `${lead.name}${lead.email}${lead.phone}${lead.message}${lead.property}`.toLowerCase();
                const matchesQuery = !query || searchable.includes(query);
                const matchesState = stateFilter === 'all' || lead.state === stateFilter;
                const matchesProperty = propertyFilter === 'all' || lead.property === propertyFilter;

                let matchesDate = true;
                const today = new Date();
                const leadDate = new Date(`${lead.date}T00:00:00`);

                if (dateRange === 'today') {
                    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    matchesDate = leadDate >= start;
                } else if (dateRange === 'week') {
                    const start = new Date(today);
                    start.setDate(start.getDate() - 7);
                    matchesDate = leadDate >= start;
                } else if (dateRange === 'month') {
                    const start = new Date(today);
                    start.setMonth(start.getMonth() - 1);
                    matchesDate = leadDate >= start;
                }

                return matchesQuery && matchesState && matchesProperty && matchesDate;
            });

            lastFiltered = filtered.slice();

            const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.size));
            pagination.index = Math.min(pagination.index, totalPages - 1);

            const start = pagination.index * pagination.size;
            const end = start + pagination.size;
            const pageRows = filtered.slice(start, end);

            elements.tableBody.innerHTML = pageRows.map((lead) => {
                const message = lead.message || '';
                const truncatedMessage = message.length > 48 ? `${message.slice(0, 48)}…` : message;
                return `
                    <tr>
                        <td>${lead.name}</td>
                        <td><a href="tel:${lead.phone}" class="leads-link">${lead.phone}</a></td>
                        <td><a href="mailto:${lead.email}" class="leads-link">${lead.email}</a></td>
                        <td>${lead.property}</td>
                        <td title="${message}">${truncatedMessage}</td>
                        <td>${formatDate(lead.date)}</td>
                        <td>${buildStateBadge(lead.state)}</td>
                        <td>
                            <div class="leads-row-actions">
                                <button class="leads-btn leads-btn--ghost leads-btn--icon" type="button" aria-label="Ver detalles" data-view="${lead.id}">${eyeIcon}</button>
                                <button class="leads-btn leads-btn--ghost leads-btn--icon" type="button" aria-label="Abrir WhatsApp" data-whats="${lead.id}">${chatIcon}</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            if (elements.countLabel) {
                elements.countLabel.textContent = `Total: ${filtered.length}`;
            }
            if (elements.totalCount) {
                elements.totalCount.textContent = filtered.length;
            }
            if (elements.newCount) {
                elements.newCount.textContent = filtered.filter((lead) => lead.state === 'new').length;
            }
            if (elements.progressCount) {
                elements.progressCount.textContent = filtered.filter((lead) => lead.state === 'progress').length;
            }
            if (elements.doneCount) {
                elements.doneCount.textContent = filtered.filter((lead) => lead.state === 'done').length;
            }

            if (elements.rangeLabel) {
                const rangeStart = filtered.length === 0 ? 0 : Math.min(start + 1, filtered.length);
                const rangeEnd = Math.min(end, filtered.length);
                elements.rangeLabel.textContent = `Mostrando ${rangeStart}–${rangeEnd} de ${filtered.length}`;
            }

            elements.prevBtn.disabled = pagination.index === 0 || filtered.length === 0;
            elements.nextBtn.disabled = end >= filtered.length;

            elements.tableBody.querySelectorAll('[data-view]').forEach((button) => {
                button.addEventListener('click', () => openDrawer(Number(button.dataset.view)));
            });

            elements.tableBody.querySelectorAll('[data-whats]').forEach((button) => {
                button.addEventListener('click', () => openWhatsApp(Number(button.dataset.whats)));
            });
        };

        elements.search.addEventListener('input', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.stateFilter.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.propertyFilter.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.dateRange.addEventListener('change', () => {
            pagination.index = 0;
            renderTable();
        });

        elements.prevBtn.addEventListener('click', () => {
            if (pagination.index > 0) {
                pagination.index -= 1;
                renderTable();
            }
        });

        elements.nextBtn.addEventListener('click', () => {
            pagination.index += 1;
            renderTable();
        });

        panel.querySelectorAll('[data-close]').forEach((element) => {
            element.addEventListener('click', closeDrawer);
        });

        elements.exportBtn.addEventListener('click', () => {
            const dataset = Array.isArray(lastFiltered) ? lastFiltered : leadsData;
            const rows = dataset.map((lead) => [
                lead.name,
                lead.phone,
                lead.email,
                lead.property,
                lead.message,
                lead.date,
                lead.state
            ]);
            const header = ['Nombre', 'Teléfono', 'Email', 'Propiedad', 'Mensaje', 'Fecha', 'Estado'];
            const csv = [header, ...rows]
                .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'leads.csv';
            link.click();
            URL.revokeObjectURL(link.href);
        });

        renderTable();
    
    };

    global.ProfileLeads = { init };
})(window);
