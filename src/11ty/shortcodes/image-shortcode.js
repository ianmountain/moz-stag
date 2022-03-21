const Image = require('@11ty/eleventy-img');
const path = require('path');

const ImageWidths = {
  ORIGINAL: null,
};

module.exports = async function (relativeSrc, alt, ...args) {
  if (alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${relativeSrc}`);
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
  // 37em is the md breakpoint in _config.scss
  let sizes =
    typeof args[0].sizes === 'undefined'
      ? '(min-width: 37em) 50vw, 100vw'
      : args[0].sizes;

  const { name: imgName, dir: imgDir } = path.parse(relativeSrc);
  const fullSrc = path.join('src', relativeSrc);

  let metadata = await Image(fullSrc, {
    widths: [ImageWidths.ORIGINAL, ...widths],
    formats: [...optimizedFormats, baseFormat],
    outputDir: path.join('dist', imgDir),
    urlPath: imgDir,
    // custom file name
    filenameFormat: (hash, _src, width, format) => {
      return `${imgName}-${hash}-${width}.${format}`;
    },
  });

  let lowSrc = metadata.png[0];
  let highSrc = metadata.png[metadata.png.length - 1];

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
        src="${lowSrc.url}"
        width="${highSrc.width}"
        height="${highSrc.height}"
        alt="${alt}"
        loading="${
          typeof args[0].loading === 'undefined' ? 'lazy' : args[0].loading
        }"
        decoding="async">
    </picture>`;
};
