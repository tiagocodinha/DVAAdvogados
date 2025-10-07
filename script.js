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
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  if (mobileMenu) {
    mobileMenu.classList.toggle('show');
    if (menuIcon && closeIcon) {
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    }
  }
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



/* ===== ACCORDEÃO (drop-in suavizado; sem prender) ===== */
(function setupAccordionRobusto() {
  const items = [...document.querySelectorAll('.services-accordion .acc-item')];
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parts = items.map(item => ({
    item,
    header: item.querySelector('.acc-header'),
    panel:  item.querySelector('.acc-panel')
  }));

  // evita cliques repetidos durante a transição (a “prender” vinha daqui)
  let busy = false;
  const UNLOCK_MS = 420; // ≈ à tua transição .35s
  const lock = () => { busy = true; setTimeout(()=>busy=false, UNLOCK_MS); };

  const forceReflow = el => { void el.offsetHeight; };
  const clearEnd = p => {
    if (p._end) { p.panel.removeEventListener('transitionend', p._end); p._end = null; }
  };
  const setMax = (p, v) => { p.panel.style.maxHeight = v; };

  const closeItem = (p) => {
    if (!p.item.classList.contains('open')) { p.panel.hidden = true; return; }

    clearEnd(p);
    p.panel.hidden = false;

    // estado de partida = altura atual (com padding aberto)
    const start = p.panel.scrollHeight;
    p.panel.style.transition = 'none';
    setMax(p, start + 'px');
    forceReflow(p.panel);

    // retirar classe e animar para 0 num frame separado (evita "salto")
    p.item.classList.remove('open');
    p.header.setAttribute('aria-expanded', 'false');

    requestAnimationFrame(() => {
      if (reduceMotion) {
        setMax(p, '0px');
        p.panel.hidden = true;
        p.panel.style.transition = '';
        return;
      }

      p.panel.style.transition = '';  // volta às transições do CSS
      p.panel.style.opacity = '0';
      setMax(p, '0px');

      p._end = (e) => {
        if (e.propertyName !== 'max-height') return;
        p.panel.hidden = true;
        clearEnd(p);
      };
      p.panel.addEventListener('transitionend', p._end);
    });
  };

  const openItem = (p) => {
    // fecha os outros primeiro
    parts.forEach(x => { if (x !== p) closeItem(x); });

    clearEnd(p);
    p.panel.hidden = false;

    // estabiliza o ponto de partida
    const current = p.panel.offsetHeight; // 0 se fechado
    p.panel.style.transition = 'none';
    setMax(p, current + 'px');
    forceReflow(p.panel);

    // aplica estado aberto para medir com padding
    p.item.classList.add('open');
    p.header.setAttribute('aria-expanded', 'true');
    p.panel.style.opacity = '1';

    // mede o destino depois de a classe estar aplicada
    const target = p.panel.scrollHeight;

    // anima num frame separado: evita o “engasgar” antes de abrir
    requestAnimationFrame(() => {
      if (reduceMotion) { setMax(p, 'none'); return; }

      p.panel.style.transition = '';
      setMax(p, target + 'px');

      p._end = (e) => {
        if (e.propertyName !== 'max-height') return;
        // liberta a altura para não cortar se o conteúdo crescer
        setMax(p, 'none');
        clearEnd(p);
      };
      p.panel.addEventListener('transitionend', p._end);
    });
  };

  // estado inicial + handlers
  parts.forEach(p => {
    p.header.setAttribute('aria-expanded', 'false');
    p.panel.hidden = true;
    p.panel.style.maxHeight = '0px';
    p.panel.style.opacity = '0';

    p.header.addEventListener('click', () => {
      if (busy) return;
      lock();
      if (p.item.classList.contains('open')) closeItem(p);
      else openItem(p);
    });
  });

  // mantém o aberto sem cortes em resize
  window.addEventListener('resize', () => {
    const open = parts.find(p => p.item.classList.contains('open'));
    if (open) setMax(open, 'none');
  });
})();

