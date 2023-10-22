const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res, next) => {
    db.any('SELECT * FROM guestbooks')
        .then((data) => {
            res.render('index', { guestbooks: data })
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
})

module.exports = router