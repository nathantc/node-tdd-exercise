var user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user', function() {
    describe('.currentUser', function() {
        var req = {},
            res = {
                json: sinon.spy()
            };

        function testResponseJson(expected) {
            user.currentUser(req, res);
            assert(res.json.calledWith(expected));
        }

        it('returns username value of session object', function() {
            req.session = {username: 'current-user'};
        });

        it('does not return other session values', function() {
            req.session = {username: 'current user', private: 'private data'};
            testResponseJson({username: 'current user'});
        });

        it('returns "guest" username when session has not been authenticated', function() {
            req.session = {};
            testResponseJson({username: 'guest'});
        })
    });
});
