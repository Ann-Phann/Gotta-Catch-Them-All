const db = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// 1. Add a new user
exports.addUser = async (req, res) => {
  const { user_name, password, avatar } = req.body;

  if (!user_name) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const [result] = await db.query(
      'INSERT INTO User (user_name, avatar, hash_password) VALUES (?, ?, ?)',
      [user_name, avatar || null, hash]
    );
    res.status(201).json({ message: 'User added', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add user' });
  }
};

// 2. Delete a user by ID
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM User WHERE user_id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// 3. List all users
exports.listUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, user_name, avatar, current_points FROM User'
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list users' });
  }
};

// 4. Edit user details by ID (can update username, avatar, and/or password)
exports.editUser = async (req, res) => {
  const userId = req.params.id;
  const { user_name, avatar, password,  current_points } = req.body;

  if (!user_name && !avatar && !password) {
    return res.status(400).json({ error: 'No data provided for update' });
  }

  let fields = [];
  let values = [];
  let updatedFields = [];

  if (user_name) {
    fields.push('user_name = ?');
    values.push(user_name);
    updatedFields.push('username');
  }

  if (avatar) {
    fields.push('avatar = ?');
    values.push(avatar);
    updatedFields.push('avatar');
  }

  if (current_points !== undefined && current_points !== null) { // Check for explicit value, allow 0
    fields.push('current_points = ?');
    values.push(current_points);
  }

  if (password) {
    try {
      const hash = await bcrypt.hash(password, saltRounds);
      fields.push('hash_password = ?');
      values.push(hash);
      updatedFields.push('password');
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to hash password' });
    }
  }

  values.push(userId);

  const sql = `UPDATE User SET ${fields.join(', ')} WHERE user_id = ?`;

  try {
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // res.json({ message: `User updated: ${updatedFields.join(', ')}` });
    const [updatedUserRows] = await db.query(
      'SELECT user_id, user_name, current_points, avatar FROM User WHERE user_id = ?',
      [userId]
    );
    const updatedUser = updatedUserRows[0];

    if (updatedUser && updatedUser.avatar && !updatedUser.avatar.startsWith('http')) {
        updatedUser.avatar = `http://localhost:8080/uploads/${updatedUser.avatar}`;
    }
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};