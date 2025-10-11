(function () {
    const conversations = [
        { id: 1, buyer: 'Juan Pérez', prop: 'Lote Holbox · #L25', last: 'Gracias, quedo atento', lastAt: '10:32', unread: 2, status: 'open', pinned: true, online: true },
        { id: 2, buyer: 'Ana López', prop: 'Casa Cancún · #A102', last: 'Perfecto, el sábado', lastAt: 'ayer', unread: 0, status: 'open', pinned: false, online: false },
        { id: 3, buyer: 'Carlos Ruiz', prop: 'Depto Centro · #D9', last: 'Listo, envío docs', lastAt: 'lun', unread: 0, status: 'closed', pinned: false, online: false },
        { id: 4, buyer: 'Paula Ríos', prop: 'Lote Holbox · #L25', last: '¿Hay descuento al contado?', lastAt: '09:15', unread: 3, status: 'open', pinned: false, online: true }
    ];

    const messagesMap = {
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

    let shortcutsAttached = false;

    const formatTime = (date) => date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });

    window.ProfileMessages = {
        init(panel) {
            if (!panel || panel.dataset.messagesInitialized === 'true') {
                return;
            }

            panel.dataset.messagesInitialized = 'true';

            const refs = {
                panel,
                list: panel.querySelector('#list'),
                search: panel.querySelector('#q'),
                propertyFilter: panel.querySelector('#propFilter'),
                onlyUnread: panel.querySelector('#onlyUnread'),
                pinnedFirst: panel.querySelector('#pinnedFirst'),
                onlineOnly: panel.querySelector('#onlineOnly'),
                unreadKpi: panel.querySelector('#kUnread'),
                openKpi: panel.querySelector('#kOpen'),
                connectionKpi: panel.querySelector('#kConn'),
                offlineBanner: panel.querySelector('#offlineBanner'),
                breadcrumbs: panel.querySelector('#crumbs'),
                buyerInitial: panel.querySelector('#hA'),
                buyerName: panel.querySelector('#hName'),
                buyerMeta: panel.querySelector('#hSub'),
                chatBody: panel.querySelector('#chatBody'),
                messageInput: panel.querySelector('#msg'),
                sendButton: panel.querySelector('#send'),
                contextName: panel.querySelector('#cName'),
                contextMail: panel.querySelector('#cMail'),
                contextPhone: panel.querySelector('#cPhone'),
                contextConversations: panel.querySelector('#cConvCount'),
                postTitle: panel.querySelector('#pTitle'),
                postMeta: panel.querySelector('#pMeta')
            };

            const state = {
                activeId: null,
                connected: true
            };

            const renderConnection = () => {
                if (!refs.connectionKpi) {
                    return;
                }

                refs.connectionKpi.textContent = state.connected ? 'Conectado' : 'Sin conexión';

                if (refs.offlineBanner) {
                    refs.offlineBanner.style.display = state.connected ? 'none' : 'flex';
                }
            };

            const sortByPinned = (items, pinnedFirst) => {
                const sorted = [...items];

                if (pinnedFirst) {
                    sorted.sort((a, b) => {
                        if (a.pinned !== b.pinned) {
                            return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
                        }

                        if (a.unread !== b.unread) {
                            return b.unread - a.unread;
                        }

                        return a.buyer.localeCompare(b.buyer);
                    });
                    return sorted;
                }

                sorted.sort((a, b) => {
                    if (a.unread !== b.unread) {
                        return b.unread - a.unread;
                    }

                    return a.buyer.localeCompare(b.buyer);
                });

                return sorted;
            };

            const renderInbox = () => {
                if (!refs.list) {
                    return;
                }

                refs.list.innerHTML = '';

                const query = refs.search ? refs.search.value.trim().toLowerCase() : '';
                const property = refs.propertyFilter ? refs.propertyFilter.value : 'all';
                const onlyUnread = refs.onlyUnread ? refs.onlyUnread.checked : false;
                const pinnedFirst = refs.pinnedFirst ? refs.pinnedFirst.checked : false;
                const onlineOnly = refs.onlineOnly ? refs.onlineOnly.checked : false;

                let items = conversations.filter((conversation) => {
                    if (property !== 'all' && conversation.prop !== property) {
                        return false;
                    }

                    if (onlyUnread && conversation.unread === 0) {
                        return false;
                    }

                    if (onlineOnly && !conversation.online) {
                        return false;
                    }

                    if (query) {
                        const haystack = `${conversation.buyer} ${conversation.prop} ${conversation.last}`.toLowerCase();
                        return haystack.includes(query);
                    }

                    return true;
                });

                items = sortByPinned(items, pinnedFirst);

                const totalUnread = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);

                if (refs.unreadKpi) {
                    refs.unreadKpi.textContent = String(totalUnread);
                }

                if (refs.openKpi) {
                    const openCount = conversations.filter((conversation) => conversation.status === 'open').length;
                    refs.openKpi.textContent = String(openCount);
                }

                if (items.length === 0) {
                    const empty = document.createElement('div');
                    empty.className = 'messages-empty';
                    empty.textContent = 'No hay conversaciones con estos filtros.';
                    refs.list.appendChild(empty);
                    return;
                }

                items.forEach((conversation) => {
                    const row = document.createElement('div');
                    row.className = 'messages-conv';
                    row.setAttribute('role', 'option');
                    row.setAttribute('aria-selected', state.activeId === conversation.id ? 'true' : 'false');
                    row.tabIndex = 0;

                    if (state.activeId === conversation.id) {
                        row.classList.add('is-active');
                    }

                    const avatar = document.createElement('div');
                    avatar.className = 'messages-conv__avatar';
                    avatar.textContent = conversation.buyer.slice(0, 1).toUpperCase();

                    const body = document.createElement('div');
                    body.className = 'messages-conv__body';

                    const top = document.createElement('div');
                    top.className = 'messages-conv__top';

                    const title = document.createElement('div');
                    title.className = 'messages-conv__title';
                    title.textContent = conversation.buyer;

                    if (conversation.online) {
                        const status = document.createElement('span');
                        status.className = 'messages-status';
                        status.title = 'En línea';
                        title.appendChild(status);
                    }

                    if (conversation.pinned) {
                        const pin = document.createElement('span');
                        pin.className = 'messages-pin';
                        pin.setAttribute('aria-hidden', 'true');
                        pin.textContent = '📌';
                        title.appendChild(pin);
                    }

                    const meta = document.createElement('span');
                    meta.className = 'messages-conv__meta';
                    meta.textContent = conversation.lastAt;

                    top.appendChild(title);
                    top.appendChild(meta);

                    const subtitle = document.createElement('div');
                    subtitle.className = 'messages-conv__subtitle';
                    subtitle.textContent = conversation.prop;

                    const preview = document.createElement('div');
                    preview.className = 'messages-conv__preview';
                    preview.textContent = conversation.last;

                    body.appendChild(top);
                    body.appendChild(subtitle);
                    body.appendChild(preview);

                    const aside = document.createElement('div');

                    if (conversation.unread > 0) {
                        const badge = document.createElement('span');
                        badge.className = 'messages-conv__badge';
                        badge.textContent = String(conversation.unread);
                        aside.appendChild(badge);
                    }

                    row.appendChild(avatar);
                    row.appendChild(body);
                    row.appendChild(aside);

                    row.addEventListener('click', () => openConversation(conversation.id));
                    row.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openConversation(conversation.id);
                        }
                    });

                    refs.list.appendChild(row);
                });

                renderConnection();
            };

            const renderMessages = () => {
                if (!refs.chatBody) {
                    return;
                }

                refs.chatBody.innerHTML = '';

                if (!state.activeId) {
                    const empty = document.createElement('div');
                    empty.className = 'messages-empty';
                    empty.textContent = 'Elige una conversación de la lista para comenzar';
                    refs.chatBody.appendChild(empty);
                    return;
                }

                const daySeparator = document.createElement('div');
                daySeparator.className = 'messages-day';
                daySeparator.textContent = 'Hoy';
                refs.chatBody.appendChild(daySeparator);

                const currentMessages = messagesMap[state.activeId] || [];

                currentMessages.forEach((message) => {
                    const bubble = document.createElement('div');
                    bubble.className = 'messages-bubble';
                    bubble.classList.add(message.mine ? 'messages-bubble--mine' : 'messages-bubble--theirs');

                    const text = document.createElement('div');
                    text.textContent = message.text;

                    const meta = document.createElement('div');
                    meta.className = 'messages-bubble__meta';

                    const time = document.createElement('span');
                    time.textContent = message.at;

                    meta.appendChild(time);

                    if (message.mine) {
                        const status = document.createElement('span');
                        status.textContent = '✓✓';
                        status.title = 'Leído';
                        meta.appendChild(status);
                    }

                    const actions = document.createElement('div');
                    actions.className = 'messages-bubble__actions';

                    const copyButton = document.createElement('button');
                    copyButton.type = 'button';
                    copyButton.className = 'messages-btn messages-btn--icon';
                    copyButton.title = 'Copiar';
                    copyButton.textContent = '📋';

                    const replyButton = document.createElement('button');
                    replyButton.type = 'button';
                    replyButton.className = 'messages-btn messages-btn--icon';
                    replyButton.title = 'Responder';
                    replyButton.textContent = '↩';

                    const deleteButton = document.createElement('button');
                    deleteButton.type = 'button';
                    deleteButton.className = 'messages-btn messages-btn--icon';
                    deleteButton.title = 'Eliminar';
                    deleteButton.textContent = '🗑';

                    actions.appendChild(copyButton);
                    actions.appendChild(replyButton);
                    actions.appendChild(deleteButton);

                    bubble.appendChild(text);
                    bubble.appendChild(meta);
                    bubble.appendChild(actions);

                    refs.chatBody.appendChild(bubble);
                });

                refs.chatBody.scrollTop = refs.chatBody.scrollHeight;
            };

            const openConversation = (id) => {
                state.activeId = id;
                renderInbox();

                const conversation = conversations.find((item) => item.id === id);

                if (!conversation) {
                    return;
                }

                if (refs.breadcrumbs) {
                    refs.breadcrumbs.textContent = `Mensajes / ${conversation.prop}`;
                }

                if (refs.buyerInitial) {
                    refs.buyerInitial.textContent = conversation.buyer.slice(0, 1).toUpperCase();
                }

                if (refs.buyerName) {
                    refs.buyerName.textContent = conversation.buyer;
                }

                if (refs.buyerMeta) {
                    const statusText = conversation.online ? 'En línea' : `Últ. ${conversation.lastAt}`;
                    refs.buyerMeta.textContent = `${conversation.prop} · ${statusText}`;
                }

                if (refs.messageInput) {
                    refs.messageInput.disabled = false;
                }

                if (refs.sendButton) {
                    refs.sendButton.disabled = false;
                }

                if (refs.contextName) {
                    refs.contextName.textContent = conversation.buyer;
                }

                if (refs.contextMail) {
                    refs.contextMail.textContent = 'comprador@mail.com';
                }

                if (refs.contextPhone) {
                    refs.contextPhone.textContent = '+52 999 123 4567';
                }

                if (refs.contextConversations) {
                    refs.contextConversations.textContent = '3';
                }

                if (refs.postTitle) {
                    refs.postTitle.textContent = conversation.prop;
                }

                if (refs.postMeta) {
                    refs.postMeta.textContent = 'Chat iniciado desde publicación';
                }

                conversation.unread = 0;

                renderMessages();

                if (refs.messageInput) {
                    refs.messageInput.focus();
                }
            };

            const sendMessage = () => {
                if (!refs.messageInput || !state.activeId) {
                    return;
                }

                const text = refs.messageInput.value.trim();

                if (!text) {
                    return;
                }

                const payload = {
                    mine: true,
                    text,
                    at: formatTime(new Date())
                };

                messagesMap[state.activeId] = (messagesMap[state.activeId] || []).concat(payload);

                refs.messageInput.value = '';

                renderMessages();

                if (!refs.chatBody) {
                    return;
                }

                const typing = document.createElement('div');
                typing.className = 'messages-typing';
                typing.innerHTML = '<span>•••</span><span>Escribiendo…</span>';
                refs.chatBody.appendChild(typing);
                refs.chatBody.scrollTop = refs.chatBody.scrollHeight;

                window.setTimeout(() => {
                    typing.remove();
                    messagesMap[state.activeId].push({
                        mine: false,
                        text: 'Recibido 👍',
                        at: formatTime(new Date())
                    });
                    renderMessages();
                }, 1100);
            };

            const handleShortcut = (event) => {
                if (!refs.search) {
                    return;
                }

                if (event.ctrlKey && event.key === '/') {
                    event.preventDefault();
                    refs.search.focus();
                }
            };

            if (refs.search) {
                refs.search.addEventListener('input', renderInbox);
            }

            [refs.propertyFilter, refs.onlyUnread, refs.pinnedFirst, refs.onlineOnly].forEach((control) => {
                if (!control) {
                    return;
                }

                const eventName = control.tagName === 'SELECT' ? 'change' : 'input';
                control.addEventListener(eventName, renderInbox);
            });

            if (refs.sendButton) {
                refs.sendButton.addEventListener('click', sendMessage);
            }

            if (refs.messageInput) {
                refs.messageInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                    }
                });
            }

            if (!shortcutsAttached) {
                window.addEventListener('keydown', handleShortcut);
                shortcutsAttached = true;
            }

            window.setInterval(() => {
                state.connected = Math.random() > 0.1;
                renderConnection();
            }, 7000);

            renderInbox();
            renderMessages();
        }
    };
})();
