/* global window, console */

(function(Smile, undefined) {
  'use strict';

  Smile.Parser = {};

  function ParserContext(opts) {
    var options = opts,
      sharedPropertyName = false,
      sharedStringValue = false,
      rawBinary = false,
      version = 0,
      sharedPropertyNames,
      sharedStringValues,
      decoderStream,
      debugContextStack = [];

    function isDebugEnabled() {
      return options && options.debug;
    }

    function getCurrentDebugContext() {
      if (debugContextStack.length === 0) {
        return;
      }
      return debugContextStack[debugContextStack.length - 1];
    }

    function pushDebugToken(name, value) {
      if (isDebugEnabled()) {
        if (value === undefined) {
          debugContextStack.push(name);
        } else {
          debugContextStack.push(name + ' ' + value);
        }
      }
    }

    function parseSimpleLiteralValue(token, decoderStream) {
      var n;
      if (token === 0x20) { // empty string
        pushDebugToken('EMPTYSTRING');
        return '';
      } else if (token === 0x21) { // null
        pushDebugToken('NULL');
        return null;
      } else if (token === 0x22) { // false
        pushDebugToken('FALSE');
        return false;
      } else if (token === 0x23) { // true
        pushDebugToken('TRUE');
        return true;
      } else if (token === 0x24) { // 32-bit integer; zigzag encoded, 1 - 5 data bytes
        n = decoderStream.readSignedVint();
        pushDebugToken('INT32', n);
        return n;
      } else if (token === 0x25) { // 64-bit integer; zigzag encoded, 5 - 10 data bytes
        n = decoderStream.readSignedVint();
        pushDebugToken('INT64', n);
        return n;
      } else if (token === 0x26) { // BigInteger
        n = decoderStream.readBigInt();
        pushDebugToken('BIGINT', n);
        return n;
      } else if (token === 0x28) { // 32-bit float
        n = decoderStream.readFloat32();
        pushDebugToken('FLOAT32', n);
        return n;
      } else if (token === 0x29) { // 64-bit double
        n = decoderStream.readFloat64();
        pushDebugToken('FLOAT64', n);
        return n;
      } else if (token === 0x2a) { // BigDecimal
        n = decoderStream.readBigDecimal();
        pushDebugToken('BIGDECIMAL', n);
        return n;
      } else {
        throw new Smile.SmileError('Invalid value token 0x' + token.toString(16));
      }
    }

    function parseBinaryLongTextStructureValues(token, decoderStream) {
      var array,
        object,
        key,
        value;
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
        array = [];
        if (isDebugEnabled()) {
          debugContextStack.push([]);
        }
        while (decoderStream.peek() !== 0xf9) { // END_ARRAY
          array.push(parseValue(decoderStream));
          if (isDebugEnabled()) {
            value = debugContextStack.pop();
            getCurrentDebugContext().push(value);
          }
        }
        decoderStream.read(); // consume END_ARRAY
        return array;
      } else if (token === 0xfa) { // START_OBJECT
        object = {};
        if (isDebugEnabled()) {
          debugContextStack.push({});
        }
        while (decoderStream.peek() !== 0xfb) { // END_OBJECT
          key = parseKey(decoderStream);
          value = parseValue(decoderStream);
          object[key] = value;
          if (isDebugEnabled()) {
            value = debugContextStack.pop();
            key = debugContextStack.pop();
            getCurrentDebugContext()[key] = value;
          }
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
        value;
      if (tokenClass === 0) { // Short Shared Value String reference (single byte)
        value = sharedStringValues.getString(token & 0x1f);
        pushDebugToken('SHORTSTRREF', value);
        return value;
      } else if (tokenClass === 1) { // Simple literals, numbers
        return parseSimpleLiteralValue(token, decoderStream);
      } else if (tokenClass === 2) { // Tiny ASCII (1 - 32 bytes == chars)
        value = decoderStream.readAscii((token & 0x1f) + 1);
        sharedStringValues.addString(value);
        pushDebugToken('TINYASCII', value);
        return value;
      } else if (tokenClass === 3) { // Short ASCII (33 - 64 bytes == chars)
        value = decoderStream.readAscii((token & 0x1f) + 33);
        sharedStringValues.addString(value);
        pushDebugToken('SHORTASCII', value);
        return value;
      } else if (tokenClass === 4) { // Tiny Unicode (2 - 33 bytes; <= 33 characters)
        value = decoderStream.readUtf8((token & 0x1f) + 2);
        sharedStringValues.addString(value);
        pushDebugToken('TINYUTF8', value);
        return value;
      } else if (tokenClass === 5) { // Short Unicode (34 - 64 bytes; <= 64 characters)
        value = decoderStream.readUtf8((token & 0x1f) + 34);
        sharedStringValues.addString(value);
        pushDebugToken('SHORTUTF8', value);
        return value;
      } else if (tokenClass === 6) { // Small integers (single byte)
        value = Smile.Decoder.decodeZigZag(token & 0x1f);
        pushDebugToken('SMALLINT', value);
        return value;
      } else if (tokenClass === 7) { // Binary / Long text / structure markers
        return parseBinaryLongTextStructureValues(token, decoderStream);
      }
    }

    function parseKey(decoderStream) {
      var token = decoderStream.read(),
        reference,
        s;
      if (token === 0x20) { // Special constant name '' (empty String)
        pushDebugToken('EMPTYSTRING');
        return '';
      } else if ((token >= 0x30) && (token <= 0x33)) { // 'Long' shared key name reference (2 byte token)
        reference = ((token & 0x03) << 8) | decoderStream.read();
        if (reference < 64) {
          throw new Smile.SmileError('Invalid long shared key name reference.');
        }
        s = sharedPropertyNames.getString(reference);
        pushDebugToken('LONGSTRREF', s);
        return s;
      } else if (token === 0x34) { // Long (not-yet-shared) Unicode name
        // TODO
        throw new Smile.SmileError('Key token 0x' + token.toString(16) + ' not supported yet.');
      } else if ((token >= 0x40) && (token <= 0x7f)) { // 'Short' shared key name reference
        reference = token & 0x3f;
        s = sharedPropertyNames.getString(reference);
        pushDebugToken('SHORTSTRREF', s);
        return s;
      } else if ((token >= 0x80) && (token <= 0xbf)) { // Short Ascii names
        s = decoderStream.readAscii((token & 0x3f) + 1);
        sharedPropertyNames.addString(s);
        pushDebugToken('SHORTASCII', s);
        return s;
      } else if ((token >= 0xc0) && (token <= 0xf7)) { // Short Unicode names
        s = decoderStream.readUtf8((token & 0x3f) + 2);
        sharedPropertyNames.addString(s);
        pushDebugToken('SHORTUTF8', s);
        return s;
      } else {
        throw new Smile.SmileError('Invalid key token 0x' + token.toString(16));
      }
    }

    this.parse = function(buffer) {
      var b0, b1, b2, b3, value;

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

      value = parseValue(decoderStream);
      if (isDebugEnabled()) {
        console.log(debugContextStack.pop());
      }
      return value;
    };
  }

  Smile.Parser.parse = function(buffer, opts) {
    return new ParserContext(opts).parse(buffer);
  };
}(window.Smile = window.Smile || {}));
