var mock = require('../src/mock.js').mock;

describe('mock', function () {

  var Clazz;
  
  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });
  
  it('makes a mock out of a prototypical class', function () {
    var mockInstance = mock(Clazz);
    
    mockInstance.foo();

    expect(mockInstance.foo).toHaveBeenCalled();
  });

  it('gives a meaningful name to a spy', function () {
    var mockInstance = mock(Clazz);
    
    expect(mockInstance.foo.identity).toBe('foo');
  });

  it('does not invoke the constructor in creating a mock', function () {
    var invoked = false;
    Clazz = function () {
      invoked = true;
    };

    var mockInstance = mock(Clazz);

    expect(invoked).toBe(false);
  });
});

var when = require('../src/mock.js').when;

describe('when', function () {

  var Clazz;
  
  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });
  
  it('defines behavior based on a matcher', function () {
    var instance = mock(Clazz);
    when(instance.foo).isCalledWith(5).thenReturn("zebra");

    expect(instance.foo(5)).toBe("zebra");
  });

  it('installs multiple behaviors', function () {
    var instance = mock(Clazz);
    
    when(instance.foo).isCalledWith(3).thenReturn("dog");
    when(instance.foo).isCalledWith(4).thenReturn("cat");

    expect(instance.foo(4)).toBe("cat");
    expect(instance.foo(3)).toBe("dog");
  });

  it('handles multiple arguments (positive)', function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith("one", "two").thenReturn("three");

    expect(instance.foo("one", "two")).toBe("three");
  });

  it('handles multiple arguments (negative)', function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith("one", "two").thenReturn("three");

    expect(instance.foo("one", "three")).toBeUndefined();
  });
});

var argThat = require('../src/mock.js').argThat;

describe('argThat', function () {

  var Clazz;
  
  beforeEach(function () {
    Clazz = function () { };
    Clazz.prototype.foo = function () { };
  });

  it("handles argThat matchers", function () {
    var instance = mock(Clazz);

    when(instance.foo).isCalledWith(argThat(function (arg) {
      return arg % 2 === 0;
    })).thenReturn("woo");

    expect(instance.foo(4)).toBe("woo");
    expect(instance.foo(3)).toBe(undefined);    
  });
});