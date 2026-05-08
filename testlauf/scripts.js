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

// ============== CHECKOUT MODAL ==============
const checkoutModal = document.getElementById('checkout-modal');

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    if (sigModal) sigModal.classList.remove('open');
    if (checkoutModal) checkoutModal.classList.remove('open');
  });
});

if (checkoutModal) {
  checkoutModal.addEventListener('click', e => {
    if (e.target === checkoutModal) checkoutModal.classList.remove('open');
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (sigModal) sigModal.classList.remove('open');
    if (checkoutModal) checkoutModal.classList.remove('open');
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
    const price = card?.querySelector('.product-price')?.textContent || '';
    if (checkoutModal) {
      document.getElementById('checkout-product-name').textContent = name;
      document.getElementById('checkout-product-price').textContent = price;
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
