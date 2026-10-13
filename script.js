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

window.addEventListener('load', setHeaderCssVar);
window.addEventListener('resize', setHeaderCssVar);
window.addEventListener('scroll', () => setHeaderCssVar(), { passive: true });

/* =======================
   Navegação suave
   ======================= */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerH = getHeaderH();
  const y = el.getBoundingClientRect().top + window.pageYOffset - headerH;
  window.scrollTo({ top: y, behavior: 'smooth' });
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
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
}, { passive: true });

/* =======================
   Toast & Form Helpers
   ======================= */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function getLang() {
  const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  if (htmlLang.startsWith('zh')) return 'zh';
  if (htmlLang.startsWith('en')) return 'en';
  if (htmlLang.startsWith('pt')) return 'pt';
  const path = (location.pathname || '').toLowerCase();
  if (path.startsWith('/zh/')) return 'zh';
  if (path.startsWith('/en/')) return 'en';
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
  },
  zh: {
    nameReq: '请填写您的姓名。',
    emailReq: '请输入有效的电子邮件地址。',
    consentReq: '请接受隐私政策。',
    success: '消息已发送！我们将尽快与您联系。'
  }
};

function setFieldError(inputEl, msg) {
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const lang = getLang();
  const t = I18N[lang] || I18N['pt'];
  const nameEl = form.querySelector('#name');
  const emailEl = form.querySelector('#email');
  const msgEl = form.querySelector('#message');
  const consent = form.querySelector('#consent');
  const consentError = form.querySelector('#consent-error');

  [nameEl, emailEl, msgEl].forEach((el) => el && clearFieldError(el));
  if (consentError) consentError.hidden = true;

  let firstInvalid = null;
  if (!nameEl || !nameEl.value.trim()) { setFieldError(nameEl, t.nameReq); firstInvalid = firstInvalid || nameEl; }
  const emailVal = (emailEl && emailEl.value.trim()) || '';
  if (!emailVal || !isValidEmail(emailVal)) { setFieldError(emailEl, t.emailReq); firstInvalid = firstInvalid || emailEl; }
  if (!consent || !consent.checked) { if (consentError) { consentError.textContent = t.consentReq; consentError.hidden = false; } firstInvalid = firstInvalid || consent; }

  if (firstInvalid) { firstInvalid.focus(); return; }
  showToast(t.success);
  form.reset();
}

/* =======================
   Inicializações
   ======================= */
document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('current-year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  document.addEventListener('click', (event) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenu && mobileMenu.classList.contains('show') && !mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
      toggleMobileMenu();
    }
  });

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
        document.querySelector(`.nav-link[onclick*="${sectionId}"]`)?.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', activateSection, { passive: true });
  window.addEventListener('resize', activateSection);
  activateSection();

  const form = document.getElementById('contact-form');
  if (form) {
    const consent = form.querySelector('#consent');
    const error = form.querySelector('#consent-error');
    consent?.addEventListener('change', () => { if (consent.checked && error) error.hidden = true; });
    form.querySelectorAll('input, textarea').forEach((el) => el?.addEventListener('input', () => clearFieldError(el)));
  }
});

/* =======================
   ACCORDEÃO
   ======================= */
(function setupAccordionFluidFix() {
  const root = document.querySelector('.services-accordion');
  if (!root) return;
  const items = [...root.querySelectorAll('.acc-item')].map(item => ({ item, header: item.querySelector('.acc-header'), panel: item.querySelector('.acc-panel') }));
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach(p => {
    p.header.setAttribute('aria-expanded','false');
    p.panel.style.height = '0px';
    p.header.addEventListener('click', () => {
        const isOpen = p.item.classList.contains('open');
        items.forEach(x => { 
            if (x !== p && x.item.classList.contains('open')) {
                x.panel.style.height = x.panel.scrollHeight + 'px';
                x.item.classList.remove('open');
                x.header.setAttribute('aria-expanded','false');
                requestAnimationFrame(() => x.panel.style.height = '0px');
            }
        });
        if (isOpen) {
            p.panel.style.height = p.panel.scrollHeight + 'px';
            p.item.classList.remove('open');
            p.header.setAttribute('aria-expanded','false');
            requestAnimationFrame(() => p.panel.style.height = '0px');
        } else {
            p.item.classList.add('open');
            p.header.setAttribute('aria-expanded','true');
            p.panel.style.height = p.panel.scrollHeight + 'px';
            const onEnd = () => { p.panel.style.height = 'auto'; p.panel.removeEventListener('transitionend', onEnd); };
            if(!prefersReduce) p.panel.addEventListener('transitionend', onEnd); else p.panel.style.height = 'auto';
        }
    });
  });
})();

/* =======================================================
   DRE TIMELINE - INFINITO PERFEITO, LENTO (0.4) & SUAVE
   ======================================================= */
(function() {
  const rail = document.getElementById('dreRail');
  const subtitle = document.getElementById('dre-subtitle');
  const wrap = document.querySelector('.dre-tl-wrap');
  if (!rail || !wrap) return;

  const SCROLL_SPEED = 0.4; 
  
  const style = document.createElement('style');
  style.innerHTML = `
    .dre-tl-wrap {
      overflow-y: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .dre-tl-wrap::-webkit-scrollbar { display: none; }
  `;
  document.head.appendChild(style);

  let animationId = null;
  let isHovered = false;
  let singleSetHeight = 0;
  let scrollAccumulator = 0; 

  const srcs = [
    '/dre-sumarios.json?' + Date.now(),
    'https://new-v2.dvaadvogados.pt/dre-sumarios.json?' + Date.now(),
    'https://dvaadvogados.pt/dre-sumarios.json?' + Date.now()
  ];

  const fetchFirstOk = async () => {
    for (const url of srcs) {
      try {
        const r = await fetch(url, { cache: 'no-store' });
        if (r.ok) return r.json();
      } catch (_) {}
    }
    throw new Error('Sem dados');
  };

  function buildCard(obj) {
    const el = document.createElement('article');
    el.className = 'dre-item';
    let dateStr = obj.date;
    try {
        const [y, m, d] = obj.date.split('-');
        if(y && m && d) dateStr = `${d}/${m}/${y}`;
    } catch(e) {}
    el.innerHTML = `
      <div class="dre-dot" aria-hidden="true"></div>
      <div class="dre-content">
        <span style="font-size: 0.75rem; color: #888; display:block; margin-bottom:4px;">${dateStr}</span>
        <h3 class="dre-title">
            <a href="${obj.url}" target="_blank" rel="noopener" style="text-decoration:none; color:inherit; transition:opacity 0.2s; display:block;">
                ${obj.title}
            </a>
        </h3>
        <p class="dre-summary">${obj.summary || 'Ver documento no DRE.'}</p>
      </div>
    `;
    return el;
  }

  function loop() {
    if (!isHovered && singleSetHeight > 0) {
        scrollAccumulator += SCROLL_SPEED;
        wrap.scrollTop = scrollAccumulator;
    }
    if (singleSetHeight > 0) {
        if (wrap.scrollTop <= 0) {
            wrap.scrollTop = singleSetHeight;
            scrollAccumulator = singleSetHeight;
        } else if (wrap.scrollTop >= (singleSetHeight * 2)) {
            wrap.scrollTop = singleSetHeight;
            scrollAccumulator = singleSetHeight;
        }
    }
    animationId = requestAnimationFrame(loop);
  }

  function attachHandlers() {
    wrap.addEventListener('mouseenter', () => { isHovered = true; });
    wrap.addEventListener('mouseleave', () => { isHovered = false; scrollAccumulator = wrap.scrollTop; });
    wrap.addEventListener('scroll', () => { if (isHovered) scrollAccumulator = wrap.scrollTop; }, { passive: true });
    wrap.addEventListener('touchstart', () => { isHovered = true; }, {passive: true});
    wrap.addEventListener('touchend', () => { setTimeout(() => { isHovered = false; scrollAccumulator = wrap.scrollTop; }, 1000); });
  }

  fetchFirstOk().then(async (data) => {
    const items = (data.items || []).filter(i => 
        i.title && !i.title.includes('Diário da República n.º') && !i.title.includes('Série I de')
    );
    if (!items.length) throw new Error('Sem itens válidos');
    rail.innerHTML = '';
    items.forEach(obj => rail.appendChild(buildCard(obj)));
    items.forEach(obj => rail.appendChild(buildCard(obj)));
    items.forEach(obj => rail.appendChild(buildCard(obj)));
    if (items[0].date && subtitle) {
        let d = items[0].date;
        try { const [y, m, day] = d.split('-'); d = `${day}/${m}/${y}`; } catch(e){}
        subtitle.textContent = 'Atualização diária · ' + d;
    }
    setTimeout(() => {
        singleSetHeight = rail.scrollHeight / 3;
        wrap.scrollTop = singleSetHeight;
        scrollAccumulator = singleSetHeight;
        attachHandlers();
        loop();
    }, 200);
  }).catch((e) => {
    console.error(e);
    rail.innerHTML = `<div class="dre-item"><div class="dre-content"><h3 class="dre-title">Não foi possível carregar os sumários.</h3><p class="dre-summary">Verifica a conexão ou tenta mais tarde.</p></div></div>`;
  });
})();

const anoFundacao = 2006;
const anoAtual = new Date().getFullYear();
const anos = anoAtual - anoFundacao;

document.getElementById("anosExp").textContent = anos;