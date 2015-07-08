describe('SharedStringBuffer', function() {
  describe('when not enabled', function() {
    var ssb;

    beforeEach(function() {
      ssb = new Smile.SharedStringBuffer(false, 4);
    });

    it('should succeed when adding a string', function() {
      expect(ssb.addString('test1')).toBe('test1');
    });

    it('should throw an error when getting a string', function() {
      expect(function() {
        ssb.addString('test1');
        ssb.addString('test2');
        ssb.addString('test3');
        ssb.getString(1);
      }).toThrowError(Smile.SmileError);
    });
  });

  describe('when enabled', function() {
    var ssb;

    beforeEach(function() {
      ssb = new Smile.SharedStringBuffer(true, 4);
    });

    it('should succeed when adding a string', function() {
      expect(ssb.addString('test1')).toBe('test1');
      expect(ssb.getString(0)).toBe('test1');
      expect(ssb.addString('test2')).toBe('test2');
      expect(ssb.getString(1)).toBe('test2');
      expect(ssb.addString('test3')).toBe('test3');
      expect(ssb.getString(2)).toBe('test3');
      expect(ssb.addString('test4')).toBe('test4');
      expect(ssb.getString(3)).toBe('test4');
    });

    it('should reset when it reaches capacity', function() {
      expect(ssb.addString('test1')).toBe('test1');
      expect(ssb.addString('test2')).toBe('test2');
      expect(ssb.addString('test3')).toBe('test3');
      expect(ssb.addString('test4')).toBe('test4');
      expect(ssb.addString('test5')).toBe('test5');
      expect(ssb.getString(0)).toBe('test5');
      expect(ssb.addString('test6')).toBe('test6');
      expect(ssb.getString(1)).toBe('test6');
      expect(function() {
        ssb.getString(2);
      }).toThrowError(Smile.SmileError);
    });

  });
});
