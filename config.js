var config = {};

config.site = {};
config.pages = {};
config.web = {};
config.site.name = process.env.SITE_NAME || 'EncryptoShare';
config.pages.title =  process.env.PAGE_TITLE || 'EncryptoShare';
config.web.port = process.env.WEB_PORT || 3000;

module.exports = config;