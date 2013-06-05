var user = require('../lib/user'),
    userRule = require('../lib/userRule'),
    userStore = require('../lib/userStore'),
    bcrypt = require('bcrypt'),
    sinon = require('sinon'),
    assert = require('assert');

describe('user', function() {
    describe('.register:', function() {
        
        var req = {},
            res = {send: function() {}};

        beforeEach(function() {
            userRule.validateNewUser = sinon.stub();
            userStore.getUserByUsername = sinon.stub().returns(null);
            userStore.save = sinon.spy();
            res.send = sinon.spy();
        });

        afterEach(function() {
            userStore.save.reset();
            bcrypt.genSaltSync.reset();
            bcrypt.hashSync.reset();
        });

        describe('when submitting valid data,', function() {

            beforeEach(function() {
                req.body = {username: 'new-user', password: 'new-password'};
                bcrypt.genSaltSync = sinon.stub().returns('new-salt');
                bcrypt.hashSync = sinon.stub().returns('new-encrypted-password');
                user.register(req, res);
            });

            it('validateNewUser request data', function() {
                assert(userRule.validateNewUser.calledWith({username: 'new-user', password: 'new-password'}));
            });

            it('create new salt value for user', function() {
                assert(bcrypt.genSaltSync.calledWith(10));
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

        describe('when saving user profile,', function() {

            beforeEach(function() {
                req.body = {username: 'submitted-username', password: 'submitted-password'};
                bcrypt.genSaltSync = sinon.stub().returns('salt-for-submitted-password');
                bcrypt.hashSync = sinon.stub().returns('encrypted-password-for-submitted-password');
                user.register(req, res);
            });

            it('save the submitted data', function() {
                assert(userStore.save.calledWith({
                    username: 'submitted-username',
                    password: 'encrypted-password-for-submitted-password'
                }));
            });
        });

        describe('when request is invalid,', function() {

            beforeEach(function() {
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
                userStore.getUserByUsername.returns({username: 'existing-user'});
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
});