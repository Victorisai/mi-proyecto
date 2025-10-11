(function (global) {
    const conversationsData = [
        { id: 1, buyer: 'Juan Pérez', prop: 'Lote Holbox · #L25', last: 'Gracias, quedo atento', lastAt: '10:32', unread: 2, status: 'open', pinned: true, online: true },
        { id: 2, buyer: 'Ana López', prop: 'Casa Cancún · #A102', last: 'Perfecto, el sábado', lastAt: 'ayer', unread: 0, status: 'open', pinned: false, online: false },
        { id: 3, buyer: 'Carlos Ruiz', prop: 'Depto Centro · #D9', last: 'Listo, envío docs', lastAt: 'lun', unread: 0, status: 'closed', pinned: false, online: false },
        { id: 4, buyer: 'Paula Ríos', prop: 'Lote Holbox · #L25', last: '¿Hay descuento al contado?', lastAt: '09:15', unread: 3, status: 'open', pinned: false, online: true }
    ];

    const messagesData = {
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
        typingTimeout: null,
        connectionInterval: null
    };

    const createElement = (tag, className) => {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    };

    const ProfileMessages = {
        init(panel) {
            if (!panel) {
                return;
            }

            const root = panel.querySelector('[data-profile-messages]');

            if (!root || root.dataset.initialized === 'true') {
                return;
            }

            const getElement = (name) => root.querySelector(`[data-profile-messages-element="${name}"]`);

            const elements = {
                list: getElement('list'),
                search: getElement('search'),
                filter: getElement('filter'),
                onlyUnread: getElement('only-unread'),
                pinnedFirst: getElement('pinned-first'),
                onlineOnly: getElement('online-only'),
                kOpen: getElement('k-open'),
                kUnread: getElement('k-unread'),
                kConn: getElement('k-conn'),
                breadcrumbs: getElement('breadcrumbs'),
                headAvatar: getElement('head-avatar'),
                headName: getElement('head-name'),
                headSub: getElement('head-sub'),
                offlineBanner: getElement('offline-banner'),
                chatBody: getElement('chat-body'),
                message: getElement('message'),
                send: getElement('send'),
                contextName: getElement('context-name'),
                contextEmail: getElement('context-email'),
                contextPhone: getElement('context-phone'),
                contextCount: getElement('context-count'),
                propertyTitle: getElement('property-title'),
                propertyMeta: getElement('property-meta'),
                files: getElement('files')
            };

            const renderInbox = () => {
                if (!elements.list) {
                    return;
                }

                const query = (elements.search?.value || '').toLowerCase();
                const filterValue = elements.filter?.value || 'all';
                const onlyUnread = Boolean(elements.onlyUnread?.checked);
                const pinnedFirst = Boolean(elements.pinnedFirst?.checked);
                const onlineOnly = Boolean(elements.onlineOnly?.checked);

                const filtered = conversationsData
                    .filter((conversation) => (filterValue === 'all' ? true : conversation.prop === filterValue))
                    .filter((conversation) => (onlyUnread ? conversation.unread > 0 : true))
                    .filter((conversation) => (onlineOnly ? conversation.online : true))
                    .filter((conversation) => {
                        if (!query) {
                            return true;
                        }
                        const haystack = `${conversation.buyer} ${conversation.prop} ${conversation.last}`.toLowerCase();
                        return haystack.includes(query);
                    });

                const items = filtered.sort((a, b) => {
                    if (pinnedFirst) {
                        const pinnedSort = Number(b.pinned) - Number(a.pinned);
                        if (pinnedSort !== 0) {
                            return pinnedSort;
                        }
                    }
                    return b.unread - a.unread;
                });

                elements.list.innerHTML = '';

                const totalUnread = items.reduce((sum, conversation) => sum + conversation.unread, 0);
                if (elements.kUnread) {
                    elements.kUnread.textContent = String(totalUnread);
                }

                if (items.length === 0) {
                    const emptyState = createElement('div', 'profile-messages__empty');
                    emptyState.textContent = 'No hay conversaciones con estos filtros.';
                    elements.list.appendChild(emptyState);
                } else {
                    items.forEach((conversation) => {
                        const row = createElement('div', 'profile-messages__conv');
                        if (conversation.id === state.activeId) {
                            row.classList.add('profile-messages__conv--active');
                        }

                        row.setAttribute('role', 'option');
                        row.addEventListener('click', () => openConversation(conversation.id));

                        const avatar = createElement('div', 'profile-messages__avatar');
                        avatar.textContent = conversation.buyer[0] || '';

                        const metaWrapper = document.createElement('div');
                        const head = createElement('div', 'profile-messages__meta');
                        const name = createElement('div', 'profile-messages__name');
                        name.innerHTML = `${conversation.buyer}${conversation.online ? '<span class="profile-messages__status-dot" title="En línea"></span>' : ''}${conversation.pinned ? '<span class="profile-messages__pin" title="Fijada">📌</span>' : ''}`;
                        const time = createElement('div', 'profile-messages__sub');
                        time.textContent = conversation.lastAt;
                        head.append(name, time);

                        const sub = createElement('div', 'profile-messages__sub');
                        sub.textContent = conversation.prop;
                        metaWrapper.append(head, sub);

                        const right = document.createElement('div');
                        if (conversation.unread > 0) {
                            const badge = createElement('span', 'profile-messages__badge');
                            badge.textContent = String(conversation.unread);
                            right.appendChild(badge);
                        }

                        row.append(avatar, metaWrapper, right);
                        elements.list.appendChild(row);
                    });
                }

                if (elements.kOpen) {
                    const openCount = conversationsData.filter((conversation) => conversation.status === 'open').length;
                    elements.kOpen.textContent = String(openCount);
                }

                if (elements.kConn) {
                    elements.kConn.textContent = state.connected ? 'Conectado' : 'Offline';
                }

                if (elements.offlineBanner) {
                    elements.offlineBanner.style.display = state.connected ? 'none' : 'flex';
                }
            };

            const renderMessages = () => {
                if (!elements.chatBody) {
                    return;
                }

                elements.chatBody.innerHTML = '';

                if (!state.activeId) {
                    const emptyState = createElement('div', 'profile-messages__empty');
                    emptyState.textContent = 'Elige una conversación de la lista para comenzar';
                    elements.chatBody.appendChild(emptyState);
                    return;
                }

                const messages = messagesData[state.activeId] || [];
                const daySeparator = createElement('div', 'profile-messages__day-sep');
                daySeparator.textContent = 'Hoy';
                elements.chatBody.appendChild(daySeparator);

                messages.forEach((message) => {
                    const bubble = createElement(
                        'div',
                        `profile-messages__bubble ${message.mine ? 'profile-messages__bubble--mine' : 'profile-messages__bubble--theirs'}`
                    );
                    bubble.innerHTML = `${message.text}<div class="profile-messages__bubble-meta"><span>${message.at}</span>${
                        message.mine ? '<span>✓✓</span>' : ''
                    }</div>`;

                    const actions = createElement('div', 'profile-messages__bubble-actions');
                    actions.innerHTML = '<button class="profile-messages__btn profile-messages__btn--icon" type="button" title="Copiar">📋</button>' +
                        '<button class="profile-messages__btn profile-messages__btn--icon" type="button" title="Responder">↩</button>' +
                        '<button class="profile-messages__btn profile-messages__btn--icon" type="button" title="Eliminar">🗑</button>';
                    bubble.appendChild(actions);
                    elements.chatBody.appendChild(bubble);
                });

                elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
            };

            const openConversation = (id) => {
                state.activeId = id;
                renderInbox();

                const conversation = conversationsData.find((item) => item.id === id);
                if (!conversation) {
                    return;
                }

                if (elements.breadcrumbs) {
                    elements.breadcrumbs.textContent = `Mensajes / ${conversation.prop}`;
                }

                if (elements.headAvatar) {
                    elements.headAvatar.textContent = conversation.buyer[0] || '';
                }

                if (elements.headName) {
                    elements.headName.textContent = conversation.buyer;
                }

                if (elements.headSub) {
                    elements.headSub.textContent = `${conversation.prop} · ${conversation.online ? 'En línea' : `Últ. ${conversation.lastAt}`}`;
                }

                if (elements.message) {
                    elements.message.disabled = false;
                    elements.message.focus();
                }

                if (elements.send) {
                    elements.send.disabled = false;
                }

                if (elements.contextName) {
                    elements.contextName.textContent = conversation.buyer;
                }

                if (elements.contextEmail) {
                    elements.contextEmail.textContent = 'comprador@mail.com';
                }

                if (elements.contextPhone) {
                    elements.contextPhone.textContent = '+52 999 123 4567';
                }

                if (elements.contextCount) {
                    elements.contextCount.textContent = '3';
                }

                if (elements.propertyTitle) {
                    elements.propertyTitle.textContent = conversation.prop;
                }

                if (elements.propertyMeta) {
                    elements.propertyMeta.textContent = 'Chat iniciado desde publicación';
                }

                renderMessages();

                conversation.unread = 0;
                renderInbox();
            };

            const addTypingIndicator = () => {
                if (!elements.chatBody) {
                    return null;
                }
                const typing = createElement('div', 'profile-messages__typing');
                typing.innerHTML = '<span>•••</span><span>Escribiendo…</span>';
                elements.chatBody.appendChild(typing);
                elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
                return typing;
            };

            const sendMessage = () => {
                if (!elements.message || !state.activeId) {
                    return;
                }

                const text = elements.message.value.trim();
                if (!text) {
                    return;
                }

                const currentMessages = messagesData[state.activeId] || [];
                const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                const outbound = { mine: true, text, at: now };

                messagesData[state.activeId] = [...currentMessages, outbound];
                elements.message.value = '';
                renderMessages();

                if (state.typingTimeout) {
                    window.clearTimeout(state.typingTimeout);
                }

                const typing = addTypingIndicator();

                state.typingTimeout = window.setTimeout(() => {
                    if (typing && typing.parentElement) {
                        typing.remove();
                    }
                    const reply = { mine: false, text: 'Recibido 👍', at: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) };
                    messagesData[state.activeId] = [...(messagesData[state.activeId] || []), reply];
                    renderMessages();
                }, 1100);
            };

            const handleConnectionSimulation = () => {
                state.connected = Math.random() > 0.1;
                renderInbox();
            };

            const attachFilters = () => {
                const filterElements = [elements.search, elements.filter, elements.onlyUnread, elements.pinnedFirst, elements.onlineOnly];
                filterElements.forEach((element) => {
                    if (!element) {
                        return;
                    }
                    const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
                    element.addEventListener(eventType, renderInbox);
                });
            };

            const attachEvents = () => {
                attachFilters();

                if (elements.send) {
                    elements.send.addEventListener('click', sendMessage);
                }

                if (elements.message) {
                    elements.message.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            sendMessage();
                        }
                    });
                }

                window.addEventListener('keydown', (event) => {
                    if (event.ctrlKey && event.key === '/') {
                        event.preventDefault();
                        elements.search?.focus();
                    }
                });
            };

            const setupConnectionSimulation = () => {
                if (state.connectionInterval) {
                    window.clearInterval(state.connectionInterval);
                }
                state.connectionInterval = window.setInterval(handleConnectionSimulation, 7000);
            };

            root.dataset.initialized = 'true';
            attachEvents();
            renderInbox();
            renderMessages();
            setupConnectionSimulation();

            panel.addEventListener('profile:panel-ready', () => {
                renderInbox();
                renderMessages();
            });
        }
    };

    global.ProfileMessages = ProfileMessages;
})(window);
