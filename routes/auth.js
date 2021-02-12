const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success', 'Successfuly Logged out.');
  res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  successFlash: `Successfully Logged In.`,
  failureRedirect: '/auth/login',
  failureFlash: `Email or password is incorrect. Please try again.`
}));

router.post('/signup', async(req, res) => {
  const { email, name, password } = req.body;

  try {
    const [user, created] = await db.user.findOrCreate({
      where: { email },
      defaults: { name, password }
    });

    if (created) {
      const successObject = {
        successRedirect: '/',
        successFlash: `Welcome ${user.name}. Account created successfuly`
      }
      // password authenicate
      passport.authenticate('local', successObject)(req, res);
    } else {
      req.flash('error', 'Email already exists');
      res.redirect('/auth/signup');
    }
  } catch (error) {
    console.log('\n############## ERROR:\n');
    console.log('An error has occured when accessing the database: ');
    console.log(error);
    console.log('\n############## END \n');  
  
    req.flash('error', 'Email or password is incorrect. Please try again');
    res.redirect('/auth/signup');
  }
});

module.exports = router;
