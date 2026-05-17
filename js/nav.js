/* ════════════════════════════════════════════════════════
<<<<<<< HEAD
   IMAGEYANTRA — NAVIGATION COMPONENT v7
   Root-relative paths. Clean URLs (no .html).
   Call: Nav.init() after DOMContentLoaded
   Changes: Added Remove Background tool, fixed mobile
   dropdown centering, improved responsive layout.
=======
   IMAGEYANTRA — NAVIGATION COMPONENT v6
   Root-relative paths. Clean URLs (no .html).
   Call: Nav.init() after DOMContentLoaded
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
════════════════════════════════════════════════════════ */

const Nav = (function () {

  const IMAGE_TOOLS = [
<<<<<<< HEAD
    { slug: 'compress',   icon: compressIcon(),   label: 'Compress Image',    desc: 'Reduce file size' },
    { slug: 'resize',     icon: resizeIcon(),     label: 'Resize Image',      desc: 'Set exact dimensions' },
    { slug: 'crop',       icon: cropIcon(),       label: 'Crop Image',        desc: 'Trim any region' },
    { slug: 'rotate-flip',icon: rotateIcon(),     label: 'Rotate & Flip',     desc: 'Rotate or mirror' },
    { slug: 'resolution', icon: resolutionIcon(), label: 'Change Resolution', desc: '720p, 1080p, 4K' },
    { slug: 'remove-bg',  icon: removeBgIcon(),   label: 'Remove Background', desc: 'Transparent PNG' },
  ];

  const PDF_TOOLS = [
    { slug: 'image-to-pdf',  icon: imagePdfIcon(),    label: 'Image to PDF',        desc: 'Any image → PDF',      group: 'Convert' },
    { slug: 'merge-pdf',     icon: mergePdfIcon(),    label: 'Merge PDF',           desc: 'Combine PDF files',    group: 'Edit PDF' },
    { slug: 'arrange-pdf',   icon: arrangeIcon(),     label: 'Arrange Pages',       desc: 'Reorder PDF pages',    group: 'Edit PDF' },
    { slug: 'manage-pages',  icon: manageIcon(),      label: 'Add / Remove Pages',  desc: 'Insert or delete',     group: 'Edit PDF' },
    { slug: 'compress-pdf',  icon: compressPdfIcon(), label: 'Compress PDF',        desc: 'Reduce PDF size',      group: 'Edit PDF' },
=======
    { slug: 'compress', icon: compressIcon(), label: 'Compress Image', desc: 'Reduce file size' },
    { slug: 'resize', icon: resizeIcon(), label: 'Resize Image', desc: 'Set exact dimensions' },
    { slug: 'crop', icon: cropIcon(), label: 'Crop Image', desc: 'Trim any region' },
    { slug: 'rotate-flip', icon: rotateIcon(), label: 'Rotate & Flip', desc: 'Rotate or mirror' },
    { slug: 'resolution', icon: resolutionIcon(), label: 'Change Resolution', desc: '720p, 1080p, 4K' },
  ];

  const PDF_TOOLS = [
    { slug: 'image-to-pdf', icon: imagePdfIcon(), label: 'Image to PDF', desc: 'Any image → PDF', group: 'Convert' },
    { slug: 'merge-pdf', icon: mergePdfIcon(), label: 'Merge PDF', desc: 'Combine PDF files', group: 'Edit PDF' },
    { slug: 'arrange-pdf', icon: arrangeIcon(), label: 'Arrange Pages', desc: 'Reorder PDF pages', group: 'Edit PDF' },
    { slug: 'manage-pages', icon: manageIcon(), label: 'Add / Remove Pages', desc: 'Insert or delete', group: 'Edit PDF' },
    { slug: 'compress-pdf', icon: compressPdfIcon(), label: 'Compress PDF', desc: 'Reduce PDF size', group: 'Edit PDF' },
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
  ];

  function svgWrap(d, vb) { return `<svg width="16" height="16" viewBox="${vb || '0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`; }
  function compressPdfIcon() { return svgWrap('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>'); }
<<<<<<< HEAD
  function compressIcon()    { return svgWrap('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>'); }
  function resizeIcon()      { return svgWrap('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'); }
  function cropIcon()        { return svgWrap('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'); }
  function rotateIcon()      { return svgWrap('<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>'); }
  function resolutionIcon()  { return svgWrap('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'); }
  function removeBgIcon()    {return svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="15" y1="9" x2="21" y2="3" stroke-dasharray="3 2"/>');}  function imagePdfIcon()    { return svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'); }
  function mergePdfIcon()    {return svgWrap('<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/>');}  function arrangeIcon()     { return svgWrap('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'); }
  function manageIcon()      { return svgWrap('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>'); }
  function pdfNavIcon()      { return svgWrap('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'); }
  function imageNavIcon()    { return svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'); }
  function blogIcon()        { return svgWrap('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'); }
  function aboutIcon()       { return svgWrap('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'); }
  function contactIcon()     { return svgWrap('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'); }
  function shieldIcon()      { return svgWrap('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'); }
  function mailIcon()        { return svgWrap('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'); }
  function menuIcon_svg()    { return svgWrap('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'); }
  function closeIcon_svg()   { return svgWrap('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'); }
=======
  function compressIcon() { return svgWrap('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>'); }
  function resizeIcon() { return svgWrap('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>'); }
  function cropIcon() { return svgWrap('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'); } function rotateIcon() { return svgWrap('<path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38"/>'); }
  function resolutionIcon() { return svgWrap('<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'); }
  function imagePdfIcon() { return svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'); }
  function mergePdfIcon() { return svgWrap('<path d="M8 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M18 2h4v4"/><path d="M10 14L22 2"/>'); }
  function arrangeIcon() { return svgWrap('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'); }
  function manageIcon() { return svgWrap('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>'); }
  function pdfNavIcon() { return svgWrap('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'); }
  function imageNavIcon() { return svgWrap('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'); }
  function blogIcon() { return svgWrap('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'); }
  function aboutIcon() { return svgWrap('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'); }
  function contactIcon() { return svgWrap('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'); }
  function shieldIcon() { return svgWrap('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>'); } function mailIcon() { return svgWrap('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'); }
  function menuIcon_svg() { return svgWrap('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'); }
  function closeIcon_svg() { return svgWrap('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'); }
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1

  function toolPath(slug) { return '/tools/' + slug + '/'; }

  function getPathSegments() {
    return window.location.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  }

  function buildDropdownMenu(tools) {
    let groups = {};
    tools.forEach(t => {
      const g = t.group || 'Tools';
      if (!groups[g]) groups[g] = [];
      groups[g].push(t);
    });
    let html = '';
    Object.keys(groups).forEach((group, i) => {
      if (i > 0) html += `<div class="nav-dropdown-divider" role="separator"></div>`;
      html += `<div class="nav-dropdown-label">${group}</div>`;
      groups[group].forEach(t => {
        html += `<a href="${toolPath(t.slug)}" class="nav-dropdown-item" role="menuitem" data-nav="${t.slug}">${t.icon}<span>${t.label}</span></a>`;
      });
    });
    return html;
  }

  function buildNavHTML() {
    return `
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="/" class="nav-logo" id="navLogo" aria-label="ImageYantra Home">
      <img src="/assets/images/logo.png" alt="ImageYantra" class="nav-logo-img" width="36" height="36" loading="eager" onerror="this.style.display='none'">
      <span class="nav-logo-text">Image<em>Yantra</em></span>
    </a>
    <span class="nav-tagline">Free Online Image &amp; PDF Tools</span>
    <div class="nav-links" role="list">
      <div class="nav-dropdown" id="imgDropdown" role="listitem">
        <button class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false" aria-controls="imgMenu" id="imgDropBtn">
          ${imageNavIcon()} Image Tools <span class="nav-chevron" aria-hidden="true">&#9660;</span>
        </button>
        <div class="nav-dropdown-menu" id="imgMenu" role="menu" aria-labelledby="imgDropBtn">
          <div class="nav-dropdown-label">Edit &amp; Transform</div>
          ${IMAGE_TOOLS.map(t => `<a href="${toolPath(t.slug)}" class="nav-dropdown-item" role="menuitem" data-nav="${t.slug}">${t.icon}<span>${t.label}</span></a>`).join('')}
        </div>
      </div>
      <div class="nav-dropdown" id="pdfDropdown" role="listitem">
        <button class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false" aria-controls="pdfMenu" id="pdfDropBtn">
          ${pdfNavIcon()} PDF Tools <span class="nav-chevron" aria-hidden="true">&#9660;</span>
        </button>
        <div class="nav-dropdown-menu" id="pdfMenu" role="menu" aria-labelledby="pdfDropBtn">
          ${buildDropdownMenu(PDF_TOOLS)}
        </div>
      </div>
      <a href="/blog/" class="nav-btn" role="listitem" data-nav="blog">${blogIcon()}Blog</a>
      <a href="/about/" class="nav-btn" role="listitem" data-nav="about">${aboutIcon()}About</a>
      <a href="/contact/" class="nav-btn" role="listitem" data-nav="contact">${contactIcon()}Contact</a>
    </div>
    <button class="nav-mobile-toggle" id="navMobileBtn" aria-label="Open menu" aria-expanded="false" aria-controls="navDrawer">
      <span id="navMenuIcon">${menuIcon_svg()}</span>
    </button>
  </div>
</nav>
<div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
<nav class="nav-drawer" id="navDrawer" aria-label="Mobile navigation" aria-hidden="true">
  <div class="nav-drawer-section">Image Tools</div>
  ${IMAGE_TOOLS.map(t => `<a href="${toolPath(t.slug)}" class="nav-drawer-item" data-nav="${t.slug}">${t.icon}${t.label}</a>`).join('')}
  <div class="nav-drawer-section">PDF Tools</div>
  ${PDF_TOOLS.map(t => `<a href="${toolPath(t.slug)}" class="nav-drawer-item" data-nav="${t.slug}">${t.icon}${t.label}</a>`).join('')}
  <div class="nav-drawer-section">More</div>
  <a href="/blog/" class="nav-drawer-item" data-nav="blog">${blogIcon()}Blog</a>
  <a href="/about/" class="nav-drawer-item" data-nav="about">${aboutIcon()}About</a>
  <a href="/contact/" class="nav-drawer-item" data-nav="contact">${contactIcon()}Contact</a>
  <a href="/privacy-policy/" class="nav-drawer-item">${shieldIcon()}Privacy Policy</a>
</nav>`;
  }

  function buildFooterHTML() {
    return `
<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <img src="/assets/images/logo.png" alt="ImageYantra" width="32" height="32" loading="lazy" onerror="this.style.display='none'">
        <span class="footer-logo-text">Image<em>Yantra</em></span>
      </div>
      <p class="footer-tagline">Free, fast, and private online image &amp; PDF tools — everything runs in your browser. No files are ever uploaded to any server.</p>
      <div class="footer-privacy-note" role="note">
        ${shieldIcon()}
        <span>100% client-side processing. Your files never leave your device.</span>
      </div>
      <div style="margin-top:var(--sp-4);display:flex;flex-direction:column;gap:var(--sp-2)">
        <a href="mailto:contact@imageyantra.in" class="footer-link">${mailIcon()}<span>contact@imageyantra.in</span></a>
        <a href="mailto:business@imageyantra.in" class="footer-link">${mailIcon()}<span>business@imageyantra.in</span></a>
      </div>
    </div>
    <div>
      <div class="footer-col-title">Image Tools</div>
      <nav class="footer-links" aria-label="Image tools">
        <a href="/tools/compress/" class="footer-link">${compressIcon()}Compress Image</a>
        <a href="/tools/resize/" class="footer-link">${resizeIcon()}Resize Image</a>
        <a href="/tools/crop/" class="footer-link">${cropIcon()}Crop Image</a>
        <a href="/tools/rotate-flip/" class="footer-link">${rotateIcon()}Rotate &amp; Flip</a>
        <a href="/tools/resolution/" class="footer-link">${resolutionIcon()}Change Resolution</a>
<<<<<<< HEAD
        <a href="/tools/remove-bg/" class="footer-link">${removeBgIcon()}Remove Background</a>
=======
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
      </nav>
    </div>
    <div>
      <div class="footer-col-title">PDF Tools</div>
      <nav class="footer-links" aria-label="PDF tools">
        <a href="/tools/image-to-pdf/" class="footer-link">${imagePdfIcon()}Image to PDF</a>
        <a href="/tools/merge-pdf/" class="footer-link">${mergePdfIcon()}Merge PDF</a>
        <a href="/tools/arrange-pdf/" class="footer-link">${arrangeIcon()}Arrange Pages</a>
        <a href="/tools/manage-pages/" class="footer-link">${manageIcon()}Add / Remove Pages</a>
        <a href="/tools/compress-pdf/" class="footer-link">${compressPdfIcon()}Compress PDF</a>
      </nav>
    </div>
    <div>
      <div class="footer-col-title">Company</div>
      <nav class="footer-links" aria-label="Company links">
        <a href="/about/" class="footer-link">${aboutIcon()}About Us</a>
        <a href="/blog/" class="footer-link">${blogIcon()}Blog</a>
        <a href="/contact/" class="footer-link">${contactIcon()}Contact</a>
        <a href="/privacy-policy/" class="footer-link">${shieldIcon()}Privacy Policy</a>
        <a href="/terms-of-use/" class="footer-link">${aboutIcon()}Terms of Use</a>
      </nav>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">© ${new Date().getFullYear()} ImageYantra. All rights reserved.</div>
    <div class="footer-bottom-links">
      <a href="/privacy-policy/" class="footer-bottom-link">Privacy</a>
      <a href="/terms-of-use/" class="footer-bottom-link">Terms</a>
      <a href="/contact/" class="footer-bottom-link">Contact</a>
    </div>
  </div>
</footer>
<div id="toast" role="status" aria-live="polite"></div>`;
  }

  function init() {
    document.body.insertAdjacentHTML('afterbegin', buildNavHTML());
    const logo = document.getElementById('navLogo');
    if (logo) {
      logo.addEventListener('click', function (e) {
        if (window.location.pathname === '/') { e.preventDefault(); window.location.reload(); }
      });
    }
    setupDropdowns();
    setupMobile();
    highlightActive();
    document.body.insertAdjacentHTML('beforeend', buildFooterHTML());
  }

  function setupDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(wrap => {
<<<<<<< HEAD
      const btn   = wrap.querySelector('.nav-dropdown-btn');
      const menu  = wrap.querySelector('.nav-dropdown-menu');

=======
      const btn = wrap.querySelector('.nav-dropdown-btn');
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrap.classList.contains('open');
        closeAllDropdowns();
<<<<<<< HEAD
        if (!isOpen) {
          openDropdown(wrap, btn);
          // Mobile centering: reposition so menu is always fully visible
          if (window.innerWidth < 900) {
            repositionDropdownMobile(menu);
          }
        }
      });

=======
        if (!isOpen) openDropdown(wrap, btn);
      });
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
        if (e.key === 'ArrowDown') { e.preventDefault(); const f = wrap.querySelector('.nav-dropdown-item'); if (f) f.focus(); }
      });
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAllDropdowns(); btn.focus(); } });
    });
    document.addEventListener('click', closeAllDropdowns);
  }

<<<<<<< HEAD
  /**
   * On mobile, snap dropdown so it doesn't overflow viewport edges.
   * Centers under the button and clamps to viewport width.
   */
  function repositionDropdownMobile(menu) {
    if (!menu) return;
    // Reset any previous inline positioning
    menu.style.left   = '';
    menu.style.right  = '';
    menu.style.transform = '';

    requestAnimationFrame(() => {
      const rect = menu.getBoundingClientRect();
      const vw   = window.innerWidth;
      const pad  = 12; // screen-edge padding

      if (rect.left < pad) {
        const shift = pad - rect.left;
        menu.style.left = (parseFloat(getComputedStyle(menu).left || 0) + shift) + 'px';
      } else if (rect.right > vw - pad) {
        const overflow = rect.right - (vw - pad);
        const curLeft  = parseFloat(getComputedStyle(menu).left || 0);
        menu.style.left = Math.max(pad, curLeft - overflow) + 'px';
      }
    });
  }

=======
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
  function openDropdown(wrap, btn) { wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown.open').forEach(w => {
      w.classList.remove('open');
      const b = w.querySelector('.nav-dropdown-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
<<<<<<< HEAD
      // Reset mobile positioning
      const m = w.querySelector('.nav-dropdown-menu');
      if (m) { m.style.left = ''; m.style.right = ''; m.style.transform = ''; }
=======
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
    });
  }

  function setupMobile() {
<<<<<<< HEAD
    const btn      = document.getElementById('navMobileBtn');
    const drawer   = document.getElementById('navDrawer');
=======
    const btn = document.getElementById('navMobileBtn');
    const drawer = document.getElementById('navDrawer');
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
    const backdrop = document.getElementById('navBackdrop');
    const iconSpan = document.getElementById('navMenuIcon');
    if (!btn || !drawer) return;
    function openDrawer() {
<<<<<<< HEAD
      drawer.classList.add('open');   drawer.setAttribute('aria-hidden', 'false');
=======
      drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
      backdrop.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
      if (iconSpan) iconSpan.innerHTML = closeIcon_svg();
      document.body.style.overflow = 'hidden';
    }
    function doClose() {
<<<<<<< HEAD
      drawer.classList.remove('open');   drawer.setAttribute('aria-hidden', 'true');
=======
      drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
      backdrop.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      if (iconSpan) iconSpan.innerHTML = menuIcon_svg();
      document.body.style.overflow = '';
    }
    btn.addEventListener('click', () => drawer.classList.contains('open') ? doClose() : openDrawer());
    backdrop.addEventListener('click', doClose);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', doClose));
  }

  function highlightActive() {
    const segs = window.location.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
<<<<<<< HEAD
    const top  = segs[0] || '';
=======
    const top = segs[0] || '';
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
    const slug = segs[segs.length - 1] || '';
    document.querySelectorAll('[data-nav]').forEach(el => {
      const nav = el.dataset.nav;
      if (nav === slug || (nav === 'blog' && top === 'blog') ||
<<<<<<< HEAD
          (nav === 'about' && top === 'about') || (nav === 'contact' && top === 'contact')) {
=======
        (nav === 'about' && top === 'about') || (nav === 'contact' && top === 'contact')) {
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
        el.classList.add('active');
      }
    });
    if (top === 'tools') {
      IMAGE_TOOLS.forEach(t => { if (t.slug === slug) document.getElementById('imgDropBtn')?.classList.add('active'); });
<<<<<<< HEAD
      PDF_TOOLS.forEach(t =>   { if (t.slug === slug) document.getElementById('pdfDropBtn')?.classList.add('active'); });
=======
      PDF_TOOLS.forEach(t => { if (t.slug === slug) document.getElementById('pdfDropBtn')?.classList.add('active'); });
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
    }
  }

  return { init };
<<<<<<< HEAD
})();
=======
})();
>>>>>>> 9d45cb1bbc6e0bb62366572f8a921b4c37a302f1
