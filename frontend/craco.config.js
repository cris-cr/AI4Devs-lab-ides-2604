module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        const existingPlugins =
          postcssLoaderOptions.postcssOptions?.plugins ?? [];
        postcssLoaderOptions.postcssOptions = {
          ...postcssLoaderOptions.postcssOptions,
          plugins: [require('tailwindcss'), ...existingPlugins],
        };
        return postcssLoaderOptions;
      },
    },
  },
};
