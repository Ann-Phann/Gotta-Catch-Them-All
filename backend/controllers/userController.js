const bcrypt = require('bcrypt');
const db = require('../db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const user_id = req.session.user?.user_id;
  const inputPath = req.file.path;
  const outputFilename = 'cropped-' + req.file.filename;
  const outputPath = path.join('uploads', outputFilename);

  try {
    const image = sharp(inputPath);

    const metadata = await image.metadata();
    const size = Math.min(metadata.width, metadata.height);

    // Process the image: crop to square, resize to 200x200, set quality, and save
    await image
      .extract({
        left: Math.floor((metadata.width - size) / 2),
        top: Math.floor((metadata.height - size) / 2),
        width: size,
        height: size
      })
      .resize(200, 200)
      .jpeg({ quality: 80 })
      .toFile(outputPath);


    fs.unlinkSync(inputPath);

    // Update the user's avatar path in the database
    await db.query('UPDATE User SET avatar = ? WHERE user_id = ?', [outputFilename, user_id]);

    res.json({ message: 'Avatar uploaded', filename: outputFilename });
  } catch (error) {
    console.error('Avatar upload failed:', error);
    res.status(500).json({ error: 'Image processing failed' });
  }
};

const getAccount = async (req, res) => {
  const user_id = req.session.user?.user_id;
  if (!user_id) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const [rows] = await db.query(
      'SELECT user_name, avatar, current_points, role FROM User WHERE user_id = ?',
      [user_id]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prepend URL to avatar if necessary (or just send as stored)
    if (user.avatar && !user.avatar.startsWith('http')) {
      user.avatar = `http://localhost:8080/uploads/${user.avatar}`;
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


const updateAccount = async (req, res) => {
  const { user_name, old_password, password } = req.body;
  const { user } = req.session;
  const user_id = user.user_id;

  try {
    const [rows] = await db.query('SELECT hash_password AS hash FROM User WHERE user_id = ?', [user_id]);
    const dbUser = rows[0];

    if (!dbUser) {
      // This should ideally not happen if a user is logged in and session is valid
      // but it's a good safeguard.
      return res.status(404).json({ error: 'User not found in database.' });
    }

    const fields = [], params = [];

    if (user_name) {
      // Prevent changing to an already taken username
      const [existing] = await db.query('SELECT * FROM User WHERE user_name = ? AND user_id != ?', [user_name, user_id]);
      if (existing.length > 0) return res.status(409).json({ error: 'Username already taken.' });

      fields.push('user_name = ?');
      params.push(user_name);
    }

    if (password) {
      if (!old_password) {
        return res.status(400).json({ error: 'Old password is required to change password.' });
      }

      const match = await bcrypt.compare(old_password, dbUser.hash);
      if (!match) return res.status(403).json({ error: 'Old password is incorrect' });

      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push('hash_password = ?');
      params.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const query = `UPDATE User SET ${fields.join(', ')} WHERE user_id = ?`;
    params.push(user_id);
    await db.query(query, params);

    if (user_name) {
        req.session.user.user_name = user_name;
    }

    // Fetch the updated user data after the changes have been applied to the database
    const [updatedUserRows] = await db.query(
      'SELECT user_id, user_name, current_points, avatar FROM User WHERE user_id = ?',
      [user_id]
    );
    const updatedUser = updatedUserRows[0];

    if (updatedUser && updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
        updatedUser.avatar = `http://localhost:8080/uploads/${updatedUser.avatar}`;
    }

    res.json({
        message: 'Account updated successfully.',
        user: updatedUser
    });

    //res.json({ message: 'Account updated successfully.' });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Error updating account.' });
  }
};

module.exports = {
  uploadProfilePicture,
  getAccount,
  updateAccount,
};
