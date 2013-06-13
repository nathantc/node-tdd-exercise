var user = require('../lib/user'),
    userStore = require('../lib/userStore'),
    bcrypt = require('bcrypt'),
    assert = require('assert'),
    sinon = require('sinon');

describe('user.login:', function() {
    var req, res;

    beforeEach(function() {
        req = { session: {} };
        res = { send: function() {}};
        res.send = sinon.spy();

        userStore.getUserByUsername = sinon.stub();
        bcrypt.compareSync = sinon.stub();
    });

    afterEach(function() {
        res.send.reset();
        userStore.getUserByUsername.reset();
        bcrypt.compareSync.reset();
    });

    describe('when submitting valid credentials, it', function() {

        beforeEach(function() {
            userStore.getUserByUsername.callsArgWith(1, { username: 'profile-username', passwordSalt: 'password-salt', password: 'hashed-password'});
            bcrypt.compareSync.returns(true);

            req.body = { username: 'valid-username', password: 'valid-password'};
            user.login(req, res)
        });

        it('retrieves user information for submitted username', function() {
            assert(userStore.getUserByUsername.calledWith('valid-username'));
        });

        it('compares submitted password with hashed password', function() {
            assert(bcrypt.compareSync.calledWith('valid-password', 'hashed-password'));
        });

        it('assigns the "profile" username to session', function() {
            assert.equal('profile-username', req.session.username);
        });

        it('returns successful 202 status code', function() {
            assert(res.send.calledWith(202));
        })
    });

    describe('when submitting an INVALID password, it', function() {

        beforeEach(function() {
            userStore.getUserByUsername.callsArgWith(1,{ username: 'valid-username', passwordSalt: 'password-salt', password: 'hashed-password'});
            bcrypt.compareSync.returns(false);
            req.body = { username: 'valid-username', password: 'invalid-password'};
            user.login(req, res);
        });

        it('retrieves user information for submitted username', function() {
            assert(userStore.getUserByUsername.calledWith('valid-username'));
        });

        it('compares submitted password with hashed password', function() {
            assert(bcrypt.compareSync.calledWith('invalid-password', 'hashed-password'));
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
            userStore.getUserByUsername.callsArgWith(1, null);
            bcrypt.hashSync = sinon.spy();
            req.body = { username: 'invalid-username'};
            user.login(req, res);
        });

        it('retrieves user information for submitted username', function() {
            assert(userStore.getUserByUsername.calledWith('invalid-username'));
        });

        it('encrypts submitted password using user salt value', function() {
            assert(bcrypt.hashSync.notCalled);
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
            bcrypt.hashSync = sinon.spy();
            req.session = {username: 'already-authenticated'};
            req.body = { username: 'valid-username', password: 'valid-password'};
            user.login(req, res);
        });

        it('does not retrieve user information for submitted username', function() {
            assert(userStore.getUserByUsername.notCalled);
        });

        it('does not encrypt submitted password using user salt value', function() {
            assert(bcrypt.hashSync.notCalled);
        });

        it('does not assign values to session', function() {
            assert.equal('already-authenticated', req.session.username);
        });

        it('returns failed error code 409', function() {
            assert(res.send.calledWith('User is already authenticated. Logout before attempting another login.', 409));
        });
    });
});