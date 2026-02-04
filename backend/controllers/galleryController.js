const { query } = require('../config/db');

exports.getGallery = async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM gallery ORDER BY year DESC, created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.uploadGalleryItem = async (req, res) => {
    const { title, description, image_url, year } = req.body;
    console.log('Incoming Gallery Upload Request:', { title, year, image_size: image_url ? image_url.length : 0 });

    if (!image_url || !year) {
        return res.status(400).json({ message: 'Please provide image and year' });
    }
    try {
        const sql = 'INSERT INTO gallery (title, description, image_url, year, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const { rows } = await query(sql, [title, description, image_url, year, req.user.name]);
        console.log('Successfully inserted gallery item:', rows[0].id);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Gallery Insert Error:', err.message);
        res.status(500).json({ message: 'Server Error', details: err.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM gallery WHERE id = $1', [id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
