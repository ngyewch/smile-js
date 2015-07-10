/* global window, ArrayBuffer, Uint8Array, Float32Array, Float64Array */

(function(Smile, undefined) {
  'use strict';

  var bitMask = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];

  Smile.Decoder = function() {};

  Smile.Decoder.decodeZigZag = function(value) {
    if (value < 0) {
      throw new Smile.SmileError("Illegal zigzag value");
    }
    if (value <= 2147483647) {
      if (value & 1) {
        return -(value >> 1) - 1;
      } else {
        return (value >> 1);
      }
    } else {
      if (value & 1) {
        return -(Math.floor(value / 2)) - 1;
      } else {
        return Math.floor(value / 2);
      }
    }
  };

  Smile.Decoder.decodeAscii = function(array) {
    return String.fromCharCode.apply(null, array);
  };

  /* utf.js - UTF-8 <=> UTF-16 convertion
   *
   * Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
   * Version: 1.0
   * LastModified: Dec 25 1999
   * This library is free.  You can redistribute it and/or modify it.
   *
   * http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
   */
  Smile.Decoder.decodeUtf8 = function(array) {
    var out = '',
      len = array.length,
      i = 0,
      c,
      char2,
      char3,
      msb4;
    while (i < len) {
      c = array[i++];
      msb4 = c >> 4;
      if ((msb4 >= 0) && (msb4 <= 7)) {
        // 0xxxxxxx
        out += String.fromCharCode(c);
      } else if ((msb4 >= 12) && (msb4 <= 13)) {
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
      } else if (msb4 === 14) {
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
      }
    }
    return out;
  };

  Smile.Decoder.decodeFloat32 = function(array) {
    var view = new Float32Array(array);
    return view[0];
  };

  Smile.Decoder.decodeFloat64 = function(array) {
    var view = new Float64Array(array);
    return view[0];
  };

  Smile.Decoder.decodeFixedLengthBigEndianEncodedBits = function(array, bits, adjustEndianness) {
    var inputView = new Uint8Array(array),
      output = new ArrayBuffer(Math.ceil(bits / 8)),
      outputView = new Uint8Array(output),
      iByte = 0,
      iBitsRemaining = bits % 7,
      oByte = 0,
      oBitsWritten = 0,
      currentInput = inputView[iByte],
      currentOutput = 0,
      bitsToWrite,
      oIndex;
    while (iByte < inputView.length) {
      bitsToWrite = Math.min(iBitsRemaining, (8 - oBitsWritten));
      currentOutput <<= bitsToWrite;
      currentOutput |= currentInput >> (iBitsRemaining - bitsToWrite);
      iBitsRemaining -= bitsToWrite;
      currentInput &= bitMask[iBitsRemaining];
      oBitsWritten += bitsToWrite;
      if (iBitsRemaining === 0) {
        iByte++;
        iBitsRemaining = 7;
        currentInput = inputView[iByte];
      }
      if (oBitsWritten === 8) {
        oIndex = (Smile.littleEndian && adjustEndianness) ? outputView.length - oByte - 1 : oByte;
        outputView[oIndex] = currentOutput;
        oByte++;
        oBitsWritten = 0;
        currentOutput = 0;
      }
    }
    if (oBitsWritten > 0) {
      currentOutput <<= (8 - oBitsWritten);
      oIndex = (Smile.littleEndian && adjustEndianness) ? outputView.length - oByte - 1 : oByte;
      outputView[oIndex] = currentOutput;
    }
    return output;
  };

}(window.Smile = window.Smile || {}));
