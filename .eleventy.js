const sortByDisplayOrder = require('./src/11ty/utils/sort-by-display-order.js');
const eleventyImage = require('./src/11ty/shortcodes/image-shortcode-copy.js');
const CleanCSS = require('clean-css');
const { minify } = require('terser');
// Transforms
const htmlMinTransform = require('./src/11ty/transforms/html-min-transforms.js');

// Create a helpful production flag
const isProduction = process.env.NODE_ENV === 'production';

module.exports = (config) => {
  // Only minify HTML if we are in production because it slows builds _right_ down
  if (isProduction) {
    config.addTransform('htmlmin', htmlMinTransform);
  }

  // Add shortcode for creating html <picture> elements
  config.addNunjucksAsyncShortcode('image', eleventyImage);
  config.addLiquidShortcode('image', eleventyImage);
  config.addJavaScriptFunction('image', eleventyImage);

  // Add filters
  config.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
  config.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error('Terser error: ', err);
      // Fail gracefully.
      callback(null, code);
    }
  });

  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('src/images/meta');

  // Returns aleTrail, sorted by display order
  config.addCollection('aleTrail', (collection) => {
    return sortByDisplayOrder(
      collection.getFilteredByGlob('./src/ale-trail/*.md')
    );
  });

  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  config.setUseGitIgnore(false);

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
