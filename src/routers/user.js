const express = require('express');
const router = new express.Router();
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')
const multer = require('multer') // package for working with multipart/form-data
const upload = multer({
    limits: {
        fileSize: 1000000 // File size limit in bytes
    },
    fileFilter(req, file, cb) { // Constrain file type uploads
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)) { // If file doesn't end in criteria from Regex, throw error
            return cb(new Error('Please upload a jpg, jpeg, or png'))
        }

        cb(undefined, true) // Upload successful
    }
})

// Create user profile
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        const token = await user.generateAuthToken() // Model method
        sendWelcomeEmail(user.email, user.name)
        await user.save();
        res.status(201).send( {user, token});
    } catch (e) {
        res.status(400).send();
    };
});


// Get user's profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
});

// Login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send('Invalid credentials')
    };
});

// Logout user
router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
});

// Logout user on all devices/tokens
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Update user profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body); // Returns only keys from req.body, not values

    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)); // Checks update keys from req.body to see if they're 'valid' based on allowedUpdates array

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]); // Replaces updates on req.user (coming from auth middleware) with req.body updates

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});


// Delete user profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    };
});


// Create user avatar && update
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer() // Sharp package resizes and converts to png, converts it back to binary buffer data
    req.user.avatar = buffer // Set avatar field on user object to edited buffer data from Sharp package
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Delete user avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Get user's avatar 
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error() // Skips out of try block, goes to catch and sends 404 error
        }

        res.set('Content-Type', 'image/png') // Set header, Express automatically sets for us unless specified
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router;