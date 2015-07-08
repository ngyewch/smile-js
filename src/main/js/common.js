/* global window, ArrayBuffer, DataView, Int16Array */

(function(Smile, undefined) {
  'use strict';

  Smile.littleEndian = (function() {
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    return (new Int16Array(buffer)[0] === 256);
  })();
}(window.Smile = window.Smile || {}));
