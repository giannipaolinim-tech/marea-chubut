// "Add to home screen" support: native install prompt (Chrome / Samsung Internet on Android)
// plus plain instructions, and a warning when the page is open inside another app's browser.
import { h } from './util.js';

let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { deferred = null; });

export const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

// WhatsApp, Instagram, Facebook, Gmail and similar open links in an embedded browser (Android WebView)
// that cannot install web apps.
export const inAppBrowser = () => /; wv\)|WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Line\/|GSA\//.test(navigator.userAgent);

const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

function steps() {
  if (inAppBrowser()) return 'Estás viendo la página dentro de otra app (WhatsApp, Gmail, Instagram…), que no permite instalar. Tocá el menú ⋮ de arriba y elegí <b>Abrir en Chrome</b> (o «Abrir en el navegador»), y ahí instalala.';
  if (isIOS()) return 'En Safari: tocá <b>Compartir</b> (el cuadrado con la flecha) y después <b>Agregar a inicio</b>.';
  if (/SamsungBrowser/.test(navigator.userAgent)) return 'En Samsung Internet: tocá el menú <b>≡</b> abajo a la derecha y elegí <b>Agregar página a</b> → <b>Pantalla de inicio</b>.';
  return 'En Chrome: tocá el menú <b>⋮</b> arriba a la derecha y elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.';
}

/** Card for the "Más" screen. Returns null once the app is installed. */
export function installCard() {
  if (isInstalled()) return null;
  const card = h(`<div class="card install-card section"><h2 class="card-title">Instalá la app en tu celular</h2>
    <p class="muted">Queda como un ícono en la pantalla de inicio y funciona sin señal (salvo el viento, que necesita conexión). Abrila una vez con señal para que se guarde todo.</p>
    <button type="button" class="btn btn--primary install-btn" hidden>Instalar app</button>
    <p class="install-steps small">${steps()}</p></div>`);
  const btn = card.querySelector('.install-btn');
  if (deferred && !inAppBrowser()) btn.hidden = false;
  btn.onclick = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    btn.hidden = true;
    if (outcome === 'accepted') card.querySelector('.install-steps').textContent = 'Listo: buscá el ícono de Marea Chubut en tu pantalla de inicio.';
  };
  return card;
}

/** One-time banner when opened inside another app's browser. */
export function warnInAppBrowser() {
  if (!inAppBrowser() || isInstalled()) return;
  try { if (sessionStorage.getItem('mc.iab')) return; } catch { /* storage blocked */ }
  const bar = h(`<div class="iab-bar" role="status"><span>Para instalarla y usarla sin señal, abrila en Chrome: menú ⋮ → <b>Abrir en Chrome</b>.</span><button type="button" class="icon-btn" aria-label="Cerrar">✕</button></div>`);
  bar.querySelector('button').onclick = () => { bar.remove(); try { sessionStorage.setItem('mc.iab', '1'); } catch { /* ignore */ } };
  document.body.append(bar);
}
