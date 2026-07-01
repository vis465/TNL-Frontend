const FAVORITES_KEY = 'admin-nav-favorites';
const RECENTS_KEY = 'admin-nav-recents';
const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';
const SECTIONS_COLLAPSED_KEY = 'admin-sidebar-sections-collapsed';
const MAX_RECENTS = 8;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminFavorites() {
  const current = readJson(FAVORITES_KEY, null);
  if (current) return current;
  const legacy = readJson('admin-sidebar-favorites', []);
  if (legacy.length) writeJson(FAVORITES_KEY, legacy);
  return legacy;
}

export function toggleAdminFavorite(path) {
  const favorites = getAdminFavorites();
  const next = favorites.includes(path)
    ? favorites.filter((p) => p !== path)
    : [...favorites, path];
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function isAdminFavorite(path) {
  return getAdminFavorites().includes(path);
}

export function getAdminRecents() {
  return readJson(RECENTS_KEY, []);
}

export function recordAdminRecent(path) {
  if (!path || !path.startsWith('/admin')) return getAdminRecents();
  const recents = getAdminRecents().filter((p) => p !== path);
  recents.unshift(path);
  writeJson(RECENTS_KEY, recents.slice(0, MAX_RECENTS));
  return recents.slice(0, MAX_RECENTS);
}

export function getSidebarCollapsed() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? 'true' : 'false');
}

export function getCollapsedSections() {
  return readJson(SECTIONS_COLLAPSED_KEY, {});
}

export function toggleSectionCollapsed(sectionId) {
  const collapsed = getCollapsedSections();
  collapsed[sectionId] = !collapsed[sectionId];
  writeJson(SECTIONS_COLLAPSED_KEY, collapsed);
  return collapsed;
}

export function isSectionCollapsed(sectionId) {
  return Boolean(getCollapsedSections()[sectionId]);
}
