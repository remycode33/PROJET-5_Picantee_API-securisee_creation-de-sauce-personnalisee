const express = require('express');

const router = express.Router(); // creation du routeur
const userCtrl = require('../controllers/user'); // récupère nos fonctions liées aux users (signup, login)

router.post('/signup', userCtrl.signup); // ajout des controlleurs aux routes
router.post('/login', userCtrl.login);

module.exports = router;
