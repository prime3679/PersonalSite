import { createCanonicalRedirectResponse } from './canonical-redirect.js';

export default {
  async fetch(request) {
    return createCanonicalRedirectResponse(request);
  },
};
