module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            '@components': './src/components',
            '@store': './src/store',
            '@lib': './src/lib',
            '@types': './src/types',
            '@screens': './src/screens',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
