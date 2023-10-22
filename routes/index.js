const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', (req, res, next) => {
    db.one('SELECT COUNT(*) AS total FROM guestbooks')
        .then((data) => {
            res.render('index', { total: data.total })
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
})

module.exports = router