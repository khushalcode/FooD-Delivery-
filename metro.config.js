const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing from project root with @/ (src) and @assets/ (assets)
const { resolve } = require('path');
const projectRoot = __dirname;
const srcRoot = resolve(projectRoot, 'src');
const assetsRoot = resolve(projectRoot, 'assets');

config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [
  resolve(projectRoot, 'node_modules'),
];

// Add @assets alias support
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  '@assets': assetsRoot,
};

module.exports = config;
