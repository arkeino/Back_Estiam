// Import des modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Initialisation de l'application Express
const app = express();
app.use(express.json());

// Configuration de multer pour le téléchargement des images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://localhost:27017/gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Définition du schéma MongoDB pour les images
const imageSchema = new mongoose.Schema({
  filename: String,
  description: String,
  tags: [String],
  uploadedAt: { type: Date, default: Date.now }
});
const Image = mongoose.model('Image', imageSchema);

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes pour l'authentification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

});

// Routes pour les images
app.post('/images', authenticateToken, upload.single('image'), async (req, res) => {
  const { description, tags } = req.body;
  const image = new Image({
    filename: req.file.filename,
    description: description,
    tags: tags.split(',').map(tag => tag.trim())
  });
  await image.save();
  res.status(201).send('Image uploaded successfully');
});

app.get('/images', async (req, res) => {
  const images = await Image.find();
  res.json(images);
});


// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
