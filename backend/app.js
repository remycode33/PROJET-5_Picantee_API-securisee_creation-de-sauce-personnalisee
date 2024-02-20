const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // récupération de la bibliothèque 'path' pour manipuler les chemins d'accés
const helmet = require('helmet'); // module de sécurité http pour ajouter des headers qui améliore la sécurité web
const rateLimit = require('express-rate-limit'); // récupère express-rate-limit pour éviter les brutes forces

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const apiLimiter = rateLimit({ // protection contre le bruteforce en limitant les requetes
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // Limite chaque IP à 50 requêtes par `window` (ici, par 15 minutes)
	standardHeaders: true,
	legacyHeaders: false,
})

require('dotenv').config(); // permet de récupérer les variables d'environnements

mongoose.set('strictQuery', false); //warning Mongoose : deprecation

mongoose.connect(process.env.DBatlas, // connexion à notre DB en utilisant la variable d'env.
    { useNewUrlParser: true,
    useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échoué !'));

const app = express();

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); 

app.use(express.json()); // ajout du middleware express.json afin d'extraire le BODY des requetes

app.use((req, res, next) => { // Contourner les erreurs de sécurité CORS (cross origine)
    res.setHeader('Access-Control-Allow-Origin', '*'); //toutes origine authorisées
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');//routes autorisées
    next();
  });

app.use('/api/auth/login', apiLimiter); //utilise la limite de requête sur la route login

app.use('/images', express.static(path.join(__dirname, 'images'))); //utilisation de .static pour charger des fichiers du folder 'images'

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;