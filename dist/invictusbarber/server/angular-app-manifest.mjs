
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/confirm/id1"
  },
  {
    "renderMode": 2,
    "route": "/confirm/id2"
  },
  {
    "renderMode": 2,
    "route": "/confirm/id3"
  },
  {
    "renderMode": 0,
    "route": "/confirm/*"
  }
],
  assets: {
    'index.csr.html': {size: 16861, hash: 'a53b56c2384c1f1d7b5becd0aa9411379433cc8088a40d3a3e656b8ccccf7bfc', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17155, hash: '8882219dc1147bb0990d7e1f11bca3d03ed90988ba299dc931a7673c43d67317', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'confirm/id1/index.html': {size: 20794, hash: 'f68d4285f3bad9207c5a77bf50cd65ea5bd6910588d18dfcf1522b7732026bcb', text: () => import('./assets-chunks/confirm_id1_index_html.mjs').then(m => m.default)},
    'confirm/id3/index.html': {size: 20794, hash: 'f68d4285f3bad9207c5a77bf50cd65ea5bd6910588d18dfcf1522b7732026bcb', text: () => import('./assets-chunks/confirm_id3_index_html.mjs').then(m => m.default)},
    'confirm/id2/index.html': {size: 20794, hash: 'f68d4285f3bad9207c5a77bf50cd65ea5bd6910588d18dfcf1522b7732026bcb', text: () => import('./assets-chunks/confirm_id2_index_html.mjs').then(m => m.default)},
    'index.html': {size: 153811, hash: 'd2203c75f9eb13fba553c11e2044140227888188a7f94537f60e40737ad7537b', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ACUOTDKX.css': {size: 12309, hash: 'FRAE+ZSTbt8', text: () => import('./assets-chunks/styles-ACUOTDKX_css.mjs').then(m => m.default)}
  },
};
