document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.sidebar__menu-link[data-section]');
    const panels = document.querySelectorAll('.profile__panel');

    const setupPublishModal = (panel) => {
        const modal = panel.querySelector('[data-modal="publish"]');
        if (!modal) {
            return;
        }

        const openButtons = panel.querySelectorAll('[data-modal-trigger="publish"]');
        if (!openButtons.length) {
            return;
        }

        const closers = modal.querySelectorAll('[data-modal-close]');
        const steps = Array.from(modal.querySelectorAll('.modal-publish__step'));
        const summaryBadges = {
            purpose: modal.querySelector('[data-selection-purpose]'),
            type: modal.querySelector('[data-selection-type]')
        };
        const purposeOptions = Array.from(modal.querySelectorAll('[data-purpose]'));
        const typeOptions = Array.from(modal.querySelectorAll('[data-type]'));
        const backButton = modal.querySelector('[data-publish-back]');
        const finishButton = modal.querySelector('[data-publish-finish]');
        const detailsModal = panel.querySelector('[data-modal="publish-details"]');

        const createModalController = (modalElement) => {
            if (!modalElement) {
                return null;
            }

            const closers = Array.from(modalElement.querySelectorAll('[data-modal-close]'));
            const firstField = modalElement.querySelector('input, textarea, select, button');
            const fileInput = modalElement.querySelector('.publish-details__file-input');
            const uploadButton = modalElement.querySelector('.publish-details__upload-btn');
            const uploadArea = modalElement.querySelector('.publish-details__upload');
            const galleryContainer = modalElement.querySelector('.publish-details__gallery');
            const galleryList = modalElement.querySelector('[data-gallery-list]');
            const galleryStatus = modalElement.querySelector('[data-gallery-status]');
            const galleryCount = modalElement.querySelector('[data-gallery-count]');
            const galleryProgress = modalElement.querySelector('[data-gallery-progress]');
            const galleryProgressWrapper = modalElement.querySelector('[data-gallery-progress-wrapper]');
            const galleryProgressLabel = modalElement.querySelector('[data-gallery-progress-label]');
            const galleryCover = modalElement.querySelector('[data-gallery-cover]');
            const galleryItems = [];
            const recommendedGallerySize = 12;
            let dragSourceIndex = null;

            const updateAriaState = (isOpen) => {
                modalElement.setAttribute('aria-hidden', String(!isOpen));
                if (isOpen) {
                    modalElement.setAttribute('aria-modal', 'true');
                } else {
                    modalElement.removeAttribute('aria-modal');
                }
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    close();
                }
            };

            const close = () => {
                modalElement.classList.remove('modal--visible');
                updateAriaState(false);
                document.removeEventListener('keydown', handleKeyDown);
                dragSourceIndex = null;
                if (uploadArea) {
                    uploadArea.classList.remove('is-dragover');
                }
            };

            const open = () => {
                modalElement.classList.add('modal--visible');
                updateAriaState(true);
                document.addEventListener('keydown', handleKeyDown);
                if (firstField) {
                    setTimeout(() => firstField.focus(), 50);
                }
            };

            closers.forEach(closer => {
                closer.addEventListener('click', event => {
                    event.preventDefault();
                    close();
                });
            });

            const formatFileName = (name = '') => {
                if (name.length <= 32) {
                    return name;
                }
                const start = name.slice(0, 18);
                const end = name.slice(-10);
                return `${start}…${end}`;
            };

            const formatFileSize = (size = 0) => {
                if (size <= 0) {
                    return '';
                }
                const kilobytes = size / 1024;
                if (kilobytes < 1024) {
                    return `${kilobytes.toFixed(1)} KB`;
                }
                return `${(kilobytes / 1024).toFixed(2)} MB`;
            };

            const revokePreview = (item) => {
                if (item && item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            };

            const updateGalleryEmptyState = () => {
                if (!galleryContainer) {
                    return;
                }

                const count = galleryItems.length;
                const isEmpty = count === 0;
                const percentage = Math.min(Math.round((count / recommendedGallerySize) * 100), 100);
                const statusState = isEmpty ? 'empty' : (count >= recommendedGallerySize ? 'complete' : 'filled');

                galleryContainer.dataset.empty = isEmpty ? 'true' : 'false';

                if (galleryStatus) {
                    galleryStatus.dataset.state = statusState;
                }

                if (galleryCount) {
                    galleryCount.textContent = String(count);
                }

                if (galleryCover) {
                    galleryCover.textContent = isEmpty
                        ? 'La portada se asignará a la primera imagen que cargues.'
                        : `Portada actual: ${formatFileName(galleryItems[0].file.name)}`;
                }

                if (galleryProgress) {
                    galleryProgress.style.width = `${percentage}%`;
                    galleryProgress.setAttribute('data-progress-value', String(percentage));
                }

                if (galleryProgressLabel) {
                    galleryProgressLabel.textContent = count >= recommendedGallerySize
                        ? 'Galería lista'
                        : `${count}/${recommendedGallerySize} sugeridas`;
                }

                if (galleryProgressWrapper) {
                    const label = statusState === 'complete'
                        ? 'Progreso de la galería completado'
                        : `Progreso de la galería ${percentage}% listo`;
                    galleryProgressWrapper.setAttribute('aria-label', label);
                }
            };

            const removeGalleryItem = (index) => {
                if (index < 0 || index >= galleryItems.length) {
                    return;
                }
                const [removed] = galleryItems.splice(index, 1);
                revokePreview(removed);
                renderGallery();
            };

            const handleItemDragStart = (event) => {
                const target = event.currentTarget;
                dragSourceIndex = Number(target.dataset.index);
                target.classList.add('is-dragging');
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(dragSourceIndex));
                }
            };

            const handleItemDragOver = (event) => {
                event.preventDefault();
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
            };

            const handleItemDrop = (event) => {
                event.preventDefault();
                const targetIndex = Number(event.currentTarget.dataset.index);
                if (
                    Number.isInteger(dragSourceIndex) &&
                    dragSourceIndex !== null &&
                    dragSourceIndex !== targetIndex &&
                    targetIndex >= 0 &&
                    targetIndex < galleryItems.length
                ) {
                    const [movedItem] = galleryItems.splice(dragSourceIndex, 1);
                    galleryItems.splice(targetIndex, 0, movedItem);
                    renderGallery();
                }
                dragSourceIndex = null;
            };

            const handleItemDragEnd = (event) => {
                event.currentTarget.classList.remove('is-dragging');
            };

            const renderGallery = () => {
                if (!galleryList) {
                    return;
                }

                galleryList.innerHTML = '';
                updateGalleryEmptyState();

                galleryItems.forEach((item, index) => {
                    const listItem = document.createElement('li');
                    listItem.className = 'publish-details__gallery-item';
                    listItem.draggable = true;
                    listItem.dataset.index = String(index);

                    const image = document.createElement('img');
                    image.className = 'publish-details__gallery-thumb';
                    image.src = item.previewUrl;
                    image.alt = `Vista previa ${index + 1}`;

                    const footer = document.createElement('footer');

                    const indexBadge = document.createElement('span');
                    indexBadge.className = 'publish-details__gallery-index';
                    indexBadge.textContent = String(index + 1);

                    const info = document.createElement('div');
                    info.className = 'publish-details__gallery-info';

                    const name = document.createElement('span');
                    name.className = 'publish-details__gallery-name';
                    name.title = item.file.name;
                    name.textContent = formatFileName(item.file.name);

                    const meta = document.createElement('span');
                    meta.className = 'publish-details__gallery-meta';
                    meta.textContent = formatFileSize(item.file.size);

                    info.append(name, meta);

                    const actions = document.createElement('div');
                    actions.className = 'publish-details__gallery-actions';

                    const handleIcon = document.createElement('span');
                    handleIcon.className = 'publish-details__gallery-handle';
                    handleIcon.setAttribute('aria-hidden', 'true');
                    handleIcon.innerHTML = '&#8942;';

                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'publish-details__gallery-remove';
                    removeButton.setAttribute('aria-label', `Quitar ${item.file.name}`);
                    removeButton.innerHTML = '&times;';
                    removeButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        removeGalleryItem(index);
                    });

                    actions.append(handleIcon, removeButton);
                    footer.append(indexBadge, info, actions);
                    listItem.append(image, footer);

                    listItem.addEventListener('dragstart', handleItemDragStart);
                    listItem.addEventListener('dragover', handleItemDragOver);
                    listItem.addEventListener('drop', handleItemDrop);
                    listItem.addEventListener('dragend', handleItemDragEnd);

                    galleryList.append(listItem);
                });
            };

            const addFilesToGallery = (files) => {
                if (!files || !files.length) {
                    return;
                }

                Array.from(files).forEach(file => {
                    if (!file.type.startsWith('image/')) {
                        return;
                    }

                    const identifier = `${file.name}-${file.lastModified}-${file.size}`;
                    const isDuplicate = galleryItems.some(item => item.id === identifier);
                    if (isDuplicate) {
                        return;
                    }

                    galleryItems.push({
                        id: identifier,
                        file,
                        previewUrl: URL.createObjectURL(file)
                    });
                });

                renderGallery();
            };

            const triggerFileDialog = () => {
                if (fileInput) {
                    fileInput.click();
                }
            };

            if (uploadButton && fileInput) {
                uploadButton.addEventListener('click', event => {
                    event.preventDefault();
                    triggerFileDialog();
                });
            }

            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', event => {
                    if (event.target.closest('button') || event.target === fileInput) {
                        return;
                    }
                    triggerFileDialog();
                });

                const preventDefaults = (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                };

                const activateDragState = (event) => {
                    preventDefaults(event);
                    uploadArea.classList.add('is-dragover');
                };

                const deactivateDragState = (event) => {
                    preventDefaults(event);
                    uploadArea.classList.remove('is-dragover');
                };

                ['dragenter', 'dragover'].forEach(type => {
                    uploadArea.addEventListener(type, activateDragState);
                });

                ['dragleave', 'dragend'].forEach(type => {
                    uploadArea.addEventListener(type, event => {
                        preventDefaults(event);
                        setTimeout(() => {
                            if (!uploadArea.matches(':hover')) {
                                uploadArea.classList.remove('is-dragover');
                            }
                        }, 50);
                    });
                });

                uploadArea.addEventListener('drop', event => {
                    deactivateDragState(event);
                    if (event.dataTransfer?.files?.length) {
                        addFilesToGallery(event.dataTransfer.files);
                    }
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', event => {
                    const target = event.target;
                    if (target && target.files) {
                        addFilesToGallery(target.files);
                        target.value = '';
                    }
                });
            }

            renderGallery();

            return { open, close };
        };

        const detailsModalController = createModalController(detailsModal);

        let publishState = {
            purpose: null,
            type: null
        };

        const setBadge = (badge, label) => {
            if (!badge) {
                return;
            }

            if (label) {
                badge.textContent = label;
                badge.hidden = false;
            } else {
                badge.textContent = '';
                badge.hidden = true;
            }
        };

        const toggleOptionSelection = (options, activeOption) => {
            options.forEach(option => {
                const isActive = option === activeOption;
                option.classList.toggle('is-selected', isActive);
                option.setAttribute('aria-pressed', String(isActive));
            });
        };

        const showStep = (stepName) => {
            steps.forEach(step => {
                const isActive = step.dataset.step === stepName;
                step.classList.toggle('modal-publish__step--active', isActive);
            });
            modal.dataset.currentStep = stepName;
        };

        const resetPublishState = () => {
            publishState = { purpose: null, type: null };
            toggleOptionSelection(purposeOptions, null);
            toggleOptionSelection(typeOptions, null);
            setBadge(summaryBadges.purpose, '');
            setBadge(summaryBadges.type, '');
            if (finishButton) {
                finishButton.disabled = true;
            }
            showStep('purpose');
        };

        const updateAria = (isOpen) => {
            modal.setAttribute('aria-hidden', String(!isOpen));
            if (isOpen) {
                modal.setAttribute('aria-modal', 'true');
            } else {
                modal.removeAttribute('aria-modal');
            }
        };

        const closeModal = () => {
            modal.classList.remove('modal--visible');
            updateAria(false);
            document.removeEventListener('keydown', handleKeyDown);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        const openModal = () => {
            resetPublishState();
            modal.classList.add('modal--visible');
            updateAria(true);
            document.addEventListener('keydown', handleKeyDown);
        };

        openButtons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                openModal();
            });
        });

        closers.forEach(element => {
            element.addEventListener('click', event => {
                event.preventDefault();
                closeModal();
            });
        });

        purposeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.purpose = option.dataset.purpose || null;
                toggleOptionSelection(purposeOptions, option);
                setBadge(summaryBadges.purpose, option.dataset.label || '');
                publishState.type = null;
                toggleOptionSelection(typeOptions, null);
                setBadge(summaryBadges.type, '');
                if (finishButton) {
                    finishButton.disabled = true;
                }
                showStep('type');
            });
        });

        typeOptions.forEach(option => {
            option.addEventListener('click', () => {
                publishState.type = option.dataset.type || null;
                toggleOptionSelection(typeOptions, option);
                setBadge(summaryBadges.type, option.dataset.label || '');
                if (finishButton) {
                    finishButton.disabled = false;
                }
            });
        });

        if (backButton) {
            backButton.addEventListener('click', event => {
                event.preventDefault();
                showStep('purpose');
                if (finishButton) {
                    finishButton.disabled = !publishState.type;
                }
            });
        }

        if (finishButton) {
            finishButton.addEventListener('click', event => {
                event.preventDefault();
                if (finishButton.disabled) {
                    return;
                }
                closeModal();
                if (detailsModalController) {
                    detailsModalController.open();
                }
            });
        }
    };

    const initializePanelFeatures = (panel) => {
        if (panel.dataset.section === 'propiedades') {
            setupPublishModal(panel);
        }
    };

    const loadPanelContent = (panel) => {
        const source = panel.dataset.src;
        if (!source) {
            return;
        }

        fetch(source)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el contenido de ${source}`);
                }
                return response.text();
            })
            .then(html => {
                panel.innerHTML = html;
                initializePanelFeatures(panel);
            })
            .catch(error => {
                console.error(error);
                panel.innerHTML = '<p class="panel__error">No se pudo cargar el contenido. Intenta recargar la página.</p>';
            });
    };

    panels.forEach(loadPanelContent);

    menuLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetSection = link.dataset.section;
            if (!targetSection) {
                return;
            }

            event.preventDefault();

            menuLinks.forEach(menuLink => menuLink.classList.remove('sidebar__menu-link--active'));
            link.classList.add('sidebar__menu-link--active');

            panels.forEach(panel => {
                const isActive = panel.dataset.section === targetSection;
                panel.classList.toggle('profile__panel--active', isActive);
                if (isActive && !panel.innerHTML.trim()) {
                    loadPanelContent(panel);
                }
            });
        });
    });
});
