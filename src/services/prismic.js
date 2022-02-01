import Prismic from '@prismicio/client';

export function getPrismicClient(req) {
  const prismic = Prismic.client(process.env.REACT_APP_PRISMIC_API_ENDPONT, {
    req,
    accessToken: process.env.REACT_APP_PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
