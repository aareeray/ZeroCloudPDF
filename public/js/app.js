/**
 * Application Bootstrap & Client-Side SPA Router for A Thousand Tools
 */

import { TOOLS, CATEGORIES, searchTools, getToolsByCategory, getToolById } from './catalog.js';
import { renderToolsGrid, renderCategoryPills, setupQuickSwitcher, openToolModal, closeToolModal, showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme
  initTheme();

  // 2. Setup Quick Switcher (Ctrl+K)
  setupQuickSwitcher();

  // 3. Setup Route Listener & Initial Route Dispatch
  window.addEventListener('popstate', handleRoute);
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // 4. Intercept internal anchor clicks for instant SPA routing
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href && href.startsWith('/tools/')) {
      e.preventDefault();
      navigateTo(href);
    } else if (href === '/' || href === '/tools') {
      e.preventDefault();
      navigateTo(href);
    }
  });

  // 5. Header Category Shortcut clicks
  document.querySelectorAll('[data-category-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = link.getAttribute('data-category-target');
      if (window.location.pathname.startsWith('/tools/') && window.location.pathname !== '/tools/') {
        navigateTo('/tools/');
      }
      setTimeout(() => {
        renderCategoryPills(targetCat);
        renderToolsGrid(getToolsByCategory(targetCat));
        document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
  });

  console.log(`🚀 A Thousand Tools initialized with all ${TOOLS.length} client-side tools!`);
});

// Navigation helper
export function navigateTo(url) {
  window.history.pushState({}, '', url);
  handleRoute();
}

// Router
function handleRoute() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const hash = window.location.hash.replace(/^#\/?/, '');

  // Case 1: Specific tool via path (e.g. /tools/merge or /tools/compress)
  if (pathname.startsWith('/tools/')) {
    const slug = pathname.replace('/tools/', '');
    const tool = getToolById(slug);
    if (tool) {
      document.title = `${tool.name} - 100% Private & Local | A Thousand Tools`;
      openToolModal(tool.id);
      return;
    }
  }

  // Case 2: Tools directory (/tools)
  if (pathname === '/tools') {
    document.title = 'All PDF & Image Tools - Directory | A Thousand Tools';
    closeToolModal();
    renderDirectoryView();
    return;
  }

  // Case 3: Specific tool via hash (#merge)
  if (hash) {
    const tool = getToolById(hash);
    if (tool) {
      document.title = `${tool.name} - 100% Private & Local | A Thousand Tools`;
      openToolModal(tool.id);
      return;
    }
  }

  // Case 4: Default Homepage (/)
  document.title = 'A Thousand Tools — 100% Private, Client-Side All-In-One PDF & Image Suite';
  closeToolModal();
  renderHomeView();
}

// Render Homepage View
function renderHomeView() {
  const heroSection = document.getElementById('hero-section');
  if (heroSection) heroSection.style.display = 'block';

  renderCategoryPills('all');
  renderToolsGrid(TOOLS);
  initSearch();
}

// Render Directory View (Matching https://athousandtools.in/tools)
function renderDirectoryView() {
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.innerHTML = `
      <div class="directory-breadcrumbs" style="margin-bottom: 16px; font-size: 0.9rem; color: var(--text-muted);">
        <a href="/" style="color: var(--accent-primary);">Home</a> &rsaquo; <span>All Tools Directory</span>
      </div>
      <h1 class="hero-title" style="font-size: clamp(2rem, 4vw, 3rem);">All PDF &amp; Image Tools</h1>
      <p class="hero-subtitle">
        A complete suite of ${TOOLS.length} private, local-first tools for working with PDFs and images. Every tool processes files entirely inside your browser - nothing is uploaded.
      </p>
      <div class="search-bar-wrapper">
        <span class="search-icon-inside">🔍</span>
        <input 
          type="text" 
          id="hero-search-input" 
          class="search-input-box" 
          placeholder="Filter any of the ${TOOLS.length} tools..." 
          aria-label="Filter tools"
          autocomplete="off"
        />
      </div>
      <div class="search-result-count" id="search-result-count"></div>
    `;
    heroSection.style.display = 'block';
  }

  renderCategoryPills('all');
  renderToolsGrid(TOOLS);
  initSearch();
}

// Theme Management (Dark & Light)
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('thousandtools.theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('thousandtools.theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} mode`, 'info', 1500);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Live Search Input with debounce
function initSearch() {
  const searchInput = document.getElementById('hero-search-input');
  const searchCount = document.getElementById('search-result-count');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const matches = searchTools(query);
    renderToolsGrid(matches);

    if (searchCount) {
      searchCount.textContent = query.trim() ? `${matches.length} tool${matches.length === 1 ? '' : 's'} matching "${query}"` : '';
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      renderToolsGrid(TOOLS);
      if (searchCount) searchCount.textContent = '';
    }
  });
}
