describe('DecoderStream', function() {
  function toArrayBuffer(array) {
    var buffer = new ArrayBuffer(array.length),
      view = new Uint8Array(buffer),
      i;
    for (i = 0; i < array.length; i++) {
      view[i] = array[i];
    }
    return buffer;
  }

  function toDecoderStream(array) {
    return new Smile.DecoderStream(new Smile.InputStream(toArrayBuffer(array)));
  }

  it('should decode unsigned Vint value 0', function() {
    var ds = toDecoderStream([0x80]);
    expect(ds.readUnsignedVint()).toEqual(0);
  });

  it('should decode unsigned Vint value 1', function() {
    var ds = toDecoderStream([0x81]);
    expect(ds.readUnsignedVint()).toEqual(1);
  });

  it('should decode unsigned Vint value 2147483647', function() {
    var ds = toDecoderStream([0x0f, 0x7f, 0x7f, 0x7f, 0xbf]);
    expect(ds.readUnsignedVint()).toEqual(2147483647);
  });

  it('should decode unsigned Vint value 2147483648', function() {
    var ds = toDecoderStream([0x10, 0x00, 0x00, 0x00, 0x80]);
    expect(ds.readUnsignedVint()).toEqual(2147483648);
  });

  it('should decode 32-bit float values', function() {
    var ds = toDecoderStream([0x04, 0x24, 0x69, 0x24, 0x25]);
    expect(ds.readFloat32()).toBeCloseTo(1234.567, 3);
  });

  it('should decode 64-bit float values', function() {
    var ds = toDecoderStream([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27]);
    expect(ds.readFloat64()).toBeCloseTo(12345678.123456789, 9);
  });
});
