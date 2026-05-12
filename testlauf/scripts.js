/* =============================================
   Sozialkredit-Initiative Schweiz — Scripts
   ============================================= */

// ============== PASSWORD GATE ==============
(function () {
  const KEY = 'sks_auth';
  const TTL = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
  const PASSWORD = 'sicher&gerecht';

  function isAuthed() {
    const stored = localStorage.getItem(KEY);
    if (!stored) return false;
    return Date.now() - parseInt(stored, 10) < TTL;
  }

  if (isAuthed()) return;

  // Inject gate overlay
  const gate = document.createElement('div');
  gate.id = 'password-gate';
  gate.innerHTML = `
    <div class="gate-card">
      <img src="website_material/Logo_Sozialkredit.png" alt="SKS Logo" class="gate-logo">
      <div class="gate-title">Sozialkredit-Initiative Schweiz</div>
      <p class="gate-subtitle">Interner Bereich – bitte Passwort eingeben.</p>
      <div class="gate-disclaimer">Satirisches Studierendenprojekt<br>Keine echte Initiative</div>
      <form id="gate-form" autocomplete="off">
        <input type="password" id="gate-input" placeholder="Passwort" autocomplete="current-password">
        <p class="gate-error" id="gate-error">Falsches Passwort. Bitte erneut versuchen.</p>
        <button type="submit" class="btn btn-primary" style="width:100%;">Einloggen</button>
      </form>
    </div>
  `;
  document.body.appendChild(gate);

  document.getElementById('gate-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const input = document.getElementById('gate-input');
    if (input.value === PASSWORD) {
      localStorage.setItem(KEY, Date.now().toString());
      gate.classList.add('gate-out');
      setTimeout(() => gate.remove(), 400);
    } else {
      const err = document.getElementById('gate-error');
      err.classList.add('visible');
      input.value = '';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  });
})();

// ============== HAMBURGER MENU ==============
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ============== ACTIVE NAV LINK ==============
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ============== ACCORDION (all types) ==============
function wireAccordion(selector) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      btn.nextElementSibling.classList.toggle('open', !isOpen);
    });
  });
}
wireAccordion('.accordion-btn');   // boxed (faktencheck)
wireAccordion('.flat-acc-btn');    // flat top-level (initiative)
wireAccordion('.sub-acc-btn');     // nested sub-sections
wireAccordion('.table-acc-btn');   // Vorteile & Chancen rows

// ============== PRIVACY MODAL (auto-injected) ==============
(function () {
  const m = document.createElement('div');
  m.className = 'modal-overlay';
  m.id = 'privacy-modal';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.innerHTML = `
    <div class="modal" style="max-width: 720px;">
      <div class="modal-header">
        <div>
          <div class="section-label">Rechtliches</div>
          <h2 style="margin-bottom:0;">Datenschutzerklärung</h2>
        </div>
        <button class="modal-close" aria-label="Schliessen">×</button>
      </div>
      <div style="font-size: 0.9375rem; color: var(--grey-700); line-height: 1.6;">
        <p style="font-size: 0.8125rem; color: var(--grey-500); margin-bottom: 1.25rem;">Stand: November 2026</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">1. Verantwortliche Stelle</h3>
        <p style="margin-bottom:1rem;">Verantwortlich ist das Initiativkomitee Sozialkredit-Initiative Schweiz, Schweizerplatz 0, 0000 Helvetingen, kontakt@sozialkredit-initiative.ch.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">2. Erhebung personenbezogener Daten</h3>
        <p style="margin-bottom:1rem;">Wir bearbeiten Daten, die Sie uns über unsere Online-Formulare (Unterschriftensammlung, Spenden, Kontaktanfragen) zur Verfügung stellen. Erfasst werden insbesondere Name, Adresse, E-Mail-Adresse, Geburtsdatum und weitere für den jeweiligen Zweck erforderliche Angaben.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">3. Zweck der Bearbeitung</h3>
        <p style="margin-bottom:1rem;">Die Daten werden ausschliesslich für die Bearbeitung Ihres Anliegens verwendet: Validierung von Unterschriften, Abwicklung von Spenden, Beantwortung von Anfragen sowie Kommunikation rund um die Initiative.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">4. Weitergabe an Dritte</h3>
        <p style="margin-bottom:1rem;">Eine Weitergabe erfolgt nur, soweit gesetzlich vorgeschrieben (z.B. an die Bundeskanzlei zur Beglaubigung der Unterschriften). Eine kommerzielle Weitergabe findet nicht statt.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">5. Speicherdauer</h3>
        <p style="margin-bottom:1rem;">Ihre Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck erforderlich oder gesetzlich vorgeschrieben ist.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">6. Ihre Rechte</h3>
        <p style="margin-bottom:1rem;">Sie haben jederzeit das Recht auf Auskunft, Berichtigung und Löschung der bei uns gespeicherten Daten. Wenden Sie sich dazu an die oben genannte Adresse.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">7. Cookies</h3>
        <p style="margin-bottom:1rem;">Unsere Website verwendet ausschliesslich technisch notwendige Cookies. Es findet kein Tracking zu Werbezwecken statt.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">8. Datensicherheit</h3>
        <p style="margin-bottom:1rem;">Wir treffen geeignete technische und organisatorische Massnahmen zum Schutz Ihrer Daten vor unbefugtem Zugriff oder Verlust. Alle Daten werden in der Schweiz gehostet.</p>
        <h3 style="margin:0 0 0.4rem; font-size:1rem;">9. Änderungen</h3>
        <p style="margin-bottom:1.25rem;">Wir behalten uns vor, diese Datenschutzerklärung an gesetzliche Entwicklungen oder Anpassungen unserer Dienste anzupassen. Die jeweils aktuelle Fassung ist auf dieser Seite abrufbar.</p>
      </div>
      <div class="form-actions" style="margin-top:1rem;">
        <button type="button" class="btn btn-primary modal-close" style="flex:1;">Schliessen</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
})();

const privacyModal = document.getElementById('privacy-modal');

document.querySelectorAll('[data-modal="privacy"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (privacyModal) privacyModal.classList.add('open');
  });
});

if (privacyModal) {
  privacyModal.addEventListener('click', e => {
    if (e.target === privacyModal) privacyModal.classList.remove('open');
  });
}

// ============== SIGNATURE MODAL ==============
const sigModal = document.getElementById('signature-modal');

document.querySelectorAll('[data-modal="signature"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (sigModal) sigModal.classList.add('open');
  });
});

if (sigModal) {
  sigModal.addEventListener('click', e => {
    if (e.target === sigModal) sigModal.classList.remove('open');
  });
}

// ============== CONTACT MODAL ==============
const contactModal = document.getElementById('contact-modal');

document.querySelectorAll('[data-modal="contact"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (contactModal) contactModal.classList.add('open');
  });
});

if (contactModal) {
  contactModal.addEventListener('click', e => {
    if (e.target === contactModal) contactModal.classList.remove('open');
  });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (contactModal) contactModal.classList.remove('open');
    contactForm.reset();
    showToast('Vielen Dank! Wir melden uns innerhalb der nächsten Tage bei Ihnen.');
  });
}

// ============== CHECKOUT MODAL ==============
const checkoutModal = document.getElementById('checkout-modal');
let checkoutUnitPrice = 0;

function updateCheckoutPrice() {
  const qty = parseInt(document.getElementById('checkout-qty')?.value || '1', 10);
  const priceEl = document.getElementById('checkout-product-price');
  if (!priceEl) return;
  if (checkoutUnitPrice === 0) return; // free item
  priceEl.textContent = 'CHF ' + (checkoutUnitPrice * qty) + '.–';
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    if (sigModal) sigModal.classList.remove('open');
    if (checkoutModal) checkoutModal.classList.remove('open');
    if (contactModal) contactModal.classList.remove('open');
    if (privacyModal) privacyModal.classList.remove('open');
  });
});

if (checkoutModal) {
  checkoutModal.addEventListener('click', e => {
    if (e.target === checkoutModal) checkoutModal.classList.remove('open');
  });
  document.getElementById('checkout-qty')?.addEventListener('change', updateCheckoutPrice);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (sigModal) sigModal.classList.remove('open');
    if (checkoutModal) checkoutModal.classList.remove('open');
    if (contactModal) contactModal.classList.remove('open');
    if (privacyModal) privacyModal.classList.remove('open');
  }
});

const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', e => {
    e.preventDefault();
    if (checkoutModal) checkoutModal.classList.remove('open');
    checkoutForm.reset();
    showToast('Bestellung erfolgreich aufgegeben! Sie erhalten eine Bestätigung per E-Mail.');
  });
}


// ============== SIGNATURE FORM ==============
const sigForm = document.getElementById('signature-form');
if (sigForm) {
  // Signature field click feedback
  const sigArea = sigForm.querySelector('.signature-area');
  if (sigArea) {
    sigArea.addEventListener('click', () => {
      sigArea.textContent = '✓ Unterschrift erfasst';
      sigArea.style.borderColor = 'var(--green)';
      sigArea.style.color = 'var(--green)';
    });
  }

  sigForm.addEventListener('submit', e => {
    e.preventDefault();
    if (sigModal) sigModal.classList.remove('open');
    sigForm.reset();
    if (sigArea) {
      sigArea.textContent = 'Hier unterschreiben (Klick zum Simulieren)';
      sigArea.style.borderColor = '';
      sigArea.style.color = '';
    }
    showToast('Vielen Dank! Ihre Unterschrift wurde erfasst.');
  });
}

// ============== NEWSLETTER FORM ==============
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    newsletterForm.reset();
    showToast('Anmeldung erfolgreich! Willkommen in der Bewegung.');
  });
}

// ============== DONATION AMOUNT PICKER ==============
const presetBtns = document.querySelectorAll('.preset-btn');
const customInput = document.getElementById('custom-amount');
const amountDisplay = document.getElementById('donation-display-value');

function updateDisplay(val) {
  if (amountDisplay) amountDisplay.textContent = parseFloat(val).toFixed(2).replace('.', '.–').replace('–', '.–').split('.–')[0] + '.–';
  if (amountDisplay) amountDisplay.textContent = val + '.–';
}

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    presetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const val = btn.dataset.amount;
    if (customInput) customInput.value = val;
    if (amountDisplay) amountDisplay.textContent = val + '.–';
  });
});

if (customInput) {
  customInput.addEventListener('input', () => {
    presetBtns.forEach(b => b.classList.remove('active'));
    const val = customInput.value || '0';
    if (amountDisplay) amountDisplay.textContent = val + '.–';
  });
}

// ============== DONATION FORM ==============
const donationForm = document.getElementById('donation-form');
if (donationForm) {
  donationForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Herzlichen Dank für Ihre grosszügige Spende!');
    donationForm.reset();
    presetBtns.forEach(b => b.classList.remove('active'));
    if (amountDisplay) amountDisplay.textContent = '10.–';
  });
}

// ============== SHOP CART MOCK ==============
document.querySelectorAll('.btn-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    const name = card?.querySelector('.product-name')?.textContent || 'Artikel';
    const priceText = card?.querySelector('.product-price')?.textContent || '';
    const priceMatch = priceText.match(/\d+/);
    checkoutUnitPrice = priceMatch ? parseInt(priceMatch[0], 10) : 0;
    if (checkoutModal) {
      document.getElementById('checkout-product-name').textContent = name;
      document.getElementById('checkout-product-price').textContent = checkoutUnitPrice ? `CHF ${checkoutUnitPrice}.–` : priceText;
      document.getElementById('checkout-qty').value = '1';
      checkoutModal.classList.add('open');
    }
  });
});

// ============== TOAST ==============
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  });
}
