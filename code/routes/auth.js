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
    clientID: '4f667940c9073c5dbffe',
    clientSecret: 'ae47556361ff5c13b74e76f992e06629bf85ffb6',
    callbackURL: "http://bearnotes.top/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

router.get('/github',
  passport.authenticate('github'));
 
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
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