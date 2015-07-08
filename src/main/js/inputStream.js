/* global window, ArrayBuffer, Uint8Array */

(function (Smile, undefined) {
  'use strict';

  Smile.InputStream = function(data) {
    if (data instanceof Uint8Array) {
      this._view = data;
    } else if (data instanceof ArrayBuffer) {
      this._view = new Uint8Array(data);
    } else if (data.constructor === Array) {
      this._view = new Uint8Array(data);
    } else {
      throw new Smile.SmileError('Illegal argument (Uint8Array, ArrayBuffer, Array expected).');
    }
    this._index = 0;
  };

  Smile.InputStream.prototype.isEof = function() {
    return (this._index >= this._view.length);
  };

  Smile.InputStream.prototype.read = function() {
    if (this.isEof()) {
      throw new Smile.SmileError('End of input stream reached.');
    }
    var v = this._view[this._index];
    this._index++;
    return v;
  };

  Smile.InputStream.prototype.readArray = function(n) {
    if (this.isEof()) {
      throw new Smile.SmileError('End of input stream reached.');
    }
    var endIndex = Math.min(this._view.length, this._index + n);
    var array = this._view.subarray(this._index, endIndex);
    this._index = endIndex;
    return array;
  };

  Smile.InputStream.prototype.peek = function() {
    if (this.isEof()) {
      throw new Smile.SmileError('End of input stream reached.');
    }
    return this._view[this._index];
  };

  Smile.InputStream.prototype.skip = function(n) {
    if (this.isEof()) {
      throw new Smile.SmileError('End of input stream reached.');
    }
    if (n < 0) {
      throw new Smile.SmileError('Invalid skip amount.');
    }
    this._index += n;
  };
}(window.Smile = window.Smile || {}));
