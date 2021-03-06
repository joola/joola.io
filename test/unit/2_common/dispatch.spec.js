/**
 *  @title joola
 *  @overview the open-source data analytics framework
 *  @copyright Joola Smart Solutions, Ltd. <info@joo.la>
 *  @license GPL-3.0+ <http://spdx.org/licenses/GPL-3.0+>
 *
 *  Licensed under GNU General Public License 3.0 or later.
 *  Some rights reserved. See LICENSE, AUTHORS.
 **/


describe("dispatch", function () {
  it("should emit with no exception (w/ callback)", function (done) {
    engine.dispatch.emit('test-emit-wcallback', 'test', function (err, result) {
      return done(err);
    });
  });

  it("should emit with no exception (wo/ callback)", function (done) {
    engine.dispatch.emit('test-emit-wocallback', 'test');
    done();
  });

  it("should catch emits", function (done) {
    engine.dispatch.on('test-emit', function (result) {
      return done(null);
    }, function () {
      engine.dispatch.emit('test-emit', 'test');
    });
  });

  it("should catch multiple emits", function (done) {
    var expected = 3;
    var actual = 0;
    engine.dispatch.on('test-emit-multiple', function (result) {
      actual++;
      if (actual >= expected)
        return done(null);
    }, function () {
      engine.dispatch.emit('test-emit-multiple', 'test');
      engine.dispatch.emit('test-emit-multiple', 'test');
      engine.dispatch.emit('test-emit-multiple', 'test');
    });
  });

  it("should catch multiple emits with different callbacks", function (done) {
    var expected = 2;
    var counter = 0;
    engine.dispatch.on('test-emit-double', function (result) {
      var i = 1;
      counter++;
      if (counter == expected)
        return done(null);
    }, function () {
      engine.dispatch.on('test-emit-double', function (result) {
        counter++;
        if (counter == expected)
          return done(null);
      }, function () {
        engine.dispatch.emit('test-emit-double', 'test');
      });
    });
  });

  it("should prevent multiple catches with the same callback", function (done) {
    var counter = 0;
    var expected = 2;
    var errors = 0;
    var expectederrors = 1;

    var donecalled = false;

    var callback = function (err) {
      counter++;
      if (err)
        errors++;
      if (errors === expectederrors) {
        donecalled = true;
        return done();
      }
      else if (counter == expected && !donecalled)
        return done(new Error('Not prevented'));
    };
    engine.dispatch.on('test-emit-double-prevent', function (err) {
      return callback(err);
    }, function () {
      engine.dispatch.on('test-emit-double-prevent', function (err) {
        return callback(err);
      }, function () {
        engine.dispatch.emit('test-emit-double-prevent', 'test');
      });
    });
  });

  it("should remove listener", function (done) {
    var actual = 0;
    var expected = 2;

    var cb = function (result) {
      actual++;
    };

    engine.dispatch.on('test-emit-remove', cb);

    engine.dispatch.emit('test-emit-remove', 'test', function () {
      engine.dispatch.emit('test-emit-remove', 'test', function () {
        setTimeout(function () {
          engine.dispatch.removeListener('test-emit-remove', cb);
          engine.dispatch.emit('test-emit-remove', 'test');

          setTimeout(function () {
            if (actual == expected)
              return done(null);
            else
              return done(new Error('Listener still connected [' + actual + ']'));
          }, 500);
        }, 500);
      });
    });
  });

  it("should remove all listeners for a channel", function (done) {
    var actual = 0;
    var expected = 2;

    var cb1 = function (result) {
      actual++;
    };
    var cb2 = function (result) {
      var a = 1;
      actual++;
    };
    engine.dispatch.on('test-emit-remove-all', cb1);
    engine.dispatch.on('test-emit-remove-all', cb2);

    var list = engine.dispatch.removeAllListeners('test-emit-remove-all');
    if (list.length == 2)
      return done();
    else
      return done(new Error('Failed to remove all listeners'));

  });

  it("should listen once for emits", function (done) {
    var expected = 1;
    var actual = 0;
    engine.dispatch.once('test-emit-once', function (result) {
      actual++;
      if (actual >= expected)
        return done(null);
    });
    engine.dispatch.emit('test-emit-once', 'test');
    engine.dispatch.emit('test-emit-once', 'test');
  });
});
