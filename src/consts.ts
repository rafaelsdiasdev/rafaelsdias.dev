// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Domain configuration - easier to switch between domains
const IS_PRODUCTION = import.meta.env.PROD;
const USE_CUSTOM_DOMAIN = true; // Set to true when custom domain is ready

export const SITE_DOMAIN = USE_CUSTOM_DOMAIN 
  ? 'rafaelsdias.dev' 
  : 'rafaelsdiasdev.github.io/rafaelsdias.dev';

export const SITE_URL = USE_CUSTOM_DOMAIN 
  ? 'https://rafaelsdias.dev' 
  : 'https://rafaelsdiasdev.github.io/rafaelsdias.dev';

export const SITE_TITLE = 'rafaelsdias.dev';
export const SITE_DESCRIPTION = 'Technical Blog - Artigos sobre arquitetura de software, microsserviços e tecnologia.';
export const AUTHOR_NAME = 'Rafael Dias';
export const AUTHOR_BIO = 'Software Engineer especializado em arquiteturas distribuídas e microsserviços';
