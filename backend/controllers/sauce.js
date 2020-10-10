const Sauce = require('../models/Sauce');
const fs = require('fs');

// Strip une chaine en enlevant toutes les balises HTML
function stripHTML(text) {
    const regex = /(<([^>]+)>)/ig;
    return text.replace(regex, "");
}


// Strip toutes les propriété d'un objet
function stripAll(obj) {
    for (let key in obj) {
        obj[key] = stripHTML(obj[key] + "");
    }
}

// récupère toutes les sauces de la base de données
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// récupère une sauce de la base de données grâce à l'ID
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// crée une nouvelle sauce dans la base de données
exports.createSauce = (req, res, next) => {
    let sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    stripAll(sauceObject);
    

    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce ajoutée !' }))
        .catch(error => res.status(400).json({ error }));
};

// mettre à jour la sauce avec l'identifiant fourni
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }))
};

// supprime la sauce avec l'id fourni
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// définit le statut "j'aime" pour userID fourni
exports.likeDislike = (req, res) => {
    if (req.body.like == 1) {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } })
            .then(() => res.status(200).json({ message: 'Like ajouté' }))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like == 0) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.body.userId },
                    })
                        .then(() => { res.status(200).json({ message: 'Like retiré' }) })
                        .catch((error) => { res.status(400).json({ error: error }) })
                }

                if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.body.userId },
                    })
                        .then(() => { res.status(200).json({ message: 'Dislike retiré' }) })
                        .catch((error) => { res.status(400).json({ error: error }) })
                }
            })

    } else {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } })
            .then(() => res.status(200).json({ message: 'Dislike ajouté' }))
            .catch(error => res.status(400).json({ error }));
    };
};
