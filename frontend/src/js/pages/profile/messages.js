(function () {
    const relativeTimestamp = (minutesAgo) => Date.now() - minutesAgo * 60 * 1000;

    const conversations = [
        {
            id: 1,
            buyer: 'Juan Pérez',
            property: 'Lote Holbox · #L25',
            lastMessage: 'Gracias, quedo atento',
            lastAt: '10:32',
            lastTimestamp: relativeTimestamp(15),
            unread: 2,
            status: 'open',
            pinned: true,
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
            lastTimestamp: relativeTimestamp(24 * 60 + 30),
            unread: 0,
            status: 'open',
            pinned: false,
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
            lastTimestamp: relativeTimestamp(4 * 24 * 60),
            unread: 0,
            status: 'closed',
            pinned: false,
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
            lastTimestamp: relativeTimestamp(5),
            unread: 3,
            status: 'open',
            pinned: false,
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
        intervalId: null,
        deleteListenerBound: false
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

    const formatFileSize = (bytes) => {
        if (!Number.isFinite(bytes) || bytes < 0) {
            return '';
        }
        if (bytes === 0) {
            return '0 B';
        }

        const units = ['B', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const size = bytes / Math.pow(1024, index);
        const formatted = size >= 10 ? size.toFixed(0) : size.toFixed(1);
        return `${formatted} ${units[index]}`;
    };

    const createAttachmentElement = (file) => {
        const attachment = createElement('div', 'messages-view-messages__attachment');
        attachment.title = file.name;

        const icon = createElement('span', 'messages-view-messages__attachment-icon');
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.5 12.5 21a4.95 4.95 0 0 1-7-7l8.5-8.5a3 3 0 0 1 4.2 4.2L9.7 18.2a1.5 1.5 0 0 1-2.1-2.1l7.6-7.6" /></svg>';

        const info = createElement('div', 'messages-view-messages__attachment-info');

        const name = createElement('span', 'messages-view-messages__attachment-name');
        name.textContent = file.name;
        info.appendChild(name);

        const sizeLabel = formatFileSize(file.size);
        if (sizeLabel) {
            const meta = createElement('span', 'messages-view-messages__attachment-meta');
            meta.textContent = sizeLabel;
            info.appendChild(meta);
        }

        attachment.appendChild(icon);
        attachment.appendChild(info);

        return attachment;
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
        const emptyState = createElement('div', 'messages-view-messages__empty');
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

        let filtered = conversations.filter((conversation) => {
            if (propertyValue !== 'all' && conversation.property !== propertyValue) {
                return false;
            }
            if (onlyUnread && conversation.unread === 0) {
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

            const recentDiff = (Number(b.lastTimestamp) || 0) - (Number(a.lastTimestamp) || 0);
            if (recentDiff !== 0) {
                return recentDiff;
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
            const item = createElement('div', 'messages-view-messages__conversation-item');
            item.setAttribute('role', 'option');
            item.dataset.id = conversation.id.toString();

            if (conversation.id === state.activeId) {
                item.classList.add('is-active');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.removeAttribute('aria-selected');
            }

            const avatar = createElement('div', 'messages-view-messages__conversation-avatar');
            avatar.textContent = conversation.buyer.charAt(0);

            const info = createElement('div', 'messages-view-messages__conversation-info');

            const header = createElement('div', 'messages-view-messages__conversation-header');
            const name = createElement('div', 'messages-view-messages__conversation-name');
            name.textContent = conversation.buyer;

            if (conversation.pinned) {
                const pin = createElement('span', 'messages-view-messages__pin');
                const pinIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                pinIcon.setAttribute('viewBox', '0 0 24 24');
                pinIcon.setAttribute('aria-hidden', 'true');
                pinIcon.setAttribute('focusable', 'false');
                pinIcon.classList.add('messages-view-messages__pin-icon');
            
                const pinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pinPath.setAttribute('fill', 'currentColor');
            
                // 👇 ¡Este es el path corregido, inclinado y más largo!
                pinPath.setAttribute('d', 'M14.5,12.5V6H15.5V4H7.5V6H8.5V12.5L5.5,15.5V17.5H11V23.5H13V17.5H18.5V15.5L14.5,12.5Z');
            
                pinIcon.appendChild(pinPath);
                pin.appendChild(pinIcon);
                pin.setAttribute('title', 'Conversación fijada');
                name.appendChild(pin);
            }

            const time = createElement('div', 'messages-view-messages__conversation-prop');
            time.textContent = conversation.lastAt;
            header.appendChild(name);
            header.appendChild(time);

            const property = createElement('div', 'messages-view-messages__conversation-prop');
            property.textContent = conversation.property;

            const preview = createElement('div', 'messages-view-messages__conversation-prop');
            preview.textContent = conversation.lastMessage;

            info.appendChild(header);
            info.appendChild(property);
            info.appendChild(preview);

            const right = createElement('div', 'messages-view-messages__conversation-meta');
            if (conversation.unread > 0) {
                const badge = createElement('span', 'messages-view-messages__badge');
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
            const tag = createElement('span', 'messages-view-messages__tag');
            tag.textContent = file;
            elements.files.appendChild(tag);
        });
    };

    const updatePinButton = () => {
        if (!elements.pinButton) {
            return;
        }

        const conversation = state.activeId ? getConversation(state.activeId) : null;

        if (!conversation) {
            elements.pinButton.disabled = true;
            elements.pinButton.textContent = 'Fijar';
            elements.pinButton.setAttribute('aria-pressed', 'false');
            return;
        }

        elements.pinButton.disabled = false;
        const isPinned = Boolean(conversation.pinned);
        elements.pinButton.textContent = isPinned ? 'Desfijar' : 'Fijar';
        elements.pinButton.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
    };

    const renderMessages = () => {
        if (!elements.chatBody) {
            return;
        }

        updatePinButton();

        if (elements.deleteButton) {
            elements.deleteButton.disabled = !state.activeId;
        }

        elements.chatBody.innerHTML = '';

        if (elements.attachButton) {
            elements.attachButton.disabled = !state.activeId;
        }

        if (!state.activeId) {
            const empty = createElement('div', 'messages-view-messages__empty');
            empty.textContent = 'Elige una conversación de la lista para comenzar';
            elements.chatBody.appendChild(empty);
            return;
        }

        const conversationMessages = messagesByConversation[state.activeId] || [];

        if (conversationMessages.length > 0) {
            const daySeparator = createElement('div', 'messages-view-messages__day-separator');
            daySeparator.textContent = 'Hoy';
            elements.chatBody.appendChild(daySeparator);
        }

        conversationMessages.forEach((message) => {
            const bubble = createElement('div', 'messages-view-messages__bubble');
            bubble.classList.add(message.mine ? 'messages-view-messages__bubble--mine' : 'messages-view-messages__bubble--theirs');

            const content = createElement('div', 'messages-view-messages__bubble-text');
            if (message.text) {
                const textBlock = createElement('span', 'messages-view-messages__bubble-text-content');
                textBlock.textContent = message.text;
                content.appendChild(textBlock);
            }
            if (message.file) {
                content.appendChild(createAttachmentElement(message.file));
            }
            if (!message.text && !message.file) {
                content.textContent = '';
            }

            const meta = createElement('div', 'messages-view-messages__bubble-meta');
            const time = createElement('span');
            time.textContent = message.at;
            meta.appendChild(time);

            if (message.mine) {
                const read = createElement('span');
                read.textContent = '✓✓';
                meta.appendChild(read);
            }

            const actions = createElement('div', 'messages-view-messages__bubble-actions');
            const actionButtons = [
                { label: '📋', title: 'Copiar mensaje' },
                { label: '↩', title: 'Responder' },
                { label: '🗑', title: 'Eliminar' }
            ];

            actionButtons.forEach((config) => {
                const button = createElement('button', 'messages-view-messages__button messages-view-messages__button--icon');
                button.type = 'button';
                button.title = config.title;
                button.textContent = config.label;
                actions.appendChild(button);
            });

            bubble.appendChild(content);
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

    const togglePinnedConversation = () => {
        if (!state.activeId) {
            return;
        }

        const conversation = getConversation(state.activeId);
        if (!conversation) {
            return;
        }

        conversation.pinned = !conversation.pinned;
        updatePinButton();
        renderInbox();
    };

    const toggleDeleteModal = (isOpen) => {
        if (!elements.deleteModal) {
            return;
        }

        elements.deleteModal.classList.toggle('deletechat--visible', isOpen);
        elements.deleteModal.setAttribute('aria-hidden', String(!isOpen));

        if (isOpen) {
            elements.deleteModal.setAttribute('aria-modal', 'true');
            const focusTarget = elements.deleteConfirm || elements.deleteModal.querySelector('button');
            window.setTimeout(() => {
                if (focusTarget) {
                    focusTarget.focus();
                }
            }, 0);
            return;
        }

        elements.deleteModal.removeAttribute('aria-modal');
        if (elements.deleteButton && !elements.deleteButton.disabled) {
            elements.deleteButton.focus();
        }
    };

    const handleDeleteKeydown = (event) => {
        if (event.key !== 'Escape') {
            return;
        }
        if (!elements.deleteModal || !elements.deleteModal.classList.contains('deletechat--visible')) {
            return;
        }
        toggleDeleteModal(false);
    };

    const resetActiveConversation = () => {
        state.activeId = null;

        if (elements.crumb) {
            elements.crumb.textContent = 'Mensajes / —';
        }
        if (elements.headerAvatar) {
            elements.headerAvatar.textContent = '—';
        }
        if (elements.headerName) {
            elements.headerName.textContent = 'Selecciona una conversación';
        }
        if (elements.headerSub) {
            elements.headerSub.textContent = '—';
        }
        if (elements.messageInput) {
            elements.messageInput.value = '';
            elements.messageInput.disabled = true;
        }
        if (elements.sendButton) {
            elements.sendButton.disabled = true;
        }
        if (elements.attachButton) {
            elements.attachButton.disabled = true;
        }
        if (elements.contextName) {
            elements.contextName.textContent = '—';
        }
        if (elements.contextEmail) {
            elements.contextEmail.textContent = '—';
        }
        if (elements.contextPhone) {
            elements.contextPhone.textContent = '—';
        }
        if (elements.contextCount) {
            elements.contextCount.textContent = '—';
        }
        if (elements.propertyTitle) {
            elements.propertyTitle.textContent = '—';
        }
        if (elements.propertyMeta) {
            elements.propertyMeta.textContent = '—';
        }
        if (elements.timeline) {
            elements.timeline.innerHTML = '';
            const emptyTimelineItem = createElement('li');
            emptyTimelineItem.textContent = 'Sin actividad reciente';
            elements.timeline.appendChild(emptyTimelineItem);
        }
        if (elements.files) {
            elements.files.innerHTML = '';
            const emptyFileTag = createElement('span', 'messages-view-messages__tag');
            emptyFileTag.textContent = 'Sin archivos recientes';
            elements.files.appendChild(emptyFileTag);
        }

        renderMessages();
        renderInbox();
    };

    const handleDeleteConfirm = () => {
        if (!state.activeId) {
            toggleDeleteModal(false);
            return;
        }

        const activeId = state.activeId;
        const index = conversations.findIndex((conversation) => conversation.id === activeId);

        if (index !== -1) {
            conversations.splice(index, 1);
        }

        delete messagesByConversation[activeId];

        toggleDeleteModal(false);
        resetActiveConversation();
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
            const subtitle = `Últ. ${conversation.lastAt}`;
            elements.headerSub.textContent = `${conversation.property} · ${subtitle}`;
        }

        if (elements.messageInput) {
            elements.messageInput.disabled = false;
            elements.messageInput.focus();
        }
        if (elements.sendButton) {
            elements.sendButton.disabled = false;
        }
        if (elements.attachButton) {
            elements.attachButton.disabled = false;
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
        const conversationId = state.activeId;
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
        messagesByConversation[conversationId] = (messagesByConversation[conversationId] || []).concat(message);

        if (state.activeId === conversationId) {
            renderMessages();
        }

        const conversation = getConversation(conversationId);
        if (conversation) {
            conversation.lastMessage = value;
            conversation.lastAt = formatted;
            conversation.lastTimestamp = now.getTime();
            conversation.unread = 0;
            renderInbox();
        }

        const typing = elements.chatBody && state.activeId === conversationId ? createElement('div', 'messages-view-messages__typing') : null;

        if (typing && elements.chatBody) {
            typing.innerHTML = '<span>•••</span><span>Escribiendo…</span>';
            elements.chatBody.appendChild(typing);
            elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
        }

        window.setTimeout(() => {
            if (typing) {
                typing.remove();
            }
            const reply = {
                mine: false,
                text: 'Recibido 👍',
                at: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            };
            const conversationMessages = messagesByConversation[conversationId] || [];
            conversationMessages.push(reply);
            messagesByConversation[conversationId] = conversationMessages;

            const targetConversation = getConversation(conversationId);
            if (targetConversation) {
                targetConversation.lastMessage = reply.text;
                targetConversation.lastAt = reply.at;
                targetConversation.lastTimestamp = Date.now();
                if (state.activeId !== conversationId) {
                    targetConversation.unread = (targetConversation.unread || 0) + 1;
                } else {
                    targetConversation.unread = 0;
                }
            }

            if (state.activeId === conversationId) {
                renderMessages();
            }

            renderInbox();
        }, 1100);
    };

    const handleFileSelection = (event) => {
        const input = event.target;
        if (!input || !input.files || input.files.length === 0) {
            return;
        }

        if (!state.activeId) {
            input.value = '';
            return;
        }

        const conversationId = state.activeId;
        const conversation = getConversation(conversationId);
        if (!conversation) {
            input.value = '';
            return;
        }

        const files = Array.from(input.files);
        const conversationMessages = messagesByConversation[conversationId] || [];
        const newFileNames = [];
        let lastTimestampLabel = conversationMessages.length > 0 ? conversationMessages[conversationMessages.length - 1].at : '';
        let lastTimestampValue = conversation.lastTimestamp || Date.now();
        const isActiveConversation = state.activeId === conversationId;

        files.forEach((file) => {
            const timestamp = new Date();
            lastTimestampLabel = timestamp.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit'
            });
            lastTimestampValue = timestamp.getTime();

            conversationMessages.push({
                mine: true,
                at: lastTimestampLabel,
                file: {
                    name: file.name,
                    size: file.size
                }
            });

            newFileNames.push(file.name);
            conversation.timeline = conversation.timeline || [];
            conversation.timeline.push(`${lastTimestampLabel} · Archivo enviado (${file.name})`);
        });

        messagesByConversation[conversationId] = conversationMessages;

        if (newFileNames.length > 0) {
            const existingFiles = conversation.files || [];
            conversation.files = Array.from(new Set(newFileNames.concat(existingFiles)));
            conversation.lastMessage = `Archivo enviado (${newFileNames[newFileNames.length - 1]})`;
            conversation.lastAt = lastTimestampLabel || conversation.lastAt;
            conversation.lastTimestamp = lastTimestampValue;
            conversation.unread = isActiveConversation ? 0 : (conversation.unread || 0);
        }

        if (isActiveConversation) {
            renderMessages();
            renderFiles(conversation);
            renderTimeline(conversation);
        }
        renderInbox();

        if (isActiveConversation && elements.chatBody) {
            elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
        }

        input.value = '';
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
        if (elements.sendButton) {
            elements.sendButton.addEventListener('click', sendMessage);
        }
        if (elements.attachButton) {
            elements.attachButton.addEventListener('click', () => {
                if (!elements.fileInput || elements.attachButton.disabled) {
                    return;
                }
                elements.fileInput.click();
            });
        }
        if (elements.fileInput) {
            elements.fileInput.addEventListener('change', handleFileSelection);
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

        if (elements.deleteButton && elements.deleteModal) {
            elements.deleteButton.addEventListener('click', () => toggleDeleteModal(true));
        }
        if (elements.deleteClosers && elements.deleteClosers.length > 0) {
            elements.deleteClosers.forEach((closer) => {
                closer.addEventListener('click', () => toggleDeleteModal(false));
            });
        }
        if (elements.deleteConfirm) {
            elements.deleteConfirm.addEventListener('click', handleDeleteConfirm);
        }
        if (elements.pinButton) {
            elements.pinButton.addEventListener('click', togglePinnedConversation);
        }
        if (!state.deleteListenerBound) {
            document.addEventListener('keydown', handleDeleteKeydown);
            state.deleteListenerBound = true;
        }
    };

    const cacheElements = (panel) => {
        elements.list = panel.querySelector('[data-messages-list]');
        elements.search = panel.querySelector('[data-messages-search]');
        elements.property = panel.querySelector('[data-messages-property]');
        elements.filterUnread = panel.querySelector('[data-messages-filter-unread]');
        elements.filterPinned = panel.querySelector('[data-messages-filter-pinned]');
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
        elements.attachButton = panel.querySelector('[data-messages-attach]');
        elements.fileInput = panel.querySelector('[data-messages-file-input]');
        elements.contextName = panel.querySelector('[data-messages-context-name]');
        elements.contextEmail = panel.querySelector('[data-messages-context-email]');
        elements.contextPhone = panel.querySelector('[data-messages-context-phone]');
        elements.contextCount = panel.querySelector('[data-messages-context-count]');
        elements.propertyTitle = panel.querySelector('[data-messages-property-title]');
        elements.propertyMeta = panel.querySelector('[data-messages-property-meta]');
        elements.timeline = panel.querySelector('[data-messages-timeline]');
        elements.files = panel.querySelector('[data-messages-files]');
        elements.deleteButton = panel.querySelector('[data-messages-delete-trigger]');
        elements.pinButton = panel.querySelector('[data-messages-pin]');
        elements.deleteModal = panel.querySelector('[data-messages-delete-modal]');
        elements.deleteConfirm = panel.querySelector('[data-messages-delete-confirm]');
        elements.deleteClosers = Array.from(panel.querySelectorAll('[data-messages-delete-close]'));
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
