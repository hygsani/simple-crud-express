const express = require('express')
const router = express.Router()
const db = require('../db')

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

module.exports = router