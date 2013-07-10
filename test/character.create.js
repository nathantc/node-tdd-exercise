var character = require('../lib/character'),
    Character = require('../lib/characterSchema').Character,
    user = require('../lib/user'),
    assert = require('assert'),
    sinon = require('sinon');

describe('character.create: ', function() {

    var req = {},
        res = {send: function() {}},
        characterModel = { save: function() {} };

    beforeEach(function() {
        sinon.stub(user, 'sessionUserId');
        sinon.stub(Character, 'newCharacter');
        sinon.spy(res, 'send');
    });

    afterEach(function() {
        user.sessionUserId.restore();
        Character.newCharacter.restore();
        res.send.restore();
    });

    describe('when submitting new character data, it', function() {

        var sessionUserid = 'current-user-id',
            newCharacter = { userId: undefined, name: 'new character' },
            modifiedCharacter = { userId: sessionUserid, name: 'new character' },
            savedModel = { userId: sessionUserid, name: 'saved character' },
            saveError = undefined;

        beforeEach(function() {
            Character.newCharacter.returns(characterModel);
            user.sessionUserId.returns(sessionUserid);
            sinon.stub(characterModel, 'save').callsArgWith(0, saveError, savedModel);
            req.body = newCharacter;
            character.create(req, res);
        });

        afterEach(function() {
            characterModel.save.restore();
        });

        it('retrieves userId from session', function() {
           assert(user.sessionUserId.calledWith(req));
        });

        it('creates a character model from request data', function() {
            assert(Character.newCharacter.calledWith(modifiedCharacter));
        });

        it('saves the character data', function() {
            assert(characterModel.save.called);
        });

        it('returns saved model', function() {
            assert(res.send.calledWith(savedModel));
        });
    });

    describe('when session is not authenticated, it', function() {

        var sessionUserId = undefined,
            newCharacter = { userId: undefined, name: 'new character' };

        beforeEach(function() {
            req.body = newCharacter;
            character.create(req, res);
        });

        it('does not save the new character', function() {
            assert(Character.newCharacter.notCalled);
        });

        it('returns error code', function() {
            assert(res.send.calledWith('Authentication is required to save character', 403));
        });

    });

});