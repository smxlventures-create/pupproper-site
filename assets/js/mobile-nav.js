/* PUPPROPER — Mobile nav drawer controller
 * ─────────────────────────────────────────────
 * Toggles body.nav-open when the hamburger is tapped.
 * Closes on: scrim tap, ESC key, drawer link tap, breakpoint resize > 768.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var body = document.body;
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.querySelector('.nav-drawer');
    var scrim  = document.querySelector('.nav-scrim');

    if (!toggle || !drawer) return; // page didn't include the mobile-nav markup

    function open()  { body.classList.add('nav-open');  toggle.setAttribute('aria-expanded', 'true');  }
    function close() { body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); }
    function isOpen() { return body.classList.contains('nav-open'); }

    toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
    if (scrim) scrim.addEventListener('click', close);

    // ESC dismisses
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close();
    });

    // Tapping any link inside the drawer closes it (so the navigation happens, scroll resumes)
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    // If user resizes to desktop, drop the nav-open state
    var mql = window.matchMedia('(min-width: 769px)');
    var onChange = function () { if (mql.matches) close(); };
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange);
  });
})();
