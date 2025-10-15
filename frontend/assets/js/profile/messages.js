(function () {
    const conversations = [
        {
            id: 1,
            buyer: 'Juan Pérez',
            property: 'Lote Holbox · #L25',
            lastMessage: 'Gracias, quedo atento',
            lastAt: '10:32',
            unread: 2,
            status: 'open',
            pinned: true,
            online: true,
            email: 'juan.perez@mail.com',
            phone: '+52 999 123 4567',
            conversationCount: 3,
            propertyMeta: 'Chat iniciado desde publicación',
            files: ['brochure.pdf', 'plano.png'],
            timeline: ['10:10 · Conversación iniciada', '10:32 · Mensaje recibido', '10:35 · Leído por vendedor']
        },
        {
            id: 2,
            buyer: 'Ana López',
            property: 'Casa Cancún · #A102',
            lastMessage: 'Perfecto, el sábado',
            lastAt: 'ayer',
            unread: 0,
            status: 'open',
            pinned: false,
            online: false,
            email: 'ana.lopez@mail.com',
            phone: '+52 998 654 3210',
            conversationCount: 2,
            propertyMeta: 'Solicitud desde formulario',
            files: ['agenda.pdf'],
            timeline: ['Ayer · Mensaje enviado', 'Ayer · Reagendado', 'Ayer · Confirmación enviada']
        },
        {
            id: 3,
            buyer: 'Carlos Ruiz',
            property: 'Depto Centro · #D9',
            lastMessage: 'Listo, envío docs',
            lastAt: 'lun',
            unread: 0,
            status: 'closed',
            pinned: false,
            online: false,
            email: 'carlos.ruiz@mail.com',
            phone: '+52 55 3210 9876',
            conversationCount: 4,
            propertyMeta: 'Chat desde anuncio destacado',
            files: ['contrato.docx', 'pagos.pdf'],
            timeline: ['Lun · Mensaje enviado', 'Lun · Documentos compartidos']
        },
        {
            id: 4,
            buyer: 'Paula Ríos',
            property: 'Lote Holbox · #L25',
            lastMessage: '¿Hay descuento al contado?',
            lastAt: '09:15',
            unread: 3,
            status: 'open',
            pinned: false,
            online: true,
            email: 'paula.rios@mail.com',
            phone: '+52 998 111 2233',
            conversationCount: 1,
            propertyMeta: 'Referido por otro cliente',
            files: ['planos.pdf'],
            timeline: ['09:10 · Consulta recibida', '09:15 · Mensaje recibido']
        }
    ];

    const messagesByConversation = {
        1: [
            { mine: false, text: 'Hola, me interesa el lote.', at: '10:15' },
            { mine: true, text: 'Hola Juan, con gusto te apoyo. ¿Agendamos llamada?', at: '10:17' },
            { mine: false, text: 'Sí, hoy a las 6 pm.', at: '10:22' }
        ],
        2: [
            { mine: false, text: '¿Se puede visitar el sábado?', at: 'ayer' },
            { mine: true, text: 'Sí, 11am perfecto.', at: 'ayer' }
        ],
        3: [
            { mine: false, text: 'Busco financiamiento.', at: 'lun' },
            { mine: true, text: 'Te paso esquemas bancarios y directo.', at: 'lun' }
        ],
        4: [
            { mine: false, text: '¿Hay descuento al contado?', at: '09:15' }
        ]
    };

    const state = {
        activeId: null,
        connected: true,
        shortcutBound: false,
        intervalId: null
    };

    let panelRef = null;
    const elements = {};

    const getConversation = (id) => conversations.find((conversation) => conversation.id === id) || null;

    const createElement = (tagName, className) => {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        return element;
    };

    const renderKPIs = () => {
        if (!elements.kpiOpen || !elements.kpiUnread || !elements.kpiStatus) {
            return;
        }

        const openCount = conversations.filter((conversation) => conversation.status === 'open').length;
        const unreadCount = conversations.reduce((total, conversation) => total + conversation.unread, 0);

        elements.kpiOpen.textContent = openCount.toString();
        elements.kpiUnread.textContent = unreadCount.toString();
        elements.kpiStatus.textContent = state.connected ? 'Conectado' : 'Sin conexión';

        if (elements.offlineBanner) {
            elements.offlineBanner.classList.toggle('is-visible', !state.connected);
        }
    };

    const renderEmptyList = () => {
        if (!elements.list) {
            return;
        }
        const emptyState = createElement('div', 'messages__empty');
        emptyState.textContent = 'No hay conversaciones con estos filtros.';
        elements.list.innerHTML = '';
        elements.list.appendChild(emptyState);
    };

    const renderInbox = () => {
        if (!elements.list) {
            return;
        }

        const query = (elements.search ? elements.search.value : '').trim().toLowerCase();
        const propertyValue = elements.property ? elements.property.value : 'all';
        const onlyUnread = elements.filterUnread ? elements.filterUnread.checked : false;
        const pinnedFirst = elements.filterPinned ? elements.filterPinned.checked : false;
        const onlyOnline = elements.filterOnline ? elements.filterOnline.checked : false;

        let filtered = conversations.filter((conversation) => {
            if (propertyValue !== 'all' && conversation.property !== propertyValue) {
                return false;
            }
            if (onlyUnread && conversation.unread === 0) {
                return false;
            }
            if (onlyOnline && !conversation.online) {
                return false;
            }
            if (!query) {
                return true;
            }
            const haystack = `${conversation.buyer} ${conversation.property} ${conversation.lastMessage}`.toLowerCase();
            return haystack.includes(query);
        });

        filtered = filtered.sort((a, b) => {
            if (pinnedFirst && a.pinned !== b.pinned) {
                return Number(b.pinned) - Number(a.pinned);
            }
            if (b.unread !== a.unread) {
                return b.unread - a.unread;
            }
            return a.buyer.localeCompare(b.buyer, 'es');
        });

        renderKPIs();

        if (filtered.length === 0) {
            renderEmptyList();
            return;
        }

        elements.list.innerHTML = '';
        const fragment = document.createDocumentFragment();

        filtered.forEach((conversation) => {
            const item = createElement('div', 'messages__conversation-item');
            item.setAttribute('role', 'option');
            item.dataset.id = conversation.id.toString();

            if (conversation.id === state.activeId) {
                item.classList.add('is-active');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.removeAttribute('aria-selected');
            }

            const avatar = createElement('div', 'messages__conversation-avatar');
            avatar.textContent = conversation.buyer.charAt(0);

            const info = createElement('div', 'messages__conversation-info');

            const header = createElement('div', 'messages__conversation-header');
            const name = createElement('div', 'messages__conversation-name');
            name.textContent = conversation.buyer;

            if (conversation.online) {
                const statusDot = createElement('span', 'messages__status-dot');
                statusDot.setAttribute('title', 'En línea');
                name.appendChild(statusDot);
            }

            if (conversation.pinned) {
                const pin = createElement('span', 'messages__pin');
                const pinIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                pinIcon.setAttribute('class', 'messages__pin-icon');
                pinIcon.setAttribute('viewBox', '0 0 24 24');
                pinIcon.setAttribute('width', '16');
                pinIcon.setAttribute('height', '16');
                pinIcon.setAttribute('aria-hidden', 'true');

                const pinOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pinOutline.setAttribute('d', 'M12 3.25c-3.17 0-5.75 2.58-5.75 5.75 0 4.38 5.75 10.5 5.75 10.5s5.75-6.12 5.75-10.5c0-3.17-2.58-5.75-5.75-5.75z');
                pinOutline.setAttribute('fill', 'none');
                pinOutline.setAttribute('stroke', 'currentColor');
                pinOutline.setAttribute('stroke-width', '1.5');
                pinOutline.setAttribute('stroke-linejoin', 'round');

                const pinCenter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                pinCenter.setAttribute('cx', '12');
                pinCenter.setAttribute('cy', '9');
                pinCenter.setAttribute('r', '2.25');
                pinCenter.setAttribute('fill', 'currentColor');

                pinIcon.appendChild(pinOutline);
                pinIcon.appendChild(pinCenter);

                pin.appendChild(pinIcon);
                pin.setAttribute('title', 'Conversación fijada');
                name.appendChild(pin);
            }

            const time = createElement('div', 'messages__conversation-prop');
            time.textContent = conversation.lastAt;
            header.appendChild(name);
            header.appendChild(time);

            const property = createElement('div', 'messages__conversation-prop');
            property.textContent = conversation.property;

            const preview = createElement('div', 'messages__conversation-prop');
            preview.textContent = conversation.lastMessage;

            info.appendChild(header);
            info.appendChild(property);
            info.appendChild(preview);

            const right = createElement('div', 'messages__conversation-meta');
            if (conversation.unread > 0) {
                const badge = createElement('span', 'messages__badge');
                badge.textContent = conversation.unread.toString();
                right.appendChild(badge);
            }

            item.appendChild(avatar);
            item.appendChild(info);
            item.appendChild(right);

            item.addEventListener('click', () => openConversation(conversation.id));

            fragment.appendChild(item);
        });

        elements.list.appendChild(fragment);
    };

    const renderTimeline = (conversation) => {
        if (!elements.timeline) {
            return;
        }
        elements.timeline.innerHTML = '';
        const fragment = document.createDocumentFragment();
        (conversation.timeline || []).forEach((entry) => {
            const li = document.createElement('li');
            li.textContent = entry;
            fragment.appendChild(li);
        });
        elements.timeline.appendChild(fragment);
    };

    const renderFiles = (conversation) => {
        if (!elements.files) {
            return;
        }
        elements.files.innerHTML = '';
        const files = conversation.files && conversation.files.length > 0 ? conversation.files : ['Sin archivos recientes'];
        files.forEach((file) => {
            const tag = createElement('span', 'messages__tag');
            tag.textContent = file;
            elements.files.appendChild(tag);
        });
    };

    const renderMessages = () => {
        if (!elements.chatBody) {
            return;
        }

        elements.chatBody.innerHTML = '';

        if (!state.activeId) {
            const empty = createElement('div', 'messages__empty');
            empty.textContent = 'Elige una conversación de la lista para comenzar';
            elements.chatBody.appendChild(empty);
            return;
        }

        const conversationMessages = messagesByConversation[state.activeId] || [];

        if (conversationMessages.length > 0) {
            const daySeparator = createElement('div', 'messages__day-separator');
            daySeparator.textContent = 'Hoy';
            elements.chatBody.appendChild(daySeparator);
        }

        conversationMessages.forEach((message) => {
            const bubble = createElement('div', 'messages__bubble');
            bubble.classList.add(message.mine ? 'messages__bubble--mine' : 'messages__bubble--theirs');

            const text = createElement('div', 'messages__bubble-text');
            text.textContent = message.text;

            const meta = createElement('div', 'messages__bubble-meta');
            const time = createElement('span');
            time.textContent = message.at;
            meta.appendChild(time);

            if (message.mine) {
                const read = createElement('span');
                read.textContent = '✓✓';
                meta.appendChild(read);
            }

            const actions = createElement('div', 'messages__bubble-actions');
            const actionButtons = [
                { label: '📋', title: 'Copiar mensaje' },
                { label: '↩', title: 'Responder' },
                { label: '🗑', title: 'Eliminar' }
            ];

            actionButtons.forEach((config) => {
                const button = createElement('button', 'messages__button messages__button--icon');
                button.type = 'button';
                button.title = config.title;
                button.textContent = config.label;
                actions.appendChild(button);
            });

            bubble.appendChild(text);
            bubble.appendChild(meta);
            bubble.appendChild(actions);

            elements.chatBody.appendChild(bubble);
        });

        elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
    };

    const populateContext = (conversation) => {
        if (!conversation) {
            return;
        }

        if (elements.contextName) {
            elements.contextName.textContent = conversation.buyer;
        }
        if (elements.contextEmail) {
            elements.contextEmail.textContent = conversation.email;
        }
        if (elements.contextPhone) {
            elements.contextPhone.textContent = conversation.phone;
        }
        if (elements.contextCount) {
            elements.contextCount.textContent = conversation.conversationCount.toString();
        }
        if (elements.propertyTitle) {
            elements.propertyTitle.textContent = conversation.property;
        }
        if (elements.propertyMeta) {
            elements.propertyMeta.textContent = conversation.propertyMeta;
        }
        renderTimeline(conversation);
        renderFiles(conversation);
    };

    const openConversation = (conversationId) => {
        state.activeId = conversationId;
        const conversation = getConversation(conversationId);
        if (!conversation) {
            return;
        }

        if (elements.crumb) {
            elements.crumb.textContent = `Mensajes / ${conversation.property}`;
        }
        if (elements.headerAvatar) {
            elements.headerAvatar.textContent = conversation.buyer.charAt(0);
        }
        if (elements.headerName) {
            elements.headerName.textContent = conversation.buyer;
        }
        if (elements.headerSub) {
            const subtitle = conversation.online ? 'En línea' : `Últ. ${conversation.lastAt}`;
            elements.headerSub.textContent = `${conversation.property} · ${subtitle}`;
        }

        if (elements.messageInput) {
            elements.messageInput.disabled = false;
            elements.messageInput.focus();
        }
        if (elements.sendButton) {
            elements.sendButton.disabled = false;
        }

        populateContext(conversation);
        renderMessages();

        conversation.unread = 0;
        renderInbox();
    };

    const sendMessage = () => {
        if (!elements.messageInput || !state.activeId) {
            return;
        }
        const value = elements.messageInput.value.trim();
        if (!value) {
            return;
        }

        const now = new Date();
        const formatted = now.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const message = {
            mine: true,
            text: value,
            at: formatted
        };

        elements.messageInput.value = '';
        messagesByConversation[state.activeId] = (messagesByConversation[state.activeId] || []).concat(message);
        renderMessages();

        if (!elements.chatBody) {
            return;
        }

        const typing = createElement('div', 'messages__typing');
        typing.innerHTML = '<span>•••</span><span>Escribiendo…</span>';
        elements.chatBody.appendChild(typing);
        elements.chatBody.scrollTop = elements.chatBody.scrollHeight;

        window.setTimeout(() => {
            typing.remove();
            const reply = {
                mine: false,
                text: 'Recibido 👍',
                at: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            };
            messagesByConversation[state.activeId].push(reply);
            renderMessages();
        }, 1100);
    };

    const toggleConnection = () => {
        state.connected = Math.random() > 0.1;
        renderKPIs();
    };

    const bindEvents = () => {
        if (elements.search) {
            elements.search.addEventListener('input', renderInbox);
        }
        if (elements.property) {
            elements.property.addEventListener('change', renderInbox);
        }
        if (elements.filterUnread) {
            elements.filterUnread.addEventListener('change', renderInbox);
        }
        if (elements.filterPinned) {
            elements.filterPinned.addEventListener('change', renderInbox);
        }
        if (elements.filterOnline) {
            elements.filterOnline.addEventListener('change', renderInbox);
        }
        if (elements.sendButton) {
            elements.sendButton.addEventListener('click', sendMessage);
        }
        if (elements.messageInput) {
            elements.messageInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }

        if (!state.shortcutBound) {
            document.addEventListener('keydown', (event) => {
                if (!elements.search || !panelRef || !panelRef.classList.contains('profile__panel--active')) {
                    return;
                }
                if (event.key === '/' && event.ctrlKey) {
                    event.preventDefault();
                    elements.search.focus();
                }
            });
            state.shortcutBound = true;
        }
    };

    const cacheElements = (panel) => {
        elements.list = panel.querySelector('[data-messages-list]');
        elements.search = panel.querySelector('[data-messages-search]');
        elements.property = panel.querySelector('[data-messages-property]');
        elements.filterUnread = panel.querySelector('[data-messages-filter-unread]');
        elements.filterPinned = panel.querySelector('[data-messages-filter-pinned]');
        elements.filterOnline = panel.querySelector('[data-messages-filter-online]');
        elements.kpiOpen = panel.querySelector('[data-messages-kpi-open]');
        elements.kpiUnread = panel.querySelector('[data-messages-kpi-unread]');
        elements.kpiStatus = panel.querySelector('[data-messages-kpi-status]');
        elements.crumb = panel.querySelector('[data-messages-crumb]');
        elements.headerAvatar = panel.querySelector('[data-messages-header-avatar]');
        elements.headerName = panel.querySelector('[data-messages-header-name]');
        elements.headerSub = panel.querySelector('[data-messages-header-sub]');
        elements.offlineBanner = panel.querySelector('[data-messages-offline]');
        elements.chatBody = panel.querySelector('[data-messages-body]');
        elements.messageInput = panel.querySelector('[data-messages-input]');
        elements.sendButton = panel.querySelector('[data-messages-send]');
        elements.contextName = panel.querySelector('[data-messages-context-name]');
        elements.contextEmail = panel.querySelector('[data-messages-context-email]');
        elements.contextPhone = panel.querySelector('[data-messages-context-phone]');
        elements.contextCount = panel.querySelector('[data-messages-context-count]');
        elements.propertyTitle = panel.querySelector('[data-messages-property-title]');
        elements.propertyMeta = panel.querySelector('[data-messages-property-meta]');
        elements.timeline = panel.querySelector('[data-messages-timeline]');
        elements.files = panel.querySelector('[data-messages-files]');
    };

    const handlePanelReady = () => {
        renderInbox();
        renderMessages();
    };

    const init = (panel) => {
        if (!panel || panel.dataset.messagesInit === 'true') {
            return;
        }

        panel.dataset.messagesInit = 'true';
        panelRef = panel;

        cacheElements(panel);
        bindEvents();
        renderInbox();
        renderMessages();

        panel.addEventListener('profile:panel-ready', handlePanelReady);

        if (!state.intervalId) {
            state.intervalId = window.setInterval(toggleConnection, 7000);
        }
    };

    window.ProfileMessages = {
        init
    };
})();
