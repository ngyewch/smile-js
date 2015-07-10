/* global window, ArrayBuffer, DataView, Int16Array */

(function(Smile, undefined) {
  'use strict';

  Smile.littleEndian = (function() {
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    return (new Int16Array(buffer)[0] === 256);
  })();
}(window.Smile = window.Smile || {}));

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
    var out, i, len, c, char2, char3;

    out = '';
    len = array.length;
    i = 0;
    while (i < len) {
      c = array[i++];
      switch (c >> 4) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12:
        case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
          break;
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

/* global window */

(function(Smile, undefined) {
  'use strict';

  Smile.Parser = {};

  function ParserContext() {
    var sharedPropertyName = false,
      sharedStringValue = false,
      rawBinary = false,
      version = 0,
      sharedPropertyNames,
      sharedStringValues,
      decoderStream;

    function parseSimpleLiteralValue(token, decoderStream) {
      if (token === 0x20) { // empty string
        return '';
      } else if (token === 0x21) { // null
        return null;
      } else if (token === 0x22) { // false
        return false;
      } else if (token === 0x23) { // true
        return true;
      } else if (token === 0x24) { // 32-bit integer; zigzag encoded, 1 - 5 data bytes
        return decoderStream.readSignedVint();
      } else if (token === 0x25) { // 64-bit integer; zigzag encoded, 5 - 10 data bytes
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0x26) { // BigInteger
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0x28) { // 32-bit float
        return decoderStream.readFloat32();
      } else if (token === 0x29) { // 64-bit double
        return decoderStream.readFloat64();
      } else if (token === 0x2a) { // BigDecimal
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else {
        throw new Smile.SmileError('Invalid value token 0x' + token.toString(16));
      }
    }

    function parseBinaryLongTextStructureValues(token, decoderStream) {
      if (token === 0xe0) { // Long (variable length) ASCII text
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0xe4) { // Long (variable length) Unicode text
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0xe8) { // Binary, 7-bit encoded
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0xec) { // Shared String reference, long
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else if (token === 0xf8) { // START_ARRAY
        var array = [];
        while (decoderStream.peek() !== 0xf9) { // END_ARRAY
          array.push(parseValue(decoderStream));
        }
        decoderStream.read(); // consume END_ARRAY
        return array;
      } else if (token === 0xfa) { // START_OBJECT
        var object = {};
        while (decoderStream.peek() !== 0xfb) { // END_OBJECT
          var key = parseKey(decoderStream);
          var value = parseValue(decoderStream);
          object[key] = value;
        }
        decoderStream.read(); // consume END_OBJECT
        return object;
      } else if (token === 0xfd) { // Binary (raw)
        // TODO
        throw new Smile.SmileError('Value token 0x' + token.toString(16) + ' not supported yet.');
      } else {
        throw new Smile.SmileError('Invalid value token 0x' + token.toString(16));
      }
    }

    function parseValue(decoderStream) {
      var token = decoderStream.read(),
        tokenClass = token >> 5,
        s;
      if (tokenClass === 0) { // Short Shared Value String reference (single byte)
        return sharedStringValues.getString(token & 0x1f);
      } else if (tokenClass === 1) { // Simple literals, numbers
        parseSimpleLiteralValue(token, decoderStream);
      } else if (tokenClass === 2) { // Tiny ASCII (1 - 32 bytes == chars)
        s = decoderStream.readAscii((token & 0x1f) + 1);
        sharedStringValues.addString(s);
        return s;
      } else if (tokenClass === 3) { // Short ASCII (33 - 64 bytes == chars)
        s = decoderStream.readAscii((token & 0x1f) + 33);
        sharedStringValues.addString(s);
        return s;
      } else if (tokenClass === 4) { // Tiny Unicode (2 - 33 bytes; <= 33 characters)
        s = decoderStream.readUtf8((token & 0x1f) + 2);
        sharedStringValues.addString(s);
        return s;
      } else if (tokenClass === 5) { // Short Unicode (34 - 64 bytes; <= 64 characters)
        s = decoderStream.readUtf8((token & 0x1f) + 34);
        sharedStringValues.addString(s);
        return s;
      } else if (tokenClass === 6) { // Small integers (single byte)
        return Smile.Decoder.decodeZigZag(token & 0x1f);
      } else if (tokenClass === 7) { // Binary / Long text / structure markers
        parseBinaryLongTextStructureValues(token, decoderStream);
      }
    }

    function parseKey(decoderStream) {
      var token = decoderStream.read(),
        reference,
        s;
      if (token === 0x20) { // Special constant name '' (empty String)
        return '';
      } else if ((token >= 0x30) && (token <= 0x33)) { // 'Long' shared key name reference (2 byte token)
        reference = ((token & 0x03) << 8) | decoderStream.read();
        if (reference < 64) {
          throw new Smile.SmileError('Invalid long shared key name reference.');
        }
        return sharedPropertyNames.getString(reference);
      } else if (token === 0x34) { // Long (not-yet-shared) Unicode name
        throw new Smile.SmileError('Key token 0x' + token.toString(16) + ' not supported yet.');
      } else if ((token >= 0x40) && (token <= 0x7f)) { // 'Short' shared key name reference
        reference = token & 0x3f;
        return sharedPropertyNames.getString(reference);
      } else if ((token >= 0x80) && (token <= 0xbf)) { // Short Ascii names
        s = decoderStream.readAscii((token & 0x3f) + 1);
        sharedPropertyNames.addString(s);
        return s;
      } else if ((token >= 0xc0) && (token <= 0xf7)) { // Short Unicode names
        s = decoderStream.readUtf8((token & 0x3f) + 2);
        sharedPropertyNames.addString(s);
        return s;
      } else {
        throw new Smile.SmileError('Invalid key token 0x' + token.toString(16));
      }
    }

    this.parse = function(buffer) {
      var b0, b1, b2, b3;

      decoderStream = new Smile.DecoderStream(new Smile.InputStream(buffer));

      // parse header
      b0 = decoderStream.read();
      b1 = decoderStream.read();
      b2 = decoderStream.read();
      b3 = decoderStream.read();

      if ((b0 !== 0x3a) || (b1 !== 0x29) || (b2 !== 0x0a)) {
        throw new Smile.SmileError('Invalid Smile data.');
      }

      sharedPropertyName = b3 & 0x01;
      sharedStringValue = b3 & 0x02;
      rawBinary = b3 & 0x04;
      version = b3 >> 4;

      sharedPropertyNames = new Smile.SharedStringBuffer(sharedPropertyName, 1024);
      sharedStringValues = new Smile.SharedStringBuffer(sharedStringValue, 1024);

      return parseValue(decoderStream);
    };
  }

  Smile.Parser.parse = function(buffer) {
    return new ParserContext().parse(buffer);
  };
}(window.Smile = window.Smile || {}));

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

