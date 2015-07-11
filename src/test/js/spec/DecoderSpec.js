describe('Decoder', function() {
  it('should decode ZigZag encoded values', function() {
    expect(Smile.Decoder.decodeZigZag(0)).toEqual(0);
    expect(Smile.Decoder.decodeZigZag(1)).toEqual(-1);
    expect(Smile.Decoder.decodeZigZag(2)).toEqual(1);
    expect(Smile.Decoder.decodeZigZag(3)).toEqual(-2);
    expect(Smile.Decoder.decodeZigZag(4294967294)).toEqual(2147483647);
    expect(Smile.Decoder.decodeZigZag(4294967295)).toEqual(-2147483648);
    expect(Smile.Decoder.decodeZigZag(9007199254740990)).toEqual(4503599627370495);
    expect(Smile.Decoder.decodeZigZag(9007199254740991)).toEqual(-4503599627370496);
  });

  it('should throw an error for illegal ZigZag encoded values', function() {
    expect(function() {
      Smile.Decoder.decodeZigZag(-1);
    }).toThrowError(Smile.SmileError);
  });

  it('should decode short ASCII values', function() {
    expect(Smile.Decoder.decodeAscii([0x61, 0x62, 0x63])).toEqual('abc');
  });

  it('should decode short UTF-8 values', function() {
    expect(Smile.Decoder.decodeUtf8([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe6, 0x82, 0xa8, 0xe5, 0xa5, 0xbd])).toEqual('Hello 您好');
  });

  function toArrayBuffer(array, adjustEndianness) {
    var buffer = new ArrayBuffer(array.length),
      view = new Uint8Array(buffer),
      i;
    for (i = 0; i < array.length; i++) {
      if (Smile.littleEndian && adjustEndianness) {
        view[array.length - i - 1] = array[i];
      } else {
        view[i] = array[i];
      }
    }
    return buffer;
  }

  it('should decode 32-bit float values', function() {
    var buffer = toArrayBuffer([0x44, 0x9a, 0x52, 0x25], true);
    expect(Smile.Decoder.decodeFloat32(buffer)).toBeCloseTo(1234.567, 3);
  });

  it('should decode 64-bit float values', function() {
    var buffer = toArrayBuffer([0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7], true);
    expect(Smile.Decoder.decodeFloat64(buffer)).toBeCloseTo(12345678.123456789, 9);
  });

  it('should decode fixed-length big-endian encoded bits', function() {
    var buffer0 = toArrayBuffer([0x44, 0x9a, 0x52, 0x25], false);
    var buffer = toArrayBuffer([0x04, 0x24, 0x69, 0x24, 0x25], false);
    expect(Smile.Decoder.decodeFixedLengthBigEndianEncodedBits(buffer, 32, false)).toEqual(buffer0);

    buffer0 = toArrayBuffer([0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7], false);
    buffer = toArrayBuffer([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27], false);
    expect(Smile.Decoder.decodeFixedLengthBigEndianEncodedBits(buffer, 64, false)).toEqual(buffer0);
  });

  // TODO should decode safe binary encoded bits
});
