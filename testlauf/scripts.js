/* =============================================
   Sozialkredit-Initiative Schweiz — Scripts
   ============================================= */

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

// ============== ACCORDION ==============
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const body = btn.nextElementSibling;

    // In independent-accordion mode (no .accordion-group collapse-all needed)
    // Just toggle the clicked one
    btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    body.classList.toggle('open', !isOpen);
  });
});

// ============== SIGNATURE MODAL ==============
const sigModal = document.getElementById('signature-modal');

document.querySelectorAll('[data-modal="signature"]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    if (sigModal) sigModal.classList.add('open');
  });
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    if (sigModal) sigModal.classList.remove('open');
  });
});

if (sigModal) {
  sigModal.addEventListener('click', e => {
    if (e.target === sigModal) sigModal.classList.remove('open');
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sigModal) sigModal.classList.remove('open');
});

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
    const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Artikel';
    showToast(`«${name}» wurde in den Warenkorb gelegt.`);
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
