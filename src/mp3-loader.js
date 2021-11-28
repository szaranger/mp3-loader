const path = require("path");
const fs = require('fs');

module.exports = function (source) {
  const options = this.getOptions();
  const logger = this.getLogger();
  const assetStats = fs.statSync(this.resourcePath);
  
  if (assetStats.size > options.maxSizeBytes) {
    logger.warn('Imported MP3 file is too large!');
  }

  const filename = path.basename(this.resourcePath);
  const assetInfo = { sourceFilename: filename };

  this.emitFile(filename, source, null, assetInfo);

  return `
    import React from 'react'
    export default function Player(props) {
      return <audio controls src="${filename}" />
    }
  `;
};

// Mark the loader as raw so that the emitted audio binary
// does not get processed in any way.
module.exports.raw = true;
