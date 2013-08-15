var character = require('../lib/character'),
    Character = require('../lib/characterSchema').Character,
    user = require('../lib/user'),
    sinon = require('sinon'),
    assert = require('assert');

describe('character.delete: ', function() {

    var req = {},
        res = {send: function() {}},
        sessionUserId = 'validated userId';

    beforeEach(function() {
        sinon.stub(user, 'sessionUserId').returns(sessionUserId)
        sinon.stub(res, 'send');
    });

    afterEach(function() {
        user.sessionUserId.restore();
        res.send.restore();
    });

    describe('when deleting receiving character id to delete, it', function() {

        var error = undefined;

        beforeEach(function() {
            sinon.stub(Character, 'findOneAndRemove').callsArgWith(2, error);
            req.params = {id: 'characterId'};
            character.delete(req, res);
        });

        afterEach(function() {
            Character.findOneAndRemove.restore();
        });

        it('retrieves the userId from session', function() {
            assert(user.sessionUserId.calledWith(req));
        });

        it('deletes the character for validated userId', function() {
            assert(Character.findOneAndRemove.calledWith({_id: 'characterId', userId: sessionUserId}, {}));
        });

        it('returns success code', function() {
            assert(res.send.calledWith(204));
        });
    });
});