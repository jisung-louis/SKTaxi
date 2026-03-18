const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {resolve} = require('metro-resolver');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('.')) {
        try {
          return resolve(context, `${moduleName}.local`, platform);
        } catch (_error) {
          // Fallback to the tracked default module when no local override exists.
        }
      }

      return resolve(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
