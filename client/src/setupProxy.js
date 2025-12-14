const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    app.use('/api',createProxyMiddleware({target:'http://192.168.0.34:8080',
        changeOrigin:true,proxyTimeout:600000,timeout:600000
    }))
}
