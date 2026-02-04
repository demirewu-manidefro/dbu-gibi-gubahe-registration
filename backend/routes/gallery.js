const express = require('express');
const router = express.Router();
const { getGallery, uploadGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getGallery);
router.post('/', auth, uploadGalleryItem);
router.delete('/:id', auth, deleteGalleryItem);

module.exports = router;
