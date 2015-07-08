/* global window */

(function(Smile, undefined) {
  'use strict';

  var bitMask = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];
  var shiftMultiplier = [1, 2, 4, 8, 16, 32, 64, 128];

  Smile.DecoderStream = function(inputStream) {
    this._inputStream = inputStream;
  };

  Smile.DecoderStream.prototype.isEof = function() {
    return this._inputStream.isEof();
  };

  Smile.DecoderStream.prototype.read = function() {
    return this._inputStream.read();
  };

  Smile.DecoderStream.prototype.peek = function() {
    return this._inputStream.peek();
  };

  Smile.DecoderStream.prototype.readUnsignedVint = function() {
    var value = 0,
      bits = 0;

    function safeLeftShift(n, shift) {
        if ((bits + shift) < 32) {
          value <<= shift;
          value |= n & bitMask[shift];
        } else {
          value *= shiftMultiplier[shift];
          value += n & bitMask[shift];
        }
        bits += shift;
    }

    while (true) {
      var n = this._inputStream.read();
      if (n & 0x80) {
        safeLeftShift(n, 6);
        return value;
      } else {
        safeLeftShift(n, 7);
      }
    }
  };

  Smile.DecoderStream.prototype.readSignedVint = function() {
    return Smile.Decoder.decodeZigZag(this.readUnsignedVint());
  };

  Smile.DecoderStream.prototype.readAscii = function(len) {
    return Smile.Decoder.decodeAscii(this._inputStream.readArray(len));
  };

  Smile.DecoderStream.prototype.readUtf8 = function(len) {
    return Smile.Decoder.decodeUtf8(this._inputStream.readArray(len));
  };

  Smile.DecoderStream.prototype.readFloat32 = function() {
    return Smile.Decoder.decodeFloat32(this.readFixedLengthBigEndianEncodedBits(32, true));
  };

  Smile.DecoderStream.prototype.readFloat64 = function() {
    return Smile.Decoder.decodeFloat64(this.readFixedLengthBigEndianEncodedBits(64, true));
  };

  Smile.DecoderStream.prototype.readFixedLengthBigEndianEncodedBits = function(bits, adjustEndianness) {
    var array = this._inputStream.readArray(Math.ceil(bits / 7));
    return Smile.Decoder.decodeFixedLengthBigEndianEncodedBits(array, bits, adjustEndianness);
  };
}(window.Smile = window.Smile || {}));
