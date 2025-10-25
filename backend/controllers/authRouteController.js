const connection = require('../db'); // connect to the database

// hashPassworrd utility function
const hashPassword = require('../utils/hashPassword');
// compare the hashed password with the login
const compareHashedPassword = require('../utils/compareHashedPassword');

const registerUser = async (req, res) => {
    const {user_name, avatar, password} = req.body;

    if (!user_name || !password || !avatar) {
        return res.status(400).json({error: 'Username, avatar and password are required'});
    }
    try {
        // first check if the user name exist already
        const [existing] = await connection.query(
            'SELECT * FROM User where user_name = ?', [user_name]
        );
        // try to test
        console.log('exosting user with that name', existing);

        // check if the array have any existing user name
        if (existing.length > 0) {
            return res.status(409).json({error: 'Username already taken.'});
        }

        // then hash the password if the username is unique
        const hashedPassword = await hashPassword(password);

        // then save the new user to the database
        await connection.query(
            'INSERT INTO User (user_name,avatar, hash_password) VALUES (?,?,?)',
            [user_name, avatar, hashedPassword]
        );

        // tell user they register successfully
        res.status(201).json({message: 'User registration successfully.'});
    } catch (error) {
        console.error('Error during registration new user', error);
        res.status(500).json({error: 'Server error'});
    }
};

const loginUser = async (req, res) => {
    // first get the user_name and password user put in
    const {user_name, password} = req.body;

    // check whether user put in their user_name or password
    if (!user_name || !password) {
        return res.status(400).json({error: 'Username and password are required'});
    }

    // main logic
    try {
        // check if the user_name exist
        const [rows] = await connection.query(
            'SELECT * FROM User WHERE user_name = ?', [user_name]
        );
        console.log('Users with that name:', rows);

        if (rows.length === 0) {
            return res.status(401).json({error: 'Invalid username or password'});
        }
        // get the user, which is at the first item because the user_name is unique --> only 1
        const user = rows[0];
        const isMatch = await compareHashedPassword(password, user.hash_password);

        if (!isMatch) {
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // set session for login
        // Used by the backend to track who is logged in.
        req.session.user = {
            user_id: user.user_id,
            user_name: user.user_name,
            avatar: user.avatar,
            current_points: user.current_points};
        res.status(200).json({
            message: 'Login successfully',
            loggedIn: true,
            user: req.session.user
        });

    } catch (error) {
        console.error('error during login', error);
        res.status(500).json({error: 'server error, cannot login'});
    }


};

const getProfile = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const userId = req.session.user.user_id;

  try {
    const [rows] = await connection.query(
      'SELECT user_id, user_name, avatar, current_points FROM User WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Optional: update session points with latest DB value
    req.session.user.current_points = rows[0].current_points;

    //res.status(200).json(rows[0]);
     res.status(200).json({ user: rows[0] });

  } catch (err) {
    console.error('Failed to fetch profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out' });
  });
};

const checkLogin = (req, res) => {
  console.log('Session:', req.session);
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(200).json({ loggedIn: false });
  }
};

const getUser = (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
};
module.exports = { registerUser, loginUser, getProfile, logoutUser, checkLogin, getUser };

