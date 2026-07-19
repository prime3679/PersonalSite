import { handleCanonicalAssetRequest } from './canonical-redirect.js';

export default {
  async fetch(request, env) {
    return handleCanonicalAssetRequest(request, env);
  },
};
