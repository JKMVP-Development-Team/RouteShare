const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Explicitly exclude the functions directory and its node_modules
config.resolver.blockList = [
  /functions\/.*/,
  /functions\/node_modules\/.*/,
  /.*\/functions\/.*/,  // Absolute paths
  /lib\/functions\/.*/,  // Compiled functions
];

// Don't watch the functions directory
config.watchFolders = [
  path.resolve(__dirname, 'app'),
  path.resolve(__dirname, 'assets'),
  path.resolve(__dirname, 'components'),
  path.resolve(__dirname, 'constants'),
  path.resolve(__dirname, 'hooks'),
  path.resolve(__dirname, 'services'),
];

module.exports = config;
