const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

const User = require('../models/user');
const Token = require('../models/token');

exports.user_get_user_by_email = (req, res, next) => {
   User.findOne({ email: req.params.email })
      .select(
         "_id firstName lastName address mobile phone imageUrl"
      )
      .exec()
      .then(user => {
         if (user) {
            console.log(user);
            res.status(200).json({
               message: 'Success',
               user: user
            });
         }
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.user_signup = (req, res, next) => {
   User.find({ email: req.body.email })
      .exec()
      .then(user => {
         if (user.length >= 1) {
            return res.status(409).json({
               message: 'Email already registered.',
            });
         } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
               if (err) {
                  return res.status(500).json({
                     error: err,
                  });
               } else {
                  const newUser = new User({
                     _id: mongoose.Types.ObjectId(),
                     email: req.body.email,
                     password: hash,
                     firstName: req.body.firstName,
                     lastName: req.body.lastName,
                     role: req.body.role,
                     address: req.body.address,
                     mobile: req.body.mobile,
                     phone: req.body.phone,
                     imageUrl: req.body.imageUrl
                  });
                  newUser
                     .save()
                     .then(result => {
                        console.log(result._id);

                        // Create a verification token for this user
                        const token = new Token({
                           _userId: newUser._id,
                           token: crypto.randomBytes(16).toString('hex'),
                        });
                        // Save the verification token
                        token.save(function(err) {
                           if (err) {
                              return res.status(500).json({ msg: err.message });
                           }

                           let customlink =
                              process.env.DOMAIN +
                              '/verifyAccount/' +
                              token.token;
                           // Send the email
                           sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                           sgMail.setSubstitutionWrappers('{{', '}}');
                           const msg = {
                              to: newUser.email,
                              from: 'sha0143@hotmail.com',
                              subject: 'Account Verification Token',
                              templateId:
                                 'ed1ea2ce-3394-422c-99a4-17e06450d98d',
                              substitutions: {
                                 verificationLink: customlink,
                                 text:
                                    'Please verify your account by clicking the following link: \n\n' +
                                    customlink,
                              },
                           };
                           (async () => {
                              try {
                                 await sgMail.send(msg);
                                 res.status(201).json({
                                    message:
                                       'A verification email has been sent to ' +
                                       newUser.email +
                                       '.',
                                 });
                              } catch (err) {
                                 console.error(err.toString());
                                 return res
                                    .status(500)
                                    .json({ error: err.message });
                              }
                           })();
                        });
                     })
                     .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                     });
               }
            });
         }
      });
};

exports.user_login = (req, res, next) => {
   User.find({ email: req.body.email })
      .exec()
      .then(user => {
         if (user.length < 1) {
            return res.status(400).json({
               message: 'Authentication failed',
            });
         }
         if (user[0].isVerified === false) {
            return res.status(400).json({
               message: 'Your account has not been verified.',
            });
         }

         bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
               return res.status(400).json({
                  message: 'Authentication failed',
               });
            }
            if (result) {
               const token = jwt.sign(
                  {
                     email: user[0].email,
                     userId: user[0]._id,
                  },
                  process.env.JWT_KEY,
                  {
                     expiresIn: '1h',
                  },
               );
               return res.status(200).json({
                  message: 'Auth successful',
                  token: token,
                  role: user[0].role,
               });
            }
            res.status(400).json({
               message: 'Authentication failed',
            });
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.user_delete = (req, res, next) => {
   User.deleteOne({ _id: req.params.userId })
      .exec()
      .then(result => {
         console.log(result);
         res.status(200).json({
            message: 'User deleted',
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.user_verify = (req, res, next) => {
   Token.findOne({ token: req.params.token }, function (err, token) {
      // Find a matching token
      if (!token) return res.status(400).json({ type: 'not-verified', message: 'We were unable to find a valid token. Your token my have expired.' });
      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {
         if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });
         if (user.isVerified) return res.status(400).json({ type: 'already-verified', message: 'This user has already been verified.' });

         // Verify and save the user
         user.isVerified = true;
         user.save(function (err) {
            if (err) { return res.status(500).json({ msg: err.message }); }
            res.status(200).json({message: "The account has been verified. Please log in."});
         });
      })

   });
};

exports.user_resend_token = (req, res, next) => {
   User.findOne({ email: req.body.email })
      .exec()
      .then(user => {
         if (!user) return res.status(400).json({ message: 'We were unable to find a user with that email.' });
         if (user.isVerified) return res.status(400).json({ message: 'This account has already been verified. Please log in.' });
         // Create a verification token, save it, and send email
         let token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

         // Save the token
         token.save(function (err) {
            if (err) {
               return res.status(500).json({ msg: err.message });
            }
            let customlink =
               process.env.DOMAIN +
               '/verifyAccount/' +
               token.token;
            // Send the email
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.setSubstitutionWrappers('{{', '}}');
            const msg = {
               to: user.email,
               from: 'sha0143@hotmail.com',
               subject: 'Account Verification Token',
               templateId:
                  'ed1ea2ce-3394-422c-99a4-17e06450d98d',
               substitutions: {
                  verificationLink: customlink,
                  text:
                     'Please verify your account by clicking the following link: \n\n' +
                     customlink,
               },
            };
            (async () => {
               try {
                  await sgMail.send(msg);
                  res.status(201).json({
                     message:
                        'A verification email has been sent to ' +
                        user.email +
                        '.',
                  });
               } catch (err) {
                  console.error(err.toString());
                  return res
                     .status(500)
                     .json({ error: err.message });
               }
            })();
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.user_forgot_password = (req, res, next) => {
   User.findOne({ email: req.body.email })
      .exec()
      .then(user => {
         if (!user) return res.status(400).json({ message: 'We were unable to find a user with that email.' });
         let token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
         // Save the token
         token.save(function (err) {
            if (err) {
               return res.status(500).json({ msg: err.message });
            }
            let customlink = process.env.DOMAIN + '/resetPassword/' + token.token;
            // Send the email
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            sgMail.setSubstitutionWrappers('{{', '}}');
            const msg = {
               to: user.email,
               from: 'sha0143@hotmail.com',
               subject: 'Reset Password',
               templateId:
                  'ed1ea2ce-3394-422c-99a4-17e06450d98d',
               substitutions: {
                  verificationLink: customlink,
                  text:
                     'Please reset your password by clicking the following link: \n\n' +
                     customlink,
               },
            };
            (async () => {
               try {
                  await sgMail.send(msg);
                  res.status(201).json({
                     message:
                        'A password reset email has been sent to ' +
                        user.email +
                        '.',
                  });
               } catch (err) {
                  console.error(err.toString());
                  return res
                     .status(500)
                     .json({ error: err.message });
               }
            })();
         });
      })
      .catch(err => {
         console.log(err);
         res.status(500).json({ error: err });
      });
};

exports.user_reset_password = (req, res, next) => {
   Token.findOne({ token: req.params.token }, function (err, token) {
      // Find a matching token
      if (!token) return res.status(400).json({ message: 'Your link my have expired. Please apply again.' });
      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {
         if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });
         // encrypt password
         bcrypt.hash(req.body.password, 10, (err, hash) => {
            // save the user
            user.password = hash;
            user.save(function (err) {
               if (err) { return res.status(500).json({ msg: err.message }); }
               res.status(200).json({message: "Password reset successful"});
            });
         });
      })
   });
};

