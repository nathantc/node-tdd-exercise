var User = require('./userSchema').User,
    bcrypt = require('bcrypt');

exports.currentUser = function(req, res) {
    res.json({user: req.session.user || 'guest'});
};

exports.update = function(req, res) {

    User.findOne({username: req.session.user}, function(err, user) {
        if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
            var hashedPassword = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync());
            User.findOneAndUpdate({username: req.session.user, password:hashedPassword}, function(err, user) {
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
        User.findOne({username: req.body.username}, function(err, user) {
            if (err) {
                res.send('Error occurred retrieving user profile: ' + err, 500);
            } else {
                validateUser(user);
            }
        });
    else
        res.send('User is already authenticated. Logout before attempting another login.', 409);

};

exports.logout = function(req, res) {
    req.session = null;
    res.send(202);
};

exports.register = function(req, res) {

    User.findOne({username: req.body.username}, function(err, user) {
        if (typeof user === typeof undefined) {
            if (User.validPassword(req.body.password)) {
                var hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync());
                user = User.newUser({username: req.body.username, password: hashedPassword});
                user.save(function() {
                    res.send(202);
                });
            } else {
                res.send('Invalid password', 403)
            }
        } else {
            res.send('Username ' + req.body.username + ' is not available.', 403);
        }
    });

};


function sessionInProgress(req) {
    return req.session.user;
}
