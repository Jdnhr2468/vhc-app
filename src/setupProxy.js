const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  // Grok API
  app.use(
    '/api/grok',
    createProxyMiddleware({
      target: 'https://api.x.ai',
      changeOrigin: true,
      pathRewrite: { '^/api/grok': '' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Authorization', `Bearer ${process.env.REACT_APP_GROK_API_KEY || ''}`);
        },
      },
    })
  );

};