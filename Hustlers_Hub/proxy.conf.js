const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
    ? env.ASPNETCORE_URLS.split(';')[0]
    : 'https://hustlershub-g3cjffaea3axckg3.southafricanorth-01.azurewebsites.net/';

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
