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
        return parseSimpleLiteralValue(token, decoderStream);
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
        return parseBinaryLongTextStructureValues(token, decoderStream);
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
        // TODO
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
