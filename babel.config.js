module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: { '@': './src' },
        },
      ],
      // NOTE: react-native-reanimated was removed in favour of React Native's
      // built-in Animated + PanResponder, which work with Expo Go out of the
      // box and require no native build step.
    ],
  };
};
