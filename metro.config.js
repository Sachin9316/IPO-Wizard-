const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'mjs' to sourceExts for Redux Toolkit compatibility
config.resolver.sourceExts.push('mjs');

module.exports = config;
