describe('InputStream', function() {
  var data = [0x61, 0x62, 0x63],
    dataView = new Uint8Array(data),
    istrm;

  beforeEach(function() {
    istrm = new Smile.InputStream(dataView);
  });

  it('should be able to read single elements of data', function() {
    expect(istrm.read()).toEqual(0x61);
    expect(istrm.read()).toEqual(0x62);
    expect(istrm.read()).toEqual(0x63);
    expect(istrm.isEof()).toEqual(true);
  });

  it('should be able to peek at the data', function() {
    expect(istrm.peek()).toEqual(0x61);
    expect(istrm.read()).toEqual(0x61);
    expect(istrm.peek()).toEqual(0x62);
    expect(istrm.read()).toEqual(0x62);
    expect(istrm.peek()).toEqual(0x63);
    expect(istrm.read()).toEqual(0x63);
    expect(istrm.isEof()).toEqual(true);
  });

  it('should be able to read an array of data', function() {
    expect(istrm.readArray(3)).toEqual(new Uint8Array(data));
    expect(istrm.isEof()).toEqual(true);
  });

  it('should be able to skip data', function() {
    istrm.skip(2);
    expect(istrm.read()).toEqual(0x63);
    expect(istrm.isEof()).toEqual(true);
  });

  it('should be able to skip past the end of data', function() {
    istrm.skip(10);
    expect(istrm.isEof()).toEqual(true);
    expect(function() {
      istrm.read();
    }).toThrowError(Smile.SmileError);
  });

  it('should throw an error when reading past the end of the stream', function() {
    expect(istrm.read()).toEqual(0x61);
    expect(istrm.read()).toEqual(0x62);
    expect(istrm.read()).toEqual(0x63);
    expect(function() {
      istrm.read();
    }).toThrowError(Smile.SmileError);
  });

  it('should throw an error when peeking past the end of the stream', function() {
    expect(istrm.read()).toEqual(0x61);
    expect(istrm.read()).toEqual(0x62);
    expect(istrm.read()).toEqual(0x63);
    expect(function() {
      istrm.peek();
    }).toThrowError(Smile.SmileError);
  });
});
