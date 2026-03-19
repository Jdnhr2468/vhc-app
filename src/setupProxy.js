const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  // Groq API
  app.use(
    '/api/groq',
    createProxyMiddleware({
      target: 'https://api.groq.com',
      changeOrigin: true,
      pathRewrite: { '^/api/groq': '' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Authorization', `Bearer ${process.env.REACT_APP_GROQ_API_KEY || ''}`);
        },
      },
    })
  );

};