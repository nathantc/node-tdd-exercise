var user = require('../lib/user'),
    userStore = require('../lib/userStore'),
    encrypt = require('../lib/encrypt'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user', function() {
    describe('.login:', function() {
        var req, res;

        beforeEach(function() {
            req = { session: {} };
            res = { send: function() {}};
            res.send = sinon.spy();
        });

        afterEach(function() {
            res.send.reset();
            userStore.getUserByUsername.reset();
            encrypt.password.reset();
        });

        describe('when submitting valid credentials, it', function() {

            beforeEach(function() {
                userStore.getUserByUsername = sinon.stub().returns({ username: 'profile-username', passwordSalt: 'password-salt', password: 'encrypted-password'});
                encrypt.password = sinon.stub().returns('encrypted-password');
                req.body = { username: 'valid-username', password: 'valid-password'};
                user.login(req, res)
            });

            it('retrieves user information for submitted username', function() {
                assert(userStore.getUserByUsername.calledWith('valid-username'));
            });

            it('encrypts submitted password using user salt value', function() {
                assert(encrypt.password.calledWith('valid-password', 'password-salt'));
            });

            it('assigns the "profile" username to session', function() {
                assert.equal('profile-username', req.session.username);
            });

            it('returns successful 202 status code', function() {
                assert(res.send.calledWith(202));
            })
        });

        describe('when submitting INVALID password, it', function() {

            beforeEach(function() {
                userStore.getUserByUsername = sinon.stub().returns({ username: 'valid-username', passwordSalt: 'password-salt', password: 'encrypted-password'});
                encrypt.password = sinon.stub().returns('invalid-encrypted-password');
                req.body = { username: 'valid-username', password: 'invalid-password'};
                user.login(req, res);
            });

            it('retrieves user information for submitted username', function() {
                assert(userStore.getUserByUsername.calledWith('valid-username'));
            });

            it('encrypts submitted password using user salt value', function() {
                assert(encrypt.password.calledWith('invalid-password', 'password-salt'));
            });

            it('does not assign values to session', function() {
                assert.equal(undefined, req.session.username);
            });

            it('returns failed error code 403', function() {
                assert(res.send.calledWith('Invalid username or password.', 403));
            });
        });

        describe('when submitting INVALID username', function() {
            beforeEach(function() {
                userStore.getUserByUsername = sinon.stub().returns(null);
                encrypt.password = sinon.spy();
                req.body = { username: 'invalid-username'};
                user.login(req, res);
            });

            it('retrieves user information for submitted username', function() {
                assert(userStore.getUserByUsername.calledWith('invalid-username'));
            });

            it('encrypts submitted password using user salt value', function() {
                assert(encrypt.password.notCalled);
            });

            it('does not assign values to session', function() {
                assert.equal(undefined, req.session.username);
            });

            it('returns failed error code 403', function() {
                assert(res.send.calledWith('Invalid username or password.', 403));
            });
        });

        describe('when user already authenticated', function() {
            beforeEach(function() {
                userStore.getUserByUsername = sinon.spy();
                encrypt.password = sinon.spy();
                req.session = {username: 'already-authenticated'};
                req.body = { username: 'valid-username', password: 'valid-password'};
                user.login(req, res);
            });

            it('does not retrieve user information for submitted username', function() {
                assert(userStore.getUserByUsername.notCalled);
            });

            it('does not encrypt submitted password using user salt value', function() {
                assert(encrypt.password.notCalled);
            });

            it('does not assign values to session', function() {
                assert.equal('already-authenticated', req.session.username);
            });

            it('returns failed error code 409', function() {
                assert(res.send.calledWith('User is already authenticated. Logout before attempting another login.', 409));
            });
        });
    });
});