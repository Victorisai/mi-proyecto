(function () {
    const SELECTORS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = (container) => {
        if (!container) {
            return [];
        }
        return Array.from(container.querySelectorAll(SELECTORS)).filter((element) => {
            const isDisabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
            const isHidden = element.offsetParent === null && element !== document.activeElement;
            return !isDisabled && !isHidden;
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.querySelector('.profile__mobile-menu-toggle');
        const menu = document.getElementById('profileMobileMenu');
        const menuPanel = menu ? menu.querySelector('.profile__mobile-menu-panel') : null;
        let lastFocusedElement = null;

        if (!toggle || !menu) {
            return;
        }

        const isMenuOpen = () => menu.classList.contains('profile__mobile-menu--open');

        const setBodyScroll = (enabled) => {
            document.body.classList.toggle('profile-page--menu-open', !enabled);
        };

        const focusFirstElement = () => {
            const focusables = getFocusableElements(menuPanel);
            if (focusables.length > 0) {
                focusables[0].focus();
            }
        };

        const openMenu = () => {
            if (isMenuOpen()) {
                return;
            }

            lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

            menu.classList.add('profile__mobile-menu--open');
            menu.removeAttribute('hidden');
            toggle.classList.add('is-active');
            toggle.setAttribute('aria-expanded', 'true');
            setBodyScroll(false);
            focusFirstElement();
        };

        const closeMenu = (options = { restoreFocus: true }) => {
            if (!isMenuOpen()) {
                return;
            }

            menu.classList.remove('profile__mobile-menu--open');
            menu.setAttribute('hidden', '');
            toggle.classList.remove('is-active');
            toggle.setAttribute('aria-expanded', 'false');
            setBodyScroll(true);

            if (options.restoreFocus) {
                const target = lastFocusedElement && document.body.contains(lastFocusedElement) ? lastFocusedElement : toggle;
                if (target) {
                    target.focus({ preventScroll: true });
                }
            }
        };

        toggle.addEventListener('click', () => {
            if (isMenuOpen()) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        menu.addEventListener('click', (event) => {
            const link = event.target instanceof Element ? event.target.closest('.sidebar__menu-link') : null;
            if (link) {
                closeMenu();
                return;
            }

            if (event.target === menu) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isMenuOpen()) {
                closeMenu();
            }
        });

        const mediaQuery = window.matchMedia('(min-width: 993px)');
        const handleMediaChange = (event) => {
            if (event.matches) {
                closeMenu({ restoreFocus: false });
            }
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleMediaChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleMediaChange);
        }
    });
})();
