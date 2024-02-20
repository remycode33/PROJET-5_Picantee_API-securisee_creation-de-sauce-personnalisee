const express = require('express');
let router = express.Router(); // creation de notre routeur

let auth = require('../middleware/auth');
let multer = require('../middleware/multer-config');
let sauce = require('../controllers/sauce');


router.post('/', auth, multer, sauce.createSauce); // route authentifiée pour créer une sauce

router.put('/:id', auth, multer, sauce.modifySauce); // route authentifiée pour modifier une sauce

router.delete('/:id', auth, sauce.deleteSauce); // route authentifiée pour supprimer une sauce

router.get('/:id', auth, sauce.getOneSauce); // route authentifiée pour récupérer une sauce

router.get('/', auth, sauce.getAllSauce); // route authentifiée pour récupérer toutes les sauces

router.post('/:id/like', auth, sauce.likeDislikeSauce); // route authentifiée pour ajouter un like ou un dislike


module.exports = router;