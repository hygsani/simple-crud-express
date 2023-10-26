const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const db = require('../db')

const formValidator = [
    body('name', 'name must not empty').not().isEmpty(),
    body('email', 'invalid email').isEmail()
]

router.get('/', (req, res, next) => {
    const searchQuery = req.query.search ? [`%${req.query.search}%`] : []
    const where = searchQuery.length ? 'name ILIKE $1' : '1=1';

    db.any(
        `
            SELECT *
            FROM guestbooks
            WHERE ${where}
            ORDER BY guestbook_id DESC
        `,
        searchQuery
    )
    .then((data) => {
        console.log(data)
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
        db.one(
            `
                INSERT INTO guestbooks(name, email, message)
                VALUES($1, $2, $3)
                RETURNING guestbook_id
            `,
            [req.body.name, req.body.email, req.body.message]
        )
        .then(() => {
            res.redirect('/guestbooks')
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
    } else {
        res.render('guestbooks/create', { errors: errors.array() })
    }
})

router.get('/edit/:id', (req, res, next) => {
    db.one(
        `
            SELECT guestbook_id, name, email, message
            FROM guestbooks
            WHERE guestbook_id = $1
        `,
        [req.params.id]
    )
    .then((data) => {
        res.render('guestbooks/edit', { guestbook: data })
    })
    .catch((err) => {
        console.log(`err: ${err}`)
    })
})

router.post('/update', formValidator, (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        db.one(
            `
                UPDATE guestbooks SET name=$1, email=$2, message=$3
                WHERE guestbook_id=$4
                RETURNING guestbook_id
            `,
            [req.body.name, req.body.email, req.body.message, req.body.guestbook_id]
        )
        .then((data) => {
            res.redirect('/guestbooks')
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
    } else {
        res.render('guestbooks/edit', { errors: errors.array() })
    }
})

router.post('/delete/:id', (req, res, next) => {
    db.one(
        `
            DELETE FROM guestbooks
            WHERE guestbook_id=$1
            RETURNING guestbook_id
        `,
        [req.params.id]
    )
    .then(() => {
        res.redirect('/guestbooks')
    })
    .catch((err) => {
        console.log(`err: ${err}`)
    })
})

module.exports = router