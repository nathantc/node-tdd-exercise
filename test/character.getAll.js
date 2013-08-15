var character = require('../lib/character'),
    Character = require('../lib/characterSchema').Character,
    user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('character.getAll: ', function() {

    var req = {},
        res = {send: function() {}},
        sessionUserId = 'verified userId';

    beforeEach(function() {
        sinon.stub(user, 'sessionUserId').returns(sessionUserId);
        sinon.stub(res, 'send');
    });

    afterEach(function() {
        user.sessionUserId.restore();
        res.send.restore();
    });

    describe('when requesting character, it', function() {

        var error = undefined,
            characterResults = [ {id: 'characterId', userId: sessionUserId} ];

        beforeEach(function() {
            sinon.stub(Character, 'find').callsArgWith(3, error, characterResults);

            req.params = {};
            character.getAll(req, res);
        });

        afterEach(function() {
            Character.find.restore();
        });

        it('retrieves userId from session', function() {
            assert(user.sessionUserId.calledWith(req));
        });

        it('finds all characters for authenticated user', function() {
            assert(Character.find.calledWith({userId: sessionUserId}, {}, {}))
        });

        it('returns character results', function() {
            assert(res.send.calledWith(characterResults, 200));
        });
    });

});