var xhr = new XMLHttpRequest();
xhr.open('GET', 'ts-guide-data.smile', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
  console.log(Smile.Parser.parse(this.response));
};
xhr.send();

describe('Parser', function() {
  it('should not throw an error', function() {
    expect(function() {
      //Smile.Parser.parse();
    }).not.toThrowError(Smile.SmileError);
  });
});
