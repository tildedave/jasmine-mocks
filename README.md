** DO NOT USE THIS, USE [SINON](http://sinonjs.org/) INSTEAD **

An experiment to add mock objects to JavaScript with Jasmine spies.  This is
probably only useful for you if you program in 'object-oriented' JavaScript,
i.e. define functions as constructors and then define methods as function
properties on the constructor function's prototype.

Syntax:

```javascript
mock = require('jasmine-mocks').mock;

mockInstance = mock(Clazz);

// mockInstance is now an object that contains every function on Clazz's
// prototype as a spy

EventEmitter = require('events').EventEmitter;

mockInstance = mock(Clazz, EventEmitter);

// mockInstance is now an object that contains every function on Clazz's
// prototype as a spy, and implements the real functionality of EventEmitter.

when = require('jasmine-mocks').when;

when(mockInstance.foo).isCalledWith("bar").thenReturn("baz");

// any call to the foo spy with the string "bar" will return the string "baz"

argThat = require('jasmine-mocks').argThat;

var hasLength (n) = function () {
  return function (arr) {
    return (arr.length === n);
  }
};

when(mockInstance.foo).isCalledWith(argThat(hasLength(3)).thenReturn("baz");

// any call to foo with an array of length 3 will return the string "baz"
```

# Why?

Jasmine is an excellent JavaScript unit testing framework.  However, if you use
the 'classical object model' for JavaScript it has some deficiencies when
compared to similar frameworks for Java/.NET.

## Treating Dependencies: Real Objects or Class Skeletons?

In my experience with Jasmine, when you deal with one class having a dependency
on another you end up doing one of two things, using "real objects" or
"class skeletons".

### Real Objects

Class A has a dependency on Class B.  Let's pretend we have been trying to keep
classes separate and are passing an instance of B in whenever we create an
instance of A.

This code looks like:

```javascript
var A = function (b) {
  this.b = b;
};

describe('A', function () {

  it('calls the appropriate method on B', function () {
    var b = new B();
    spyOn(b, 'execute');

    new A(b).doSomething();

    expect(b.execute).toHaveBeenCalled();
  });

});
```

When B has more than one function (perhaps it is a domain model), this
leads to complicated setups requiring where stubbed models are created, spying
on multiple methods, and sometimes describing different behavior for each one.

Sometimes some methods of B are not overridden, involving tests that do not
properly stub out their dependencies.  This is even worse!

### Class Skeletons

A different approach is to create a 'class skeleton' of B and pass that into A.
This looks like:

```javascript
var A = function (b) {
  this.b = b;
};

describe('A', function () {

  it('calls the appropriate method on B', function () {
    var b = {
      execute: jasmine.createSpy('execute')
    }

    new A(b).doSomething();

    expect(b.execute).toHaveBeenCalled();
  });

});
```

This is a little better but still prone to problems.  If the definition of B
changes all of our tests must be updated, and it requires a lot of duplicate
boilerplate between tests.

## Mocks That Can Emit Events

If one object depends on another firing an event to trigger its own behavior,
this leads to more awkwardness in setting up a mock object.

This is an issue when using objects that fire events like Node's [events.EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) or Closure's [goog.events.EventTarget](http://closure-library.googlecode.com/svn/docs/class_goog_events_EventTarget.html).

```javascript

var A = function (b, c) {
  b.on('event that A listens to', function () {
    c.execute();
  });
};

describe('A', function () {
  it('executes on C when an event is fired on B', function () {
    var B = function () {};
    B.prototype = Object.create(EventEmitter);

    var b = new B();
    var c = {
      execute: jasmine.createSpy('execute')
    }

    var a = new A(b, c);

    b.emit('event that A listens to');

    expect(c.execute).toHaveBeenCalled();
  });
});
```

This is awkward and still relies on setting any extra properties on
the source of the events.  Events are fundamental to JavaScript
frameworks and firing/listening to an event on a mock should be as
easy as calling a function already is.

## Matchers

The canonical way to treat different calls to spies differently in Jasmine is
to write something like the following:

```javascript
spyOn(b, 'getData').andCallFake(function (userId) {
  if (userId === 'joe') {
    return { name: 'Joe', id: 'ABQ-394' }
  }
  if (userId === 'jane') {
    return { name: 'Jane', id: 'POW-889' }
  }

  throw 'Invalid User';
});
```

I have found that this adds a little too much boilerplate and code to setup,
while not allowing me to easily have tests fail if spies are passed incorrect
values.  (I would rather write define what arguments will be passed to my spies
in setup than assert that the spy got called with the correct arguments.)
