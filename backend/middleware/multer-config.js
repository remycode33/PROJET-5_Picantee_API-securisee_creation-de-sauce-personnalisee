const multer = require('multer'); // package de gestion des fichiers

const MIME_TYPES = { // dictionnaire de fichiers authorisés
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// 
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images'); // indique où se trouvent les fichiers stockés
    },
    filename: (req, file, callback) => {

        const name = file.originalname.split(' ').join('_'); // suppresion des espace dans le nom
        const extension = MIME_TYPES[file.mimetype]; // attribution de l'extension en fct du type de fichier
        callback(null, name + Date.now() + '.' + extension); //implémentation dans le nom, de  l'heure d'ajout pour rendre le fichier unique
    }
});


module.exports = multer({storage: storage}).single('image'); //permet d'exporter selon la méthode multer des fichiers de type image uniquement