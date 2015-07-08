describe('Error', function() {
  it('should have the correct name and message', function() {
    var e = new Smile.SmileError('My error message.');
    expect(e.name).toEqual('SmileError');
    expect(e.message).toEqual('My error message.');
  });
});
