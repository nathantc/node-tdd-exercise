var userStore = require('./userStore'),
    encrypt = require('./encrypt');

exports.currentUser = function(req, res) {
    res.json({username: req.session.username || 'guest'});
};

exports.login = function(req, res) {

    function validateLogin() {
        if (notSessionInProgress())
            validateUsername();
        else
            res.send('User is already authenticated. Logout before attempting another login.', 409);
    }

    function notSessionInProgress() {
        return !req.session.username;
    }

    function validateUsername() {
        var profile = userStore.getUserByUsername(req.body.username);
        if (profile)
            validatePasswordWithProfile(profile)
        else
            sendInvalidUsernamePassword();
    }

    function validatePasswordWithProfile(profile) {
        var encryptedPassword = encrypt.password(req.body.password, profile.passwordSalt);
        if (encryptedPassword !== profile.password)
            sendInvalidUsernamePassword()
        else
            assignSessionAndSendValidLogin(profile.username);
    }

    function assignSessionAndSendValidLogin(username) {
        req.session.username = username;
        res.send(202);
    }

    function sendInvalidUsernamePassword() {
        res.send('Invalid username or password.', 403);
    }

    validateLogin();
};

exports.logout = function(req, res) {
    req.session = null;
    res.send(202);
};

exports.register = function(req, res) {
    console.log(req);
};