describe('Parser', function() {
  var smileParserOptions = {
    'debug': true
  };

  function toUint8Array(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function getTestData(name) {
    return toUint8Array(testData[name]);
  }

  function parseSmile(name) {
    return Smile.Parser.parse(getTestData(name), smileParserOptions);
  }

  function parseJson(name) {
    return JSON.parse(testData[name]);
  }

  it('should parse basicArray.smile correctly', function() {
    expect(parseSmile('basicArray.smile')).toEqual(parseJson('basicArray.min.json'));
  });

  it('should parse basicObject.smile correctly', function() {
    expect(parseSmile('basicObject.smile')).toEqual(parseJson('basicObject.min.json'));
  });

  it('should parse basicSimpleLiteralValues.smile correctly', function() {
    expect(parseSmile('basicSimpleLiteralValues.smile')).toEqual(parseJson('basicSimpleLiteralValues.min.json'));
  });
});
