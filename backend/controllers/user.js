const bcrypt = require('bcrypt'); //chiffrage de MDP dans DB
const jwt = require('jsonwebtoken'); // requete authentifiée par TOKEN
const emailValidator = require('email-validator');//verifier si l'email est valid
const passwordValidator = require('password-validator');//utiliser un schéma de MDP
const User = require('../models/user');

const passwordSchema = new passwordValidator(); //schéma de MDP pour compliquer un bruteforce

passwordSchema
  .is()
  .min(8)
  .is()
  .max(20)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

// FCT CREATION COMPTE
exports.signup = (req, res, next) => {
  if(!emailValidator.validate(req.body.email)) { // .validate() verifie si un email est valide.
    return res.status(401).json({ message: 'Veuillez saisir une adresse email valide'});
  }

  if(!passwordSchema.validate(req.body.password)) { // .validate() match la MDP schema avec le MDP provenant de la req
    return res.status(401).json({ message: "Le mot de passe ne doit pas contenir d'espace et doit avoir une longueur entre 8 et 20 caractères contenant au minimum 1 chiffre, 1 minuscule et 1 majuscule"})
  }

    bcrypt.hash(req.body.password, 10) // hashage du MDP 10X, retourne une promise
        .then(hash => {

            const user = new User({ //création d'un nouvel utilisateur
                email: req.body.email, // on assigne le mail de la req
                password: hash // on enregistre le MDP hashé
            });

            user.save()  // sauvegarde de l'user dans la DB, retourne une promise

                .then(() => res.status(201).json({ message: 'Utilisateur créé !'})) // retourne une response et un status OK
                .catch(error => res.status(400).json({ error }));
        })

        .catch(error => res.status(500).json({ error })); // erreur 500 = traitement serveur
};

// FCT CONNEXION A UN COMPTE EXISTANT
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email}) // on recupère l'identifiant de l'user dans la DB
        .then(user => {
            if (user === null || user === undefined) { // cas : on ne le trouve pas
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' }); // retourne un message d'erreur
            } else {
              
                bcrypt.compare(req.body.password, user.password) // bcrypt compare le MDP renseigné et celui de la DB
                    .then(valid => {
                        if (!valid) { // CAS : MDP non valide
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else { // CAS : MDP valide
                            res.status(200).json({ // objet nécessaire à l'authentification
                                userId: user._id, //recupération de l'user ID de la DB pour la conception du TOKEN ensuite
                                token: jwt.sign( // création du TOKEN sécurisé
                                    { userId: user._id },
                                    process.env.TKN, // clé de cryptage (dans la variable d'environnement)
                                    { expiresIn: '24h' } // délais de validité
                                )
                            });
                        }
                    })

                    .catch(error => res.status(500).json({ error }))
            }
        })

        .catch(error => res.status(500).json({ error }));
};