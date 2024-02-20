const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator'); // package pour empecher l'enregistrement multiple d'une même adresse mail (permet l'utilisation du plugin(uniqueValidator))

let userSchema = mongoose.Schema({  // création d'un schéma pour les users
    email: { type: String, require: true, unique: true }, // champs obligatoire et unique
    password: { type: String, require: true } // champs obligatoire
});

userSchema.plugin(uniqueValidator); // indique que userSchema doit prendre en compte la variable unique.

// exportation du schema pour l'appeler dans le controllers user.js
module.exports = mongoose.model('User', userSchema); // on rend le schema UserSchema utilisable dans mongoose avec comme nom : User.