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
window.addEventListener('scroll', () => {
  // se o header ganhar a classe .scrolled, a altura pode mudar
  setHeaderCssVar();
}, { passive: true });

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerH = getHeaderH();       // altura exata do header
  const y = el.getBoundingClientRect().top + window.pageYOffset - headerH; // sem extra

  window.scrollTo({ top: y, behavior: 'smooth' });

  // fecha o menu mobile se estiver aberto
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && mobileMenu.classList.contains('show')) toggleMobileMenu();
}

// --- secção ativa (usa a mesma altura do header) ---
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const activateSection = () => {
    const headerH = getHeaderH();
    const scrollY = window.pageYOffset;

    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop - headerH - 1; // -1px para garantir que cola ao header
      const sectionHeight = sec.offsetHeight;
      const sectionId = sec.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((l) => l.classList.remove("active"));
        document
          .querySelector(`.nav-link[onclick*="${sectionId}"]`)
          ?.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", activateSection, { passive: true });
  window.addEventListener("resize", activateSection);
  activateSection();
});



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

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  lastScrollY = window.scrollY;
});

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  showToast(currentLang === 'en'
    ? 'Message sent! We will contact you shortly.'
    : 'Mensagem enviada! Entraremos em contacto brevemente.'
  );
  form.reset();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('current-year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();
});

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


document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const activateSection = () => {
    let scrollY = window.pageYOffset;

    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop - 120; // margem antes do header
      const sectionHeight = sec.offsetHeight;
      const sectionId = sec.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove("active"));
        document
          .querySelector(`.nav-link[onclick*="${sectionId}"]`)
          ?.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", activateSection);
  activateSection(); // executar ao carregar
});

