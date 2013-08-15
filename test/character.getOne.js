var character = require('../lib/character'),
    Character = require('../lib/characterSchema').Character,
    user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('character.getOne: ', function() {

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

    describe('when requesting character by id, it', function() {

        var error = undefined,
            result = {_id: 'Character ID', userId: sessionUserId};

        beforeEach(function() {
            sinon.stub(Character, 'findOne').callsArgWith(3, error, result);

            req.params = {id: 'character-id'};
            character.getOne(req, res);
        });

        afterEach(function() {
            Character.findOne.restore();
        });

        it('retrieves userId from session', function() {
            assert(user.sessionUserId.calledWith(req));
        });

        it('retrieves character for authenticated user', function() {
            assert(Character.findOne.calledWith({_id: req.params.id, userId: sessionUserId}))
        });

        it('returns character', function() {
            assert(res.send.calledWith(result, 200));
        });
    });
});