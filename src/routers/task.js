const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body, // ES6 Spread operator - copies entire contents
        owner: req.user._id // From Auth middleware
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    };
});

// GET /tasks?completed=true || false
// GET /tasks?limit=10&skip=10 - limit is how many items per term, skip is how many items to skip ie: skip=10, show next 11-20 results
// GET /tasks?sortBy=createdAt_asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true' // req.query.completed is a string, === makes it parse to a Boolean and then assign in match object
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 // descending = -1, ascending = 1 
    }   

    try {
        await req.user.populate({
            path: 'tasks',
            match, // match based on query string
            options: {
                limit: parseInt(req.query.limit), // limit to x items on page based on query string - ?limit=10, show only 10 per page
                skip: parseInt(req.query.skip), // Skip x amount of items from query string - ?skip=10, show 11-20 results
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    };
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400).send('Invalid update');
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.send(task);

    } catch (e) {
        res.status(400).send(e);
    };
});

router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    };
});

module.exports = router;