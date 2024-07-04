class a extends Error {
  constructor(e) {
    super(e);
  }
}
const S = [0, 1, 3, 7, 15, 31, 63, 127, 255];
class m {
  decodeZigZag(e) {
    if (e < 0)
      throw new a("illegal zigzag value");
    return e <= 2147483647 ? e & 1 ? -(e >> 1) - 1 : e >> 1 : e & 1 ? -Math.floor(e / 2) - 1 : Math.floor(e / 2);
  }
  decodeAscii(e) {
    return new TextDecoder("ascii").decode(e);
  }
  decodeUtf8(e) {
    return new TextDecoder("utf8").decode(e);
  }
  toDataView(e) {
    const t = new ArrayBuffer(e.length), i = new DataView(t);
    for (let r = 0; r < e.length; r++)
      i.setUint8(r, e[r]);
    return i;
  }
  // big-endian encoding
  decodeFloat32(e) {
    return this.toDataView(e).getFloat32(0, !1);
  }
  // big-endian encoding
  decodeFloat64(e) {
    return this.toDataView(e).getFloat64(0, !1);
  }
  decodeFixedLengthBigEndianEncodedBits(e, t) {
    const i = new Uint8Array(Math.ceil(t / 8));
    let r = 0, s = t % 7, o = 0, n = 0, u = e[r], d = 0, h;
    for (; r < e.length; ) {
      const l = Math.min(s, 8 - n);
      d <<= l, d |= u >> s - l, s -= l, u &= S[s], n += l, s === 0 && (r++, s = 7, u = e[r]), n === 8 && (h = o, i[h] = d, o++, n = 0, d = 0);
    }
    return n > 0 && (d <<= 8 - n, h = o, i[h] = d), i;
  }
  decodeSafeBinaryEncodedBits(e, t) {
    const i = new Uint8Array(Math.ceil(t / 8));
    let r = 0, s = 7, o = 0, n = 0, u = e[r], d = 0;
    for (; o < i.length; ) {
      const h = Math.min(s, 8 - n);
      d <<= h, d |= u >> s - h, s -= h, u &= S[s], n += h, s === 0 && (r++, s = 7, u = e[r]), n === 8 && (i[o] = d, o++, n = 0, d = 0);
    }
    return n > 0 && (d <<= 8 - n, i[o] = d), i;
  }
}
class w {
  constructor(e) {
    this.inputStream = e, this.decoder = new m();
  }
  isEof() {
    return this.inputStream.isEof();
  }
  read() {
    return this.inputStream.read();
  }
  peek() {
    return this.inputStream.peek();
  }
  readUnsignedVint() {
    let e = 0, t = 0;
    function i(r, s) {
      const o = [0, 1, 3, 7, 15, 31, 63, 127, 255], n = [1, 2, 4, 8, 16, 32, 64, 128];
      t + s < 32 ? (e <<= s, e |= r & o[s]) : (e *= n[s], e += r & o[s]), t += s;
    }
    for (; ; ) {
      const r = this.inputStream.read();
      if (r & 128)
        return i(r, 6), e;
      i(r, 7);
    }
  }
  readSignedVint() {
    return this.decoder.decodeZigZag(this.readUnsignedVint());
  }
  readAscii(e) {
    return this.decoder.decodeAscii(this.inputStream.readArray(e));
  }
  readUtf8(e) {
    return this.decoder.decodeUtf8(this.inputStream.readArray(e));
  }
  readFloat32() {
    return this.decoder.decodeFloat32(this.readFixedLengthBigEndianEncodedBits(32));
  }
  readFloat64() {
    return this.decoder.decodeFloat64(this.readFixedLengthBigEndianEncodedBits(64));
  }
  readFixedLengthBigEndianEncodedBits(e) {
    const t = this.inputStream.readArray(Math.ceil(e / 7));
    return this.decoder.decodeFixedLengthBigEndianEncodedBits(t, e);
  }
  readSafeBinary() {
    const e = this.readUnsignedVint(), t = this.inputStream.readArray(Math.ceil(e * 8 / 7));
    return this.decoder.decodeSafeBinaryEncodedBits(t, e * 8);
  }
  readBigInt() {
    const e = this.readSafeBinary();
    let t = 0;
    for (let i = 0; i < e.length; i++)
      t = t * 256 + e[i];
    return t;
  }
  readBigDecimal() {
    const e = this.readSignedVint();
    return this.readBigInt() * Math.pow(10, e);
  }
  readLongString() {
    const e = [];
    for (; ; ) {
      const t = this.inputStream.read();
      if (t === 252)
        break;
      e.push(t);
    }
    return new Uint8Array(e);
  }
  readLongAscii() {
    return this.decoder.decodeAscii(this.readLongString());
  }
  readLongUtf8() {
    return this.decoder.decodeUtf8(this.readLongString());
  }
  readBytes(e) {
    return this.inputStream.readArray(e);
  }
}
const g = new a("end of input stream reached");
class p {
  constructor(e) {
    this.index = 0, this.array = e;
  }
  isEof() {
    return this.index >= this.array.length;
  }
  read() {
    if (this.isEof())
      throw g;
    const e = this.array[this.index];
    return this.index++, e;
  }
  readArray(e) {
    if (this.isEof())
      throw g;
    if (e < 0)
      throw new a("invalid read amount");
    const t = Math.min(this.array.length, this.index + e), i = this.array.subarray(this.index, t);
    return this.index = t, i;
  }
  peek() {
    if (this.isEof())
      throw g;
    return this.array[this.index];
  }
  skip(e) {
    if (this.isEof())
      throw g;
    if (e < 0)
      throw new a("invalid skip amount");
    this.index += e;
  }
}
class f {
  constructor(e, t) {
    if (t > 1024)
      throw new a("maxStrings must be <= 1024");
    this.enabled = e, this.maxStrings = t, this.strings = [];
  }
  addString(e) {
    if (!this.enabled)
      return -1;
    this.strings.length >= this.maxStrings && (this.strings = []);
    const t = this.strings.length;
    return this.strings.push(e), t;
  }
  getString(e) {
    if (!this.enabled)
      throw new a("shared strings are not enabled.");
    if (e >= this.strings.length)
      throw new a("shared string reference out of range.");
    return this.strings[e];
  }
}
function B(c, e) {
  return new y(c, e).parse();
}
class y {
  constructor(e, t) {
    this.decoderStream = new w(new p(e)), this.options = t, this.decoder = new m(), this.sharedPropertyName = !1, this.sharedStringValue = !1, this.rawBinary = !1, this.version = 0, this.sharedPropertyNames = new f(!1, 1024), this.sharedStringValues = new f(!1, 1024);
  }
  parse() {
    const e = this.decoderStream.read(), t = this.decoderStream.read(), i = this.decoderStream.read();
    if (e !== 58 || t !== 41 || i !== 10)
      throw new a("invalid Smile header");
    const r = this.decoderStream.read();
    return this.sharedPropertyName = (r & 1) === 1, this.sharedStringValue = (r & 2) === 2, this.rawBinary = (r & 4) === 4, this.version = r >> 4, this.sharedPropertyNames = new f(this.sharedPropertyName, 1024), this.sharedStringValues = new f(this.sharedStringValue, 1024), this.readValue();
  }
  readValue() {
    const e = this.decoderStream.read(), t = e >> 5, i = e & 31;
    switch (t) {
      case 0:
        return this.sharedStringValues.getString(i);
      case 1:
        return this.readSimpleLiteralValue(e);
      case 2: {
        const r = this.decoderStream.readAscii(i + 1);
        return this.sharedStringValues.addString(r), r;
      }
      case 3: {
        const r = this.decoderStream.readAscii(i + 33);
        return this.sharedStringValues.addString(r), r;
      }
      case 4: {
        const r = this.decoderStream.readUtf8(i + 2);
        return this.sharedStringValues.addString(r), r;
      }
      case 5: {
        const r = this.decoderStream.readUtf8(i + 34);
        return this.sharedStringValues.addString(r), r;
      }
      case 6:
        return this.decoder.decodeZigZag(i);
      case 7:
        return this.readBinaryLongTextStructureValues(e);
      default:
        throw new a(`unknown token class: ${t}`);
    }
  }
  readSimpleLiteralValue(e) {
    if (e === 32)
      return "";
    if (e === 33)
      return null;
    if (e === 34)
      return !1;
    if (e === 35)
      return !0;
    if (e === 36)
      return this.decoderStream.readSignedVint();
    if (e === 37)
      return this.decoderStream.readSignedVint();
    if (e === 38)
      return this.decoderStream.readBigInt();
    if (e === 40)
      return this.decoderStream.readFloat32();
    if (e === 41)
      return this.decoderStream.readFloat64();
    if (e === 42)
      return this.decoderStream.readBigDecimal();
    throw new a("invalid value token 0x" + e.toString(16));
  }
  readBinaryLongTextStructureValues(e) {
    if (e === 224)
      return this.decoderStream.readLongAscii();
    if (e === 228)
      return this.decoderStream.readLongUtf8();
    if (e === 232)
      return this.decoderStream.readSafeBinary();
    if (e >= 236 && e <= 239) {
      const t = (e & 3) << 8 | this.decoderStream.read();
      if (t < 64)
        throw new a("invalid long shared value name reference");
      return this.sharedStringValues.getString(t);
    } else if (e === 248) {
      const t = [];
      for (; this.decoderStream.peek() !== 249; )
        t.push(this.readValue());
      return this.decoderStream.read(), t;
    } else if (e === 250) {
      const t = {};
      for (; this.decoderStream.peek() !== 251; ) {
        const i = this.readKey(), r = this.readValue();
        t[i] = r;
      }
      return this.decoderStream.read(), t;
    } else if (e === 253) {
      const t = this.decoderStream.readUnsignedVint();
      return this.decoderStream.readBytes(t);
    } else
      throw new a("invalid value token 0x" + e.toString(16));
  }
  readKey() {
    const e = this.decoderStream.read();
    if (e === 32)
      return "";
    if (e >= 48 && e <= 51) {
      const t = (e & 3) << 8 | this.decoderStream.read();
      if (t < 64)
        throw new a("invalid long shared key name reference.");
      return this.sharedPropertyNames.getString(t);
    } else {
      if (e === 52)
        return this.decoderStream.readLongUtf8();
      if (e >= 64 && e <= 127) {
        const t = e & 63;
        return this.sharedPropertyNames.getString(t);
      } else if (e >= 128 && e <= 191) {
        const t = this.decoderStream.readAscii((e & 63) + 1);
        return this.sharedPropertyNames.addString(t), t;
      } else if (e >= 192 && e <= 247) {
        const t = this.decoderStream.readUtf8((e & 63) + 2);
        return this.sharedPropertyNames.addString(t), t;
      } else
        throw new a("invalid key token 0x" + e.toString(16));
    }
  }
}
export {
  a as SmileError,
  B as parse
};
//# sourceMappingURL=smile-js.js.map
