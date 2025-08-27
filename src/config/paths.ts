// Configuration for application paths
// This handles the base path for GitHub Pages deployment

export const getBasePath = () => {
  // Check if we're on GitHub Pages by looking at the pathname
  // If the app is served from /accion-capabilities/, use that as base path
  const { pathname } = window.location;
  
  // In production build, always use the base path
  if (process.env.NODE_ENV === 'production') {
    return '/accion-capabilities';
  }
  
  // In development or if served from a subpath
  if (pathname.startsWith('/accion-capabilities')) {
    return '/accion-capabilities';
  }
  
  return '';
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