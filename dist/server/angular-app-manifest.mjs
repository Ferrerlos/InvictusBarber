
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
    'index.csr.html': {size: 16861, hash: '9fbd905f6f22217227afe883737dee7e1ca3f1fad5e166e53538a5292fe3c071', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 17155, hash: '075bc05ad60b1e779bb7aae0e8d88e9cadaaf95e0e7cfd8f0491d563034fb3a5', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'confirm/id1/index.html': {size: 20794, hash: '0b4ee40435a2d9a28cce4984a319ee3fa0c6b098e54815c2c632a5e3d13ce8f3', text: () => import('./assets-chunks/confirm_id1_index_html.mjs').then(m => m.default)},
    'confirm/id2/index.html': {size: 20794, hash: '0b4ee40435a2d9a28cce4984a319ee3fa0c6b098e54815c2c632a5e3d13ce8f3', text: () => import('./assets-chunks/confirm_id2_index_html.mjs').then(m => m.default)},
    'confirm/id3/index.html': {size: 20794, hash: '0b4ee40435a2d9a28cce4984a319ee3fa0c6b098e54815c2c632a5e3d13ce8f3', text: () => import('./assets-chunks/confirm_id3_index_html.mjs').then(m => m.default)},
    'index.html': {size: 45675, hash: 'f62850ae25476dfebb60ad8fb5a5f85e07c942b4fdd8282ccdc2c06747ea2997', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-ACUOTDKX.css': {size: 12309, hash: 'FRAE+ZSTbt8', text: () => import('./assets-chunks/styles-ACUOTDKX_css.mjs').then(m => m.default)}
  },
};
