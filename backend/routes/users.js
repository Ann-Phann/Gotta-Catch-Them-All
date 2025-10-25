const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadAvatar');
const {
  uploadProfilePicture,
  getAccount,
  updateAccount
} = require('../controllers/userController');

router.post('/upload-profile-picture', upload.single('profilePic'), uploadProfilePicture);
router.get('/account', getAccount);
router.put('/account', updateAccount);


module.exports = router;
