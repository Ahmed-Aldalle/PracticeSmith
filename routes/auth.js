const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

//router.get('/login', authController.render_login);

//router.get('/register', authController.render_register);




module.exports = router;



