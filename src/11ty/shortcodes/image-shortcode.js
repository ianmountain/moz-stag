const Image = require('@11ty/eleventy-img');

const ImageWidths = {
  ORIGINAL: null,
};

module.exports = async function (src, alt, ...args) {
  if (alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }

  // if image.widths aren't specified, use default values
  let widths =
    typeof args[0].widths === 'undefined' ? [400, 800, 1280] : args[0].widths;
  // if image.baseFormat isn't specified, use default values
  let baseFormat =
    typeof args[0].baseFormat === 'undefined' ? 'png' : args[0].baseFormat;
  // if image.optimizedFormats aren't specified, use default values
  let optimizedFormats =
    typeof args[0].optimizedFormats === 'undefined'
      ? ['avif', 'webp']
      : args[0].optimizedFormats;
  // if image.sizes aren't specified, use default value
  let sizes =
    typeof args[0].sizes === 'undefined'
      ? '(min-width: 37em) 50vw, 100vw'
      : args[0].sizes;

  let metadata = await Image(src, {
    widths: [ImageWidths.ORIGINAL, ...widths],
    formats: [...optimizedFormats, baseFormat],
    urlPath: '/images/',
    outputDir: './dist/images/',
  });

  let lowsrc = metadata.png[0];
  let highsrc = metadata.png[metadata.png.length - 1];

  return `<picture${
    // if image.styles are defined, include them in the html
    typeof args[0].styles === 'undefined'
      ? '>'
      : ' class="' + args[0].styles + '">'
  }
    ${Object.values(metadata)
      .map((imageFormat) => {
        return `  <source type="${
          imageFormat[0].sourceType
        }" srcset="${imageFormat
          .map((entry) => entry.srcset)
          .join(', ')}" sizes="${sizes}">`;
      })
      .join('\n')}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="${
          typeof args[0].loading === 'undefined' ? 'lazy' : args[0].loading
        }"
        decoding="async">
    </picture>`;
};
