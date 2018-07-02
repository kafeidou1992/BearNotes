var express = require('express');
var router = express.Router();
var passport = require('passport')
var GitHubStrategy = require('passport-github').Strategy

/* login. */
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(id, done) {
    done(null, id);
});

passport.use(new GitHubStrategy({
    clientID: 'fb279671dfc9acbe68d1',
    clientSecret: 'bea297d59d98d1ea3497b6342b2b96aa8fc8713d',
    callbackURL: "http://localhost:8080/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    done(null, profile);
  }
));

router.get('/github',
  passport.authenticate('github'));
 
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req)
    req.session.user = {
        userid: req.user._json.id,
        username: req.user._json.login,
        avatar: req.user._json.avatar_url,
        provider: req.user.provider
    }
    console.log(req.session.user)
    res.redirect('/');
  });

router.get('/logout',function(req,res){
    req.session.destroy()
    res.redirect('/')
});


module.exports = router;