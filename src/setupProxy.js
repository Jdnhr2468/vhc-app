const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/claude',
    createProxyMiddleware({
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      pathRewrite: { '^/api/claude': '' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('anthropic-version', '2023-06-01');
          proxyReq.setHeader('x-api-key', process.env.REACT_APP_ANTHROPIC_KEY || '');
        },
      },
    })
  );
};