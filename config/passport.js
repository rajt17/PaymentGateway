const passport=require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User=require('../model/user');


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
module.exports = {
    localAuth: function (passport) {
        passport.use(
            new LocalStrategy((username, password, done) => {
                console.log(username);
                console.log(password);
                User.findOne({ email: username }).then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }
                    if(user.password === password)
                    {
                        return done(null, user);
                    }
                    else
                    {
                        return done(null, false, { message: 'That password is not Correct' });
                    }
                });
            })
        );
    }
}