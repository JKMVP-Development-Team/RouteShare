const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const functionsDir = path.resolve(__dirname, 'functions');
const functionsDirPattern = new RegExp(
  `^${escapeRegExp(functionsDir).replace(/\\\\/g, '[\\\\/]')}[\\\\/].*`
);

config.resolver.blockList = [functionsDirPattern];

module.exports = config;

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
