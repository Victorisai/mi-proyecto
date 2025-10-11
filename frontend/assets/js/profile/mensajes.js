(function (global) {
    const conversations = [
        { id: 1, buyer: 'Juan Pérez', property: 'Lote Holbox · ID #L25', last: 'Gracias, quedo atento', lastAt: '10:32', unread: 2, status: 'open', pinned: true, online: true, leadId: 11 },
        { id: 2, buyer: 'Ana López', property: 'Casa Cancún · ID #A102', last: 'Perfecto, el sábado', lastAt: 'ayer', unread: 0, status: 'open', pinned: false, online: false, leadId: 7 },
        { id: 3, buyer: 'Carlos Ruiz', property: 'Depto Centro · ID #D9', last: 'Listo, envío docs', lastAt: 'lun', unread: 0, status: 'closed', pinned: false, online: false, leadId: 3 },
        { id: 4, buyer: 'Paula Ríos', property: 'Lote Holbox · ID #L25', last: '¿Hay descuento al contado?', lastAt: '09:15', unread: 1, status: 'open', pinned: false, online: true, leadId: 14 },
    ];

    const messagesStore = {
        1: [
            { id: 100, mine: false, text: 'Hola, me interesa el lote.', at: '10:15' },
            { id: 101, mine: true, text: 'Hola Juan, con gusto te apoyo. ¿Quieres agendar llamada?', at: '10:17' },
            { id: 102, mine: false, text: 'Sí, hoy a las 6 pm.', at: '10:22' },
        ],
        2: [
            { id: 200, mine: false, text: '¿Se puede visitar el sábado?', at: 'ayer' },
            { id: 201, mine: true, text: 'Sí, a las 11am queda perfecto.', at: 'ayer' },
        ],
        3: [
            { id: 300, mine: false, text: 'Busco opciones de financiamiento.', at: 'lun' },
            { id: 301, mine: true, text: 'Te paso esquemas bancarios y directo.', at: 'lun' },
            { id: 302, mine: false, text: 'Listo, envío docs', at: 'lun' },
        ],
        4: [
            { id: 400, mine: false, text: '¿Hay descuento al contado?', at: '09:15' },
        ],
    };

    const createElement = (tag, className) => {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    };

    const init = (panel) => {
        if (!panel || panel.dataset.section !== 'mensajes' || panel.dataset.messagesInitialized === 'true') {
            return;
        }

        panel.dataset.messagesInitialized = 'true';

        const $ = (selector) => panel.querySelector(selector);

        const elements = {
            search: $('#messagesSearch'),
            propertyFilter: $('#messagesPropertyFilter'),
            statusFilter: $('#messagesStatusFilter'),
            onlyUnread: $('#messagesOnlyUnread'),
            pinnedFirst: $('#messagesPinnedFirst'),
            list: $('#messagesChatList'),
            unreadTotal: $('#messagesUnreadTotal'),
            headerAvatar: $('#messagesHeaderAvatar'),
            headerName: $('#messagesHeaderName'),
            headerMeta: $('#messagesHeaderMeta'),
            muteBtn: $('#messagesMute'),
            closeBtn: $('#messagesClose'),
            openLeadBtn: $('#messagesOpenLead'),
            reloadBtn: $('#messagesReload'),
            exportBtn: $('#messagesExport'),
            attachBtn: $('#messagesAttach'),
            textarea: $('#messagesTextarea'),
            sendBtn: $('#messagesSend'),
            body: $('#messagesThreadBody'),
        };

        if (!elements.list || !elements.body || !elements.textarea || !elements.sendBtn) {
            return;
        }

        const state = {
            activeId: null,
            typingTimer: null,
        };

        const formatTimestamp = () => {
            return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        };

        const setComposerEnabled = (enabled) => {
            elements.textarea.disabled = !enabled;
            elements.sendBtn.disabled = !enabled;
            if (elements.attachBtn) {
                elements.attachBtn.disabled = !enabled;
            }
            if (!enabled) {
                elements.textarea.value = '';
            }
        };

        const autoResizeTextarea = () => {
            const el = elements.textarea;
            if (!el) {
                return;
            }
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
            elements.sendBtn.disabled = el.value.trim().length === 0;
        };

        const updateActions = (conversation) => {
            if (!conversation) {
                if (elements.muteBtn) {
                    elements.muteBtn.disabled = true;
                }
                if (elements.closeBtn) {
                    elements.closeBtn.disabled = true;
                }
                if (elements.openLeadBtn) {
                    elements.openLeadBtn.disabled = true;
                    elements.openLeadBtn.textContent = 'Ver lead';
                }
                return;
            }

            if (elements.muteBtn) {
                elements.muteBtn.disabled = false;
                elements.muteBtn.textContent = conversation.status === 'muted' ? 'Quitar silencio' : 'Silenciar';
            }
            if (elements.closeBtn) {
                elements.closeBtn.disabled = false;
                elements.closeBtn.textContent = conversation.status === 'closed' ? 'Reabrir' : 'Cerrar';
            }
            if (elements.openLeadBtn) {
                elements.openLeadBtn.disabled = !conversation.leadId;
                elements.openLeadBtn.textContent = conversation.leadId ? `Lead #${conversation.leadId}` : 'Ver lead';
            }
        };

        const renderMessages = () => {
            const container = elements.body;
            if (!container) {
                return;
            }

            container.innerHTML = '';

            if (!state.activeId) {
                const placeholder = createElement('div', 'messages-thread__placeholder');
                placeholder.textContent = 'Selecciona una conversación para ver el historial.';
                container.appendChild(placeholder);
                setComposerEnabled(false);
                updateActions(null);
                if (elements.headerAvatar) {
                    elements.headerAvatar.textContent = '—';
                }
                if (elements.headerName) {
                    elements.headerName.textContent = 'Selecciona una conversación';
                }
                if (elements.headerMeta) {
                    elements.headerMeta.textContent = 'Elige un chat de la lista para comenzar';
                }
                return;
            }

            const conversationMessages = messagesStore[state.activeId] || [];

            const day = createElement('div', 'messages-day');
            day.textContent = 'Hoy';
            container.appendChild(day);

            conversationMessages.forEach((message) => {
                const bubble = createElement('article', `messages-bubble${message.mine ? ' messages-bubble--mine' : ''}`);
                bubble.innerHTML = `
                    <p>${message.text}</p>
                    <div class="messages-bubble__meta">
                        <span>${message.at}</span>
                        ${message.mine ? '<span>✓✓</span>' : ''}
                    </div>
                `;
                container.appendChild(bubble);
            });

            container.scrollTop = container.scrollHeight;
            setComposerEnabled(true);
            autoResizeTextarea();
            const conversation = conversations.find((item) => item.id === state.activeId);
            updateActions(conversation || null);
        };

        const renderList = () => {
            const list = elements.list;
            list.innerHTML = '';

            const query = (elements.search && elements.search.value ? elements.search.value : '').trim().toLowerCase();
            const propertyFilter = elements.propertyFilter ? elements.propertyFilter.value : 'all';
            const statusFilter = elements.statusFilter ? elements.statusFilter.value : 'open';
            const onlyUnread = elements.onlyUnread ? elements.onlyUnread.checked : false;
            const pinnedFirst = elements.pinnedFirst ? elements.pinnedFirst.checked : true;

            const filtered = conversations
                .filter((conversation) => (statusFilter === 'all' ? true : conversation.status === statusFilter))
                .filter((conversation) => (propertyFilter === 'all' ? true : conversation.property === propertyFilter))
                .filter((conversation) => (onlyUnread ? conversation.unread > 0 : true))
                .filter((conversation) => {
                    if (!query) {
                        return true;
                    }
                    const haystack = `${conversation.buyer} ${conversation.property}`.toLowerCase();
                    return haystack.includes(query);
                })
                .sort((a, b) => {
                    if (!pinnedFirst) {
                        return (b.unread || 0) - (a.unread || 0);
                    }
                    const pinDiff = Number(b.pinned) - Number(a.pinned);
                    if (pinDiff !== 0) {
                        return pinDiff;
                    }
                    return (b.unread || 0) - (a.unread || 0);
                });

            const unreadTotal = filtered.reduce((sum, conversation) => sum + (conversation.unread || 0), 0);
            if (elements.unreadTotal) {
                elements.unreadTotal.textContent = unreadTotal;
            }

            if (filtered.length === 0) {
                const empty = createElement('div', 'messages-list__empty');
                empty.textContent = 'No hay conversaciones con estos filtros.';
                list.appendChild(empty);
                return;
            }

            filtered.forEach((conversation) => {
                const row = createElement('div', 'messages-conversation');
                row.setAttribute('role', 'option');
                row.dataset.id = String(conversation.id);
                if (conversation.id === state.activeId) {
                    row.classList.add('messages-conversation--active');
                    row.setAttribute('aria-selected', 'true');
                }

                row.addEventListener('click', () => {
                    openConversation(conversation.id);
                });

                const avatar = createElement('div', 'messages-avatar');
                avatar.textContent = (conversation.buyer || 'U')[0].toUpperCase();

                const meta = createElement('div');
                meta.className = 'messages-conversation__meta';

                const name = createElement('div', 'messages-conversation__name');
                name.innerHTML = `${conversation.buyer}${conversation.online ? ' <span class="messages-status-dot" title="En línea"></span>' : ''}`;
                const time = createElement('div', 'messages-conversation__time');
                time.textContent = conversation.lastAt;

                const property = createElement('div', 'messages-conversation__property');
                property.textContent = conversation.property;

                meta.appendChild(name);
                meta.appendChild(time);
                meta.appendChild(property);

                const aside = createElement('div', 'messages-conversation__aside');
                if (conversation.pinned) {
                    const pin = createElement('span', 'messages-pin');
                    pin.textContent = '📌';
                    pin.title = 'Conversación fijada';
                    aside.appendChild(pin);
                }
                if (conversation.unread > 0) {
                    const badge = createElement('span', 'messages-badge');
                    badge.textContent = conversation.unread;
                    badge.setAttribute('aria-label', `${conversation.unread} mensajes sin leer`);
                    aside.appendChild(badge);
                }

                row.appendChild(avatar);
                row.appendChild(meta);
                row.appendChild(aside);

                list.appendChild(row);
            });
        };

        const openConversation = (id) => {
            state.activeId = id;
            const conversation = conversations.find((item) => item.id === id);
            if (!conversation) {
                return;
            }

            conversation.unread = 0;
            if (elements.headerAvatar) {
                elements.headerAvatar.textContent = (conversation.buyer || 'U')[0].toUpperCase();
            }
            if (elements.headerName) {
                elements.headerName.textContent = conversation.buyer;
            }
            if (elements.headerMeta) {
                const statusLabel = conversation.status === 'closed'
                    ? 'Conversación cerrada'
                    : conversation.online
                        ? 'En línea'
                        : `Últ. ${conversation.lastAt}`;
                elements.headerMeta.textContent = `${conversation.property} · ${statusLabel}`;
            }

            renderMessages();
            renderList();
        };

        const showTyping = (active) => {
            const container = elements.body;
            if (!container) {
                return;
            }
            const existing = container.querySelector('.messages-typing');
            if (active) {
                if (!existing) {
                    const typing = createElement('div', 'messages-typing');
                    typing.innerHTML = '<span aria-hidden="true">•••</span><span>Escribiendo…</span>';
                    container.appendChild(typing);
                }
                container.scrollTop = container.scrollHeight;
            } else if (existing) {
                existing.remove();
            }
        };

        const sendMessage = () => {
            if (!state.activeId) {
                return;
            }
            const text = elements.textarea.value.trim();
            if (!text) {
                return;
            }

            const conversation = conversations.find((item) => item.id === state.activeId);
            const now = formatTimestamp();
            const message = { id: Date.now(), mine: true, text, at: now };
            messagesStore[state.activeId] = (messagesStore[state.activeId] || []).concat(message);

            elements.textarea.value = '';
            autoResizeTextarea();

            if (conversation) {
                conversation.last = text;
                conversation.lastAt = now;
            }

            renderMessages();
            renderList();

            if (state.typingTimer) {
                clearTimeout(state.typingTimer);
            }

            showTyping(true);
            state.typingTimer = window.setTimeout(() => {
                showTyping(false);
                const replyText = 'Recibido 👍';
                const reply = { id: Date.now() + 1, mine: false, text: replyText, at: formatTimestamp() };
                messagesStore[state.activeId].push(reply);
                if (conversation) {
                    conversation.last = replyText;
                    conversation.lastAt = reply.at;
                }
                renderMessages();
                renderList();
            }, 1200);
        };

        const toggleMute = () => {
            if (!state.activeId) {
                return;
            }
            const conversation = conversations.find((item) => item.id === state.activeId);
            if (!conversation) {
                return;
            }
            conversation.status = conversation.status === 'muted' ? 'open' : 'muted';
            updateActions(conversation);
            renderList();
        };

        const toggleClose = () => {
            if (!state.activeId) {
                return;
            }
            const conversation = conversations.find((item) => item.id === state.activeId);
            if (!conversation) {
                return;
            }
            conversation.status = conversation.status === 'closed' ? 'open' : 'closed';
            updateActions(conversation);
            if (elements.headerMeta) {
                const statusLabel = conversation.status === 'closed' ? 'Conversación cerrada' : (conversation.online ? 'En línea' : `Últ. ${conversation.lastAt}`);
                elements.headerMeta.textContent = `${conversation.property} · ${statusLabel}`;
            }
            renderList();
        };

        const openLead = () => {
            if (!state.activeId || !elements.openLeadBtn) {
                return;
            }
            const conversation = conversations.find((item) => item.id === state.activeId);
            if (!conversation || !conversation.leadId) {
                return;
            }
            const leadMessage = `Ir a lead #${conversation.leadId}`;
            elements.openLeadBtn.setAttribute('title', leadMessage);
            console.info(`En una versión conectada se abriría el lead #${conversation.leadId}.`);
        };

        const reloadConversations = () => {
            if (!elements.reloadBtn) {
                return;
            }
            elements.reloadBtn.disabled = true;
            elements.reloadBtn.classList.add('is-loading');
            elements.list.classList.add('is-loading');
            setTimeout(() => {
                elements.reloadBtn.disabled = false;
                elements.reloadBtn.classList.remove('is-loading');
                renderList();
                elements.list.classList.remove('is-loading');
            }, 600);
        };

        const exportHistory = () => {
            const rows = conversations.map((conversation) => {
                const logs = (messagesStore[conversation.id] || []).map((message) => `${message.mine ? 'Vendedor' : conversation.buyer}: ${message.text}`).join('\n');
                return `#${conversation.id} · ${conversation.buyer} · ${conversation.property}\n${logs}`;
            });
            const blob = new Blob([rows.join('\n\n')], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'historial-mensajes.txt';
            link.click();
            URL.revokeObjectURL(link.href);
        };

        if (elements.search) {
            elements.search.addEventListener('input', renderList);
        }
        if (elements.propertyFilter) {
            elements.propertyFilter.addEventListener('change', renderList);
        }
        if (elements.statusFilter) {
            elements.statusFilter.addEventListener('change', renderList);
        }
        if (elements.onlyUnread) {
            elements.onlyUnread.addEventListener('change', renderList);
        }
        if (elements.pinnedFirst) {
            elements.pinnedFirst.addEventListener('change', renderList);
        }
        if (elements.sendBtn) {
            elements.sendBtn.addEventListener('click', sendMessage);
        }
        if (elements.muteBtn) {
            elements.muteBtn.addEventListener('click', toggleMute);
            elements.muteBtn.disabled = true;
        }
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', toggleClose);
            elements.closeBtn.disabled = true;
        }
        if (elements.openLeadBtn) {
            elements.openLeadBtn.addEventListener('click', openLead);
            elements.openLeadBtn.disabled = true;
        }
        if (elements.reloadBtn) {
            elements.reloadBtn.addEventListener('click', reloadConversations);
        }
        if (elements.exportBtn) {
            elements.exportBtn.addEventListener('click', exportHistory);
        }
        if (elements.textarea) {
            elements.textarea.addEventListener('input', autoResizeTextarea);
            elements.textarea.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }

        renderList();
        renderMessages();
    };

    global.ProfileMessages = { init };
})(window);
