const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../models/User');

//enregistre un nouvel utilisateur dans la base de données
exports.signup = (req, res, next) => {
  let test_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/
  let test_password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/

  if (!(req.body.email.match(test_email))) {
    res.statusMessage = 'Email invalide';
    res.status(401).end();
  }

  if (!(req.body.password.match(test_password))) {
    res.statusMessage = 'Le mot de passe doit contenir entre 6 et 20 caractères, au minimum une minuscule, une majuscule, un nombre et un caractère spécial !';
    res.status(401).end();
  }

  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

//connecte un utilisateur
exports.login = (req, res, next) => {
  User.findOne({
    email: req.body.email
  })
    .then(user => {
      if (!user) {
        res.statusMessage = 'Utilisateur non trouvé !';
        res.status(401).end();
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            res.statusMessage = 'Mot de passe incorrect !';
            res.status(401).end();
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};