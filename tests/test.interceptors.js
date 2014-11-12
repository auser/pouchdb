'use strict';

var adapters = ['http', 'local'];

adapters.forEach(function (adapter) {
  describe('test.interceptors.js-' + adapter, function () {

    var dbs = {};

    beforeEach(function (done) {
      dbs.name = testUtils.adapterUrl(adapter, 'testdb');
      testUtils.cleanup([dbs.name], done);
    });

    after(function (done) {
      testUtils.cleanup([dbs.name], done);
    });

    var origDocs = [
      {_id: '0', a: 1, b: 1},
      {_id: '3', a: 4, b: 16},
      {_id: '1', a: 2, b: 4},
      {_id: '2', a: 3, b: 9}
    ];

    function writeDocs(db, docs, callback) {
      if (!docs.length) {
        return callback();
      }
      var doc = docs.shift();
      db.put(doc, function (err, doc) {
        should.exist(doc.ok);
        writeDocs(db, docs, callback);
      });
    }

    it('adds a request interceptor to id fn', function (done) {
      var db = new PouchDB(dbs.name);
      var called = false;

      var interceptor = {
        request: function (cb) {
          called = true;
          return cb;
        }
      };

      db.interceptors.push(interceptor);
      db.id().then(function (o) {
        called.should.equal(true);
        done();
      });
    });

    it('Adds a request interceptor', function (done) {
      var db = new PouchDB(dbs.name);

      var interceptor = {
        request: function (req) {
          req.called = true;
          return req;
        }
      };

      writeDocs(db, JSON.parse(JSON.stringify(origDocs)), function () {
        db.interceptors.push(interceptor);
        db.get('1').then(function (res) {
          console.log('in get(0) ', res);
          res.called.should.equal(true);
          done();
        });
      });
    });

    // it('Adds a response interceptor', function (done) {
    //   var db = new PouchDB(dbs.name);

    //   var interceptor = {
    //     response: function (res) {
    //       console.log('------------>', res);
    //       res.called = true;
    //       return res;
    //     }
    //   };

    //   writeDocs(db, JSON.parse(JSON.stringify(origDocs)), function () {
    //     db.interceptors.push(interceptor);
    //     db.get('1').then(function (res) {
    //       res.called.should.equal(true);
    //       done();
    //     });
    //   });
    // });


  });
});
