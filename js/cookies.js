/**
 * Cookie Consent Manager — The Lizards
 * GDPR-compliant: blocca i contenuti di terze parti fino al consenso esplicito.
 * La scelta viene salvata in localStorage.
 *
 * Elementi supportati:
 * 1. <div class="consent-placeholder" data-type="[spotify|facebook|facebook-like|youtube]" data-src="...">
 *    → sostituito con il rispettivo iframe dopo il consenso
 * 2. <script type="text/plain" data-consent-src="...">
 *    → caricato come script normale dopo il consenso (es. Facebook SDK)
 * 3. loadGigstarter() — funzione globale definita inline nell'HTML
 */
(function () {
    'use strict';

    var CONSENT_KEY = 'thelizards_cookie_consent';

    function getConsent() {
        try {
            return localStorage.getItem(CONSENT_KEY);
        } catch (e) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            localStorage.setItem(CONSENT_KEY, value);
        } catch (e) { /* localStorage non disponibile (es. private browsing) */ }
    }

    /**
     * Sostituisce tutti i placeholder .consent-placeholder[data-src] con il rispettivo iframe.
     * Supporta: data-type = spotify | facebook | facebook-like | youtube
     */
    function loadConsentIframes() {
        var placeholders = document.querySelectorAll('.consent-placeholder[data-src]');
        for (var i = 0; i < placeholders.length; i++) {
            loadIframe(placeholders[i]);
        }
    }

    function loadIframe(container) {
        var type = container.getAttribute('data-type') || '';
        var src  = container.getAttribute('data-src');
        var iframe = document.createElement('iframe');
        iframe.src = src;

        if (type === 'spotify') {
            iframe.className = 'spotify-iframe';
            iframe.title = container.getAttribute('data-title') || 'Spotify Player';
            iframe.setAttribute('width', '50%');
            iframe.setAttribute('height', '155');
            iframe.setAttribute('frameBorder', '0');
            iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');

        } else if (type === 'facebook') {
            iframe.className = 'facebook-iframe';
            iframe.title = container.getAttribute('data-title') || 'Facebook';
            iframe.setAttribute('width', '400');
            iframe.setAttribute('height', '500');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');

        } else if (type === 'facebook-like') {
            iframe.className = 'facebook-iframe';
            iframe.title = container.getAttribute('data-title') || 'Facebook Like';
            iframe.setAttribute('width', '400');
            iframe.setAttribute('height', '35');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');

        } else if (type === 'youtube') {
            iframe.className = 'embed-responsive-item';
            iframe.title = container.getAttribute('data-title') || 'YouTube Video';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            iframe.setAttribute('allowfullscreen', '');
        }

        container.parentNode.replaceChild(iframe, container);
    }

    /**
     * Attiva gli script bloccati con type="text/plain" data-consent-src="..."
     * Usato per Facebook SDK e simili.
     */
    function loadConsentScripts() {
        var blocked = document.querySelectorAll('script[type="text/plain"][data-consent-src]');
        for (var i = 0; i < blocked.length; i++) {
            var el = blocked[i];
            var script = document.createElement('script');
            if (el.getAttribute('data-async'))       script.async = true;
            if (el.getAttribute('data-defer'))       script.defer = true;
            if (el.getAttribute('data-crossorigin')) script.crossOrigin = el.getAttribute('data-crossorigin');
            script.src = el.getAttribute('data-consent-src');
            document.head.appendChild(script);
        }
    }

    /* Carica tutti i contenuti di terze parti */
    function loadThirdPartyContent() {
        loadConsentIframes();
        loadConsentScripts();
        /* loadGigstarter() è definita inline nell'HTML della sezione concerti/live */
        if (typeof loadGigstarter === 'function') {
            loadGigstarter();
        }
    }

    function showBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'block';
            /* Focus accessibile sul primo pulsante */
            var firstBtn = banner.querySelector('button');
            if (firstBtn) firstBtn.focus();
        }
    }

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.style.display = 'none';
    }

    function init() {
        var consent = getConsent();

        if (consent === 'accepted') {
            /* Consenso già dato: carica subito i contenuti */
            loadThirdPartyContent();
        } else if (!consent) {
            /* Prima visita: mostra il banner */
            showBanner();
        }
        /* consent === 'declined': i placeholder rimangono visibili */

        var acceptBtn = document.getElementById('cookie-accept');
        var declineBtn = document.getElementById('cookie-decline');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                setConsent('accepted');
                hideBanner();
                loadThirdPartyContent();
            });
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', function () {
                setConsent('declined');
                hideBanner();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
