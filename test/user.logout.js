var user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user', function() {
    describe('.currentUser:', function() {

        var req = {session: {username: "current-user"}},
            res = {send: function() {}};

        beforeEach(function() {
            res.send = sinon.spy();
            user.logout(req, res);
        })

        it('sets the current session to null', function() {
            assert.equal(null, req.session);
        });

        it('returns status code 202', function() {
            assert(res.send.calledWith(202));
        });
    });
});
