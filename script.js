/* =======================
   UTIL: Header height var
   ======================= */
function getHeaderH() {
  const header = document.getElementById('header');
  return header ? header.offsetHeight : 0;
}

function setHeaderCssVar() {
  document.documentElement.style.setProperty('--header-h', getHeaderH() + 'px');
}

// Atualiza a var CSS no load / resize / ao mudar o estado do header
window.addEventListener('load', setHeaderCssVar);
window.addEventListener('resize', setHeaderCssVar);
window.addEventListener(
  'scroll',
  () => {
    // se o header ganhar a classe .scrolled, a altura pode mudar
    setHeaderCssVar();
  },
  { passive: true }
);

/* =======================
   Navegação suave
   ======================= */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerH = getHeaderH();
  const y = el.getBoundingClientRect().top + window.pageYOffset - headerH;

  window.scrollTo({ top: y, behavior: 'smooth' });

  // fecha o menu mobile se estiver aberto
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && mobileMenu.classList.contains('show')) toggleMobileMenu();
}

/* =======================
   Menu mobile
   ======================= */
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const btn = document.querySelector('.mobile-menu-btn');
  if (!mobileMenu || !btn) return;

  const willOpen = !mobileMenu.classList.contains('show');
  mobileMenu.classList.toggle('show');
  btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}


/* =======================
   Estado do header no scroll
   ======================= */
let lastScrollY = window.scrollY;
window.addEventListener(
  'scroll',
  () => {
    const header = document.getElementById('header');
    if (header) {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
  },
  { passive: true }
);

/* =======================
   Toast
   ======================= */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

/* =======================
   I18N (deteta PT/EN via <html lang>)
   ======================= */
function getLang() {
  // 1) Tenta pelo atributo <html lang="...">
  const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  if (htmlLang.startsWith('pt')) return 'pt';
  if (htmlLang.startsWith('en')) return 'en';

  // 2) Fallback pelo caminho (ex.: /en/...)
  const path = (location.pathname || '').toLowerCase();
  if (path.startsWith('/en/')) return 'en';

  // 3) Default
  return 'pt';
}
const I18N = {
  pt: {
    nameReq: 'Por favor preencha o nome.',
    emailReq: 'Por favor introduza um email válido.',
    consentReq: 'Por favor aceite a Política de Privacidade.',
    success: 'Mensagem enviada! Entraremos em contacto brevemente.'
  },
  en: {
    nameReq: 'Please fill in your name.',
    emailReq: 'Please enter a valid email address.',
    consentReq: 'Please accept the Privacy Policy.',
    success: 'Message sent! We will contact you shortly.'
  }
};

/* =======================
   Helpers de erro inline
   ======================= */
function setFieldError(inputEl, msg) {
  // procurar/criar <p class="field-error">
  let err = inputEl.parentElement.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    inputEl.parentElement.appendChild(err);
  }
  inputEl.setAttribute('aria-invalid', 'true');
  err.textContent = msg;
  err.hidden = false;
}

function clearFieldError(inputEl) {
  inputEl.removeAttribute('aria-invalid');
  const err = inputEl.parentElement.querySelector('.field-error');
  if (err) err.hidden = true;
}

/* =======================
   Validação simples
   ======================= */
function isValidEmail(email) {
  // regex simples/robusto
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =======================
   Submit do formulário + validações
   ======================= */
async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const lang = getLang();
  const t = I18N[lang];

  // elementos
  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');
  const msgEl = form.querySelector('#message');
  const consent = form.querySelector('#consent');
  const consentError = form.querySelector('#consent-error');

  // limpar erros prévios
  [nameEl, emailEl, msgEl].forEach((el) => el && clearFieldError(el));
  if (consentError) consentError.hidden = true;

  // validação Nome
  let firstInvalid = null;
  if (!nameEl || !nameEl.value.trim()) {
    setFieldError(nameEl, t.nameReq);
    firstInvalid = firstInvalid || nameEl;
  }

  // validação Email
  const emailVal = (emailEl && emailEl.value.trim()) || '';
  if (!emailVal || !isValidEmail(emailVal)) {
    setFieldError(emailEl, t.emailReq);
    firstInvalid = firstInvalid || emailEl;
  }

  // validação Consentimento
  if (!consent || !consent.checked) {
    if (consentError) {
      consentError.textContent = t.consentReq;
      consentError.hidden = false;
    }
    firstInvalid = firstInvalid || consent;
  }

  // se houver erro, focar e sair
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // --- Aqui iria o envio real (fetch/AJAX) se existir ---
  // Exemplo:
  // const resp = await fetch('/api/send', { method:'POST', body:new FormData(form) });
  // const data = await resp.json();

  showToast(t.success);
  form.reset();
}

/* =======================
   Inicializações (1 só DOMContentLoaded)
   ======================= */
document.addEventListener('DOMContentLoaded', () => {
  /* Ano no footer */
  const yearElement = document.getElementById('current-year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  /* Fechar menu mobile ao clicar fora */
  document.addEventListener('click', (event) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (
      mobileMenu &&
      mobileMenu.classList.contains('show') &&
      !mobileMenu.contains(event.target) &&
      !menuBtn.contains(event.target)
    ) {
      toggleMobileMenu();
    }
  });

  /* Secção ativa no menu (usa altura real do header) */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const activateSection = () => {
    const headerH = getHeaderH();
    const scrollY = window.pageYOffset;

    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop - headerH - 1;
      const sectionHeight = sec.offsetHeight;
      const sectionId = sec.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((l) => l.classList.remove('active'));
        document
          .querySelector(`.nav-link[onclick*="${sectionId}"]`)
          ?.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', activateSection, { passive: true });
  window.addEventListener('resize', activateSection);
  activateSection();

  /* Form: UX de erros */
  const form = document.getElementById('contact-form');
  if (form) {
    const consent = form.querySelector('#consent');
    const error = form.querySelector('#consent-error');

    // Esconde a mensagem assim que o utilizador aceita os termos
    consent?.addEventListener('change', () => {
      if (consent.checked && error) error.hidden = true;
    });

    // Limpeza dos erros de campos quando o utilizador começa a digitar
    const nameEl = form.querySelector('#name');
    const emailEl = form.querySelector('#email');
    const messageEl = form.querySelector('#message');
    [nameEl, emailEl, messageEl].forEach((el) => {
      el?.addEventListener('input', () => clearFieldError(el));
    });
  }
});



/* ===== ACCORDEÃO FLUIDO (height px→px, anti-“engasgos”) ===== */
(function setupAccordionFluidFix() {
  const root = document.querySelector('.services-accordion');
  if (!root) return;

  const singleOpen = true;
  const items = [...root.querySelectorAll('.acc-item')].map(item => ({
    item,
    header: item.querySelector('.acc-header'),
    panel:  item.querySelector('.acc-panel')
  }));
  const animating = new Set();
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // estado inicial
  items.forEach(p => {
    p.header.setAttribute('aria-expanded','false');
    p.panel.style.height = '0px';
  });

  function openPanel(p){
    if (animating.has(p.panel)) return;
    animating.add(p.panel);

    if (singleOpen){
      items.forEach(x => { if (x!==p && x.item.classList.contains('open')) closePanel(x, true); });
    }

    // ponto de partida (0)
    const start = p.panel.offsetHeight;   // força layout
    p.item.classList.add('open');         // aplica padding aberto
    p.header.setAttribute('aria-expanded','true');

    // destino com padding incluído
    const end = p.panel.scrollHeight;

    // 1ª frame: fixa altura inicial (0)
    p.panel.style.height = start + 'px';
    // 2ª frame: anima para o destino
    requestAnimationFrame(() => {
      if (prefersReduce){
        p.panel.style.height = 'auto';
        animating.delete(p.panel);
        return;
      }
      p.panel.style.height = end + 'px';
    });

    const onEnd = (e) => {
      if (e.propertyName !== 'height') return;
      p.panel.style.height = 'auto';      // liberta para crescer com conteúdo
      p.panel.removeEventListener('transitionend', onEnd);
      animating.delete(p.panel);
    };
    p.panel.addEventListener('transitionend', onEnd);
  }

  function closePanel(p, isGroup=false){
    if (animating.has(p.panel)) return;
    animating.add(p.panel);

    // de auto → px → 0
    const current = p.panel.scrollHeight;
    p.panel.style.height = current + 'px';
    p.item.classList.remove('open');
    p.header.setAttribute('aria-expanded','false');

    requestAnimationFrame(() => {
      if (prefersReduce){
        p.panel.style.height = '0px';
        animating.delete(p.panel);
        return;
      }
      p.panel.style.height = '0px';
    });

    const onEnd = (e) => {
      if (e.propertyName !== 'height') return;
      p.panel.removeEventListener('transitionend', onEnd);
      animating.delete(p.panel);
    };
    p.panel.addEventListener('transitionend', onEnd);
  }

  items.forEach(p => {
    p.header.addEventListener('click', () => {
      const isOpen = p.item.classList.contains('open');
      if (isOpen) closePanel(p);
      else openPanel(p);
    });
  });

  // reajusta altura durante resize se estiver a meio da animação/aberto
  window.addEventListener('resize', () => {
    const open = items.find(p => p.item.classList.contains('open'));
    if (!open) return;
    if (open.panel.style.height !== 'auto') {
      open.panel.style.height = open.panel.scrollHeight + 'px';
    }
  });
})();

