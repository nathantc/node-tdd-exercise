var user = require('../lib/user'),
    userStore = require('../lib/userStore'),
    bcrypt = require('bcrypt'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user.update', function() {

    var req = { }, res = {};

    beforeEach(function() {
        userStore.getUserByUsername = sinon.stub();
        userStore.update = sinon.stub();
        userStore.update.callsArg(2);
        bcrypt.genSaltSync = sinon.stub();
        bcrypt.hashSync = sinon.stub();
        bcrypt.compareSync = sinon.stub();

        res.send = sinon.spy();
    });

    describe('When submitting new password,', function() {

        beforeEach(function() {
            userStore.getUserByUsername.callsArgWith(1, {password: 'hashed-password'});
            bcrypt.compareSync.returns(true);
            bcrypt.genSaltSync.returns('new-salt');
            bcrypt.hashSync.returns('new-encrypted-password');

            req.session = {user: 'current-user'};
            req.body = {newPassword: 'new-password', currentPassword: 'current-password'};
            user.update(req, res);
        });

        it('verifies the current password', function() {
            assert(bcrypt.compareSync.calledWith('current-password', 'hashed-password'));
        });

        it('create new hashed password', function() {
            assert(bcrypt.genSaltSync.called);
            assert(bcrypt.hashSync.calledWith('new-password', 'new-salt'));
        });

        it('saves new password to user', function() {
            assert(userStore.update.calledWith('current-user', 'new-encrypted-password'));
        });

        it('returns a 202 response', function() {
            assert(res.send.calledWith(202));
        })
    });

    describe('When submitting invalid current password,', function() {

        beforeEach(function() {
            userStore.getUserByUsername.callsArgWith(1, {password: 'hashed-password'});
            bcrypt.compareSync.returns(false);

            req.session = {username: 'current-user'};
            req.body = {newPassword: 'new-password', currentPassword: 'invalid-current-password'};
            user.update(req, res);
        });

        it('attempts to verify the invalid current password', function() {
            assert(bcrypt.compareSync.calledWith('invalid-current-password', 'hashed-password'));
        });

        it('does not create new hashed password', function() {
            assert(bcrypt.genSaltSync.notCalled);
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not save new password to user', function() {
            assert(userStore.update.notCalled);
        });

        it('returns a 403 response', function() {
            assert(res.send.calledWith('Current password is not valid', 403));
        })
    });
});