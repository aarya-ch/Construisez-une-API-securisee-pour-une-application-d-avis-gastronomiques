const mongoose = require('mongoose');

const sauce_schema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, default: "http://localhost:3000/images/default.jpg" },
    heat: { type: Number, required: true },
    likes: { type: Number,default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: [] },
    usersDisliked: { type: [String], default: [] },
});

module.exports = mongoose.model('Sauce', sauce_schema);