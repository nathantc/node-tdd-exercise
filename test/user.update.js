var user = require('../lib/user'),
    User = require('../lib/userSchema').User,
    bcrypt = require('bcrypt'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user.update', function() {

    var req = { }, res = {};

    beforeEach(function() {
        sinon.stub(User, 'findOne');
        sinon.stub(User, 'findOneAndUpdate');
        sinon.stub(bcrypt, 'genSaltSync');
        sinon.stub(bcrypt, 'hashSync');
        sinon.stub(bcrypt, 'compareSync');

        res.send = sinon.spy();
    });

    afterEach(function() {
        User.findOne.restore();
        User.findOneAndUpdate.restore();

        bcrypt.genSaltSync.restore();
        bcrypt.hashSync.restore();
        bcrypt.compareSync.restore();

        res.send.reset();
    })

    describe('When submitting new password,', function() {

        var error = undefined,
            storedUser = {_id:'current-user-id', password:'current-hashed-password'},
            updatedUser = {_id:'current-user-id', password:'new-hashed-password'};

        beforeEach(function() {
            User.findOne.callsArgWith(1, error, storedUser);
            User.findOneAndUpdate.callsArgWith(2, error, updatedUser);
            bcrypt.compareSync.returns(true);
            bcrypt.genSaltSync.returns('new-salt');
            bcrypt.hashSync.returns('new-hashed-password');

            req.session = {userId: 'current-user-id'};
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
            assert(User.findOneAndUpdate.calledWith({_id: 'current-user-id'}, {password: 'new-hashed-password'}));
        });

        it('returns a 204 response', function() {
            assert(res.send.calledWith(204));
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