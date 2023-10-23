const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const db = require('../db')

const formValidator = [
    body('name', 'name must not empty').not().isEmpty(),
    body('email', 'invalid email').isEmail()
]

router.get('/', (req, res, next) => {
    db.any(`SELECT * FROM guestbooks`)
        .then((data) => {
            res.render('guestbooks/index', { guestbooks: data })
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
})

router.get('/create', (req, res, next) => {
    res.render('guestbooks/create')
})

router.post('/store', formValidator, (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        db.one('INSERT INTO guestbooks(name, email, message) VALUES($1, $2, $3) RETURNING guestbook_id', [req.body.name, req.body.email, req.body.message])
            .then((data) => {
                res.redirect('/guestbooks')
            })
            .catch((err) => {
                console.log(`err: ${err}`)
            })
    } else {
        res.render('guestbooks/create', { errors: errors.array() })
        return
    }
})

module.exports = router