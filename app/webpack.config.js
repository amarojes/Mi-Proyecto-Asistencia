const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Workaround for expo-sqlite compatibility issue on the web
  config.resolve.alias['expo-sqlite'] = require.resolve('expo-sqlite/build/SQLExpo.web.js');
  return config;
};
