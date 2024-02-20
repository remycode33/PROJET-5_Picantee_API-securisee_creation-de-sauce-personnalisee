const Sauce = require("../models/ModelsSauces"); // importation du Schema de sauce

const fs = require("fs"); // importation du package 'file systeme' pour pouvoir modifier un fichier dans la DB

// FCT CREER UNE SAUCE
exports.createSauce = (req, res) => {
  let sauceObject = JSON.parse(req.body.sauce); // parse la requete de la nvlle sauce en OBJ JS

  delete sauceObject._id; // suppression de l'ID généré automatiq. par MOONGOOSE

  let sauce = new Sauce({
    ...sauceObject, // on copy le body de la req dans notre nvlle ressource sauce
    likes: 0, // value : 1/0/-1
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],

    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // implémentation de l'URL de l'img
  });

  sauce
    .save() // on sauvegarde la nvlle ressource dans la BDD
    .then(() => {
      res.status(201).json({ message: "Sauce enregistrée !" });
    })
    .catch((error) => res.status(400).json({ error }));
};

// FCT MODIFIER UNE SAUCE
exports.modifySauce = (req, res, next) => {
  // l;
  // u;
  // a;
  if (req.file) {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      if (req.auth.userId !== sauce.userId) {
        // seulement les req authorisée peuvent faire la modif
        res.status(403).json({ message: `Non autorisé !` });
      } else {
        let filename = sauce.imageUrl.split("/images/")[1]; // on supprime le segment "/images/" et on récupère se qui trouve après. (Split renvoie un tableau de la string decomposée)
        fs.unlink(`images/${filename}`, () => console.log("Image supprimée !")); // on utilise le segment de chemin d'image récupéré pour accéder et supprimer l'img de la DB
      }
    });
  }

  let sauceObject = req.file
    ? {
        // si il y a un fichier alors :

        ...JSON.parse(req.body.sauce), // on récupère les infos de la sauce sous forme de string qu'il faut donc parser en obj JS

        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      } //et on modifie l'url de la nvlle img
    : { ...req.body }; // si il n'y a pas de fichier transmis alors on récup l'objet qui se trouve directement dans le body de la req

  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  ) // update de la sauce dans la DB

    .then(() => res.status(200).json({ message: "Article modifiée !" }))

    .catch((error) => res.status(400).json({ error: error }));
};

// FCT SUPPRIMER UNE SAUCE
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id }) // on récupère notre ressource dans la DB
    .then((sauce) => {
      if (req.auth.userId !== sauce.userId) {
        //
        res.status(403).json({ message: `Non autorisé !` });
      } else {
        let filename = sauce.imageUrl.split("/").at(-1);
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

//FCT RECUPERER UNE SAUCE
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //récup l'id dans l'url de la requête
    .then((sauce) => {
      res.status(200).json(sauce);
    }) //retourne la sauce (en json) grâce à l'id obtenu plus haut
    .catch((error) => {
      res.status(404).json({ error });
    }); //sinon retourne une erreur
};

// FCT RECUPERER PLUSIEURS SAUCE
exports.getAllSauce = (req, res, next) => {
  Sauce.find() // comme pas d'arg renvoie toutes les sauces
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};

// FCT LIKE & DISLIKE SAUCE : plsr cas Like/dislike/retire like/retire dislike
exports.likeDislikeSauce = async (req, res) => {
  let currentSauce = await Sauce.findOne({ _id: req.params.id }); // recupère la ressource Sauce à like/dislike pour avoir son tableau d'usersLiked
  let like = req.body.like; //recupère les like dans le body (0 initialement)
  let userId = req.auth.userId; // récupère l'userID du token qui est plus spure que le userId du body
  if (
    like === 1 &&
    !currentSauce.usersLiked.includes(userId) &&
    !currentSauce.usersDisliked.includes(userId)
  ) {
    // CAS USER LIKE :

    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersLiked: userId }, $inc: { likes: 1 } }
    ) // modification de la sauce dans la DB  : push or inc (opérateur mongoDB) permettent respectivement d'ajouter l'user qui a like dans le tb des likes et d'incrémenter un like au compteur

      .then(() =>
        res.status(200).json({ message: "Votre like a été pris en compte !" })
      ) // retour de la reponse réussie
      .catch((error) => res.status(400).json({ error: error }));
  } else if (
    like === -1 &&
    !currentSauce.usersLiked.includes(userId) &&
    !currentSauce.usersDisliked.includes(userId)
  ) {
    // CAS USER DISLIKE :

    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersDisliked: userId }, $inc: { dislikes: 1 } }
    ) // modif de la sauce dans la DB (push or inc) ajoute l'user dans le tb des dislikes

      .then(() =>
        res
          .status(200)
          .json({ message: "Votre dislike a été pris en compte !" })
      ) // retour de la réponse réussie
      .catch((error) => res.status(400).json({ error: error }));
  } else if (like === 0) {
    //CAS USER REMOOVE LIKE/DISLIKE
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        //if REMOVE LIKE

        if (sauce.usersLiked.includes(userId)) {
          // on vérifie le tableau des likes pour voir si l'user a like

          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: userId } }
          ) // maj de la sauce (pull or inc) supprime l'user du tableau des like

            .then(() =>
              res
                .status(200)
                .json({ message: "Votre like à bien été supprimé !" })
            ) // retour de la réponse réussie

            .catch((error) => res.status(400).json({ error: error }));
        }
        // if REMOVE DISLIKE
        if (sauce.usersDisliked.includes(userId)) {
          // on vérifie le tableau des dislikes pour voir si l'user a dislike

          Sauce.updateOne(
            { _id: req.params.id },
            { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } }
          ) //maj de la sauce (pull or inc)  supprime l'user du tableau des dislike

            .then(() =>
              res
                .status(200)
                .json({ message: "Votre dislike à bien été supprimé !" })
            ) // retour de la réponse réussie

            .catch((error) => res.status(400).json({ error: error }));
        }
      })

      .catch((error) => res.status(500).json({ error: error })); // erreur 500 = Internal Serveur Erreur : la demande n'a pas pu être traité normalement par le serveur
  } else if (
    currentSauce.usersLiked.includes(userId) ||
    currentSauce.usersDisliked.includes(userId)
  ) {
    res.status(403).json({ message: "forbidden" });
  }
};
