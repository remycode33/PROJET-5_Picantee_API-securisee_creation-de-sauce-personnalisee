const jwt = require('jsonwebtoken');

//FCT POUR L'AUTH PAR TOKEN
module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1]; // récupération du TOKEN dans la requete d'authorization
        let decodedToken = jwt.verify(token, process.env.TKN); // decryptage du TOKEN avec la clé de decryptage (provenant de la variable d'environnement)
        let userId = decodedToken.userId; // on accède à l'ID user qui etait codé dans le token.
        req.auth = { // implémente l'obj auth
            userId: userId
        };
        next();
    } catch {

        res.status(401).json({ // gestion des erreurs si pb pendant l'auth
            error: new Error('Invalid request !')
        });
    }
};