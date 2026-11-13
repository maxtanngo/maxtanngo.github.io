(() => {
 const header = document.querySelector('.maxngo-header');
 if (!header) return;
 const toggle = header.querySelector('.maxngo-menu-toggle');
 const menu = header.querySelector('.maxngo-menu');
 const group = header.querySelector('.maxngo-group');
 function closeMenu() {
  group.open = false;
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
 }
 toggle.addEventListener('click', () => {
  if (menu.classList.contains('is-open')) closeMenu();
  else {
   menu.classList.add('is-open');
   toggle.setAttribute('aria-expanded', 'true');
   menu.querySelector('a').focus();
  }
 });
 document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
 });
 header.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (group.open) {
   group.open = false;
   group.querySelector('summary').focus();
  } else if (menu.classList.contains('is-open')) {
   closeMenu();
   toggle.focus();
  }
 });
 menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
 });
 header.dataset.ready = '';
})();
