var character = require('../lib/character'),
    Character = require('../lib/characterSchema').Character,
    user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('character.update: ', function() {

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

    describe('When updating a character, it', function() {

        var submittedCharacter, preUpdateCharacter, postUpdateCharacter, error;

        beforeEach(function() {
            submittedCharacter = { _id: 'characterId', userId: 'unverified userId', name: 'character' };
            preUpdateCharacter = { _id: 'characterId', userId: sessionUserId, name: 'character' };
            postUpdateCharacter = { _id: 'characterId', userId: sessionUserId, name: 'updated character' };
            error = undefined;
            req.body = submittedCharacter;

            sinon.stub(Character, 'findOneAndUpdate').callsArgWith(2, error, postUpdateCharacter);

            character.update(req, res);
        });

        afterEach(function() {
            Character.findOneAndUpdate.restore();
        });

        it('retrieves userId from session', function() {
            assert(user.sessionUserId.calledWith(req));
        });

        it('saves character with session userId', function() {
            assert(Character.findOneAndUpdate.calledWith({_id: 'characterId', userId: sessionUserId}, preUpdateCharacter));
        });

        it('returns update character data', function() {
            assert(res.send.calledWith(postUpdateCharacter, 200))
        });
    });

});