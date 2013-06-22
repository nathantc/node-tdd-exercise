var user = require('../lib/user'),
    User = require('../lib/userSchema').User,
    bcrypt = require('bcrypt'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user.update', function() {

    var req = { }, res = {};

    beforeEach(function() {
        User.findOne = sinon.stub();
        User.findOneAndUpdate = sinon.stub();
        bcrypt.genSaltSync = sinon.stub();
        bcrypt.hashSync = sinon.stub();
        bcrypt.compareSync = sinon.stub();

        res.send = sinon.spy();
    });

    describe('When submitting new password,', function() {

        var error = undefined,
            storedUser = {'username':'current-user', password:'current-hashed-password'},
            updatedUser = {'username':'current-user', password:'new-hashed-password'};

        beforeEach(function() {
            User.findOne.callsArgWith(1, error, storedUser);
            User.findOneAndUpdate.callsArgWith(1, error, updatedUser);
            bcrypt.compareSync.returns(true);
            bcrypt.genSaltSync.returns('new-salt');
            bcrypt.hashSync.returns('new-hashed-password');

            req.session = {user: 'current-user'};
            req.body = {newPassword: 'new-password', currentPassword: 'current-password'};
            user.update(req, res);
        });

        it('verifies the current password', function() {
            assert(bcrypt.compareSync.calledWith('current-password', 'current-hashed-password'));
        });

        it('create new hashed password', function() {
            assert(bcrypt.genSaltSync.called);
            assert(bcrypt.hashSync.calledWith('new-password', 'new-salt'));
        });

        it('saves new password to user', function() {
            assert(User.findOneAndUpdate.calledWith({username: 'current-user', password: 'new-hashed-password'}));
        });

        it('returns a 202 response', function() {
            assert(res.send.calledWith(202));
        })
    });

    describe('When submitting invalid current password,', function() {

        beforeEach(function() {
            User.findOne.callsArgWith(1, undefined, {password: 'hashed-password'});
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
            assert(User.findOneAndUpdate.notCalled);
        });

        it('returns a 403 response', function() {
            assert(res.send.calledWith('Current password is not valid', 403));
        })
    });
});