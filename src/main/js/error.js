/* global window */

(function (Smile, undefined) {
  'use strict';

  Smile.SmileError = function(message) {
    this.name = 'SmileError';
    this.message = message;
  };

  Smile.SmileError.prototype = Object.create(Error.prototype);
  Smile.SmileError.prototype.constructor = Smile.SmileError;
}(window.Smile = window.Smile || {}));
