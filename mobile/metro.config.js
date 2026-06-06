const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, 'glb'];

config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;