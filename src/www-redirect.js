export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'adrianlumley.co';
    return Response.redirect(url.toString(), 308);
  },
};
