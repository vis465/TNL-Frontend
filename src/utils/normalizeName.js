/**
 * Normalizes a name for consistent matching
 * @param {string} name - The name to normalize
 * @returns {string} - Normalized lowercase name
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

export default normalizeName;
