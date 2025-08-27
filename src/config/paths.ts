// Configuration for application paths
// This handles the base path for GitHub Pages deployment

export const getBasePath = () => {
  // In production (GitHub Pages), use the homepage path from package.json
  // In development, use root path
  return process.env.NODE_ENV === 'production' ? '/accion-capabilities' : '';
};

export const getDataPath = (path: string) => {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
};

export const getContentPath = (path: string) => {
  return getDataPath(path);
};