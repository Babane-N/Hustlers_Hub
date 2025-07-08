const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'https://localhost:7018';

module.exports = [
  {
    context: [
      "/api",
    ],
    target: target,
    secure: false,
    changeOrigin: true
  }
];
