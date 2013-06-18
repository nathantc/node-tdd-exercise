var userStore = require('./userStore'),
    userRule = require('./userRule'),
    bcrypt = require('bcrypt');

exports.currentUser = function(req, res) {
    res.json({user: req.session.user || 'guest'});
};

exports.update = function(req, res) {

    userStore.getUserByUsername(req.session.user, function(user) {
        if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
            var hashedPassword = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync());
            userStore.update(req.session.user, {password:hashedPassword}, function() {
                res.send(202);
            });
        } else {
            res.send('Current password is not valid', 403);
        }
    });
}

exports.login = function(req, res) {

    function validateUser(profile) {
        if (profile)
            validatePasswordWithProfile(profile)
        else
            sendInvalidUsernamePassword();
    }

    function validatePasswordWithProfile(user) {
        console.log(req.body.password, user.password)
        if (bcrypt.compareSync(req.body.password, user.password))
            assignSessionAndSendValidLogin(user.username)
        else
            sendInvalidUsernamePassword();
    }

    function assignSessionAndSendValidLogin(username) {
        req.session.user = username;
        res.send(202);
    }

    function sendInvalidUsernamePassword() {
        res.send('Invalid username or password.', 403);
    }

    if (!sessionInProgress(req))
        userStore.getUserByUsername(req.body.username, validateUser);
    else
        res.send('User is already authenticated. Logout before attempting another login.', 409);

};

exports.logout = function(req, res) {
    req.session = null;
    res.send(202);
};

exports.register = function(req, res) {

    function setResponse(err) {
        if (err) {
            res.send(err, 403);
        } else {
            res.send(202);
        }
    }

    function validateNewUser() {
        userRule.validateNewUser({username: req.body.username, password: req.body.password});
        var user = {
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync())
        }
        return user;
    }

    function validateUsername(user) {
        if (user) {
            setResponse('Username ' + req.body.username + ' is not available.');
        } else {
            try{
                var user = validateNewUser();
                userStore.save(user, setResponse);
            }
            catch(err) {
                res.send(err.message, 403);
            }
        }
    }

    userStore.getUserByUsername(req.body.username, validateUsername);

};


function sessionInProgress(req) {
    return req.session.user;
}
