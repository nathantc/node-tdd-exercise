var user = require('../lib/user'),
    userRule = require('../lib/userRule'),
    userStore = require('../lib/userStore'),
    bcrypt = require('bcrypt'),
    sinon = require('sinon'),
    assert = require('assert');

describe('user.register:', function() {

    var req = {},
        res = {send: function() {}},
        getUserByUsernameResult;

    beforeEach(function() {
        userRule.validateNewUser = sinon.stub();
        userStore.getUserByUsername = sinon.stub();
        userStore.save = sinon.stub().callsArg(1);
        bcrypt.genSaltSync = sinon.stub();
        bcrypt.hashSync = sinon.stub();
        res.send = sinon.spy();
    });

    describe('when submitting valid data,', function() {

        beforeEach(function() {
            req.body = {username: 'new-user', password: 'new-password'};
            userStore.getUserByUsername.callsArg(1);
            bcrypt.genSaltSync.returns('new-salt');
            bcrypt.hashSync.returns('new-encrypted-password');
            user.register(req, res);
        });

        it('validates the submitted data', function() {
            assert(userRule.validateNewUser.calledWith({username: 'new-user', password: 'new-password'}));
        });

        it('create new salt value for password', function() {
            assert(bcrypt.genSaltSync.called);
        });

        it('encrypt password with salt value', function() {
            assert(bcrypt.hashSync.calledWith('new-password', 'new-salt'));
        });

        it('save user profile', function() {
            assert(userStore.save.calledWith({
                username: 'new-user',
                password: 'new-encrypted-password'
            }));
        });

        it('return success status code 202', function() {
            assert(res.send.calledWith(202));
        });
    });

    describe('when request is invalid,', function() {

        beforeEach(function() {
            req.body = {username: 'new-user', password: 'invalid-password'};
            userStore.getUserByUsername.callsArg(1);
            userRule.validateNewUser.throws({message: 'Invalid password'});
            user.register(req, res);
        });

        it('return error code and message', function() {
            assert(res.send.calledWith('Invalid password', 403));
        });

        it('does not call password methods', function() {
            assert(bcrypt.genSaltSync.notCalled);
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not save user data', function() {
            assert(userStore.save.notCalled);
        })
    });

    describe('when username already exists', function() {

        beforeEach(function() {
            req.body = {username: 'existing-user', password: 'new-password'};
            userStore.getUserByUsername.callsArgWith(1, {username: 'existing-user'});
            user.register(req, res);
        });

        it('return error code and message', function() {
            assert(res.send.calledWith('Username existing-user is not available.', 403));
        });

        it('does not call password methods', function() {
            assert(bcrypt.genSaltSync.notCalled);
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not save user data', function() {
            assert(userStore.save.notCalled);
        })
    });
});