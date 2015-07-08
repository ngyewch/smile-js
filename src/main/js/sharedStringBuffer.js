/* global window */

(function (Smile, undefined) {
  'use strict';

  Smile.SharedStringBuffer = function(enabled, maxStrings) {
    this._enabled = enabled;
    this._maxStrings = maxStrings;
    this._strings = [];
  };

  Smile.SharedStringBuffer.prototype.addString = function(s) {
    if (!this._enabled) {
      return s;
    }
    if (this._strings.length >= this._maxStrings) {
      this._strings.length = 0;
    }
    this._strings.push(s);
    return s;
  };

  Smile.SharedStringBuffer.prototype.getString = function(index) {
    if (!this._enabled) {
      throw new Smile.SmileError('Shared strings are not enabled.');
    }
    if (index >= this._strings.length) {
      throw new Smile.SmileError('Shared string reference out of range.');
    }
    return this._strings[index];
  };
}(window.Smile = window.Smile || {}));
