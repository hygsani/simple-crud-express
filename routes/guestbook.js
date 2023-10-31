const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const db = require('../db')
const paginationHelper = require('../helpers/pagination')

const formValidator = [
    body('name', 'name must not empty').not().isEmpty(),
    body('email', 'invalid email').isEmail()
]

router.get('/', async (req, res, next) => {
    try {
        const ROWS_PER_PAGE = 5
        const pageParam = paginationHelper.setPageParam(req, ROWS_PER_PAGE)
        const searchParam = req.query.search ? [`%${req.query.search}%`] : []
        const where = searchParam.length ? 'name ILIKE $1' : '1=1';

        const count = await db.one(
            `
                SELECT COUNT(*) AS total
                FROM guestbooks
            `
        )

        if (count) {
            let limitQuery = ''

            if (count.total > ROWS_PER_PAGE) {
                limitQuery = paginationHelper.setLimitQuery(ROWS_PER_PAGE, pageParam)
            }

            const data = await db.any(
                `
                    SELECT guestbook_id, name, email
                    FROM guestbooks
                    WHERE ${where}
                    ORDER BY guestbook_id DESC
                    ${limitQuery}
                `,
                searchParam
            )

            if (data) {
                const { lastPage, currPage, nextPage, prevPage } = paginationHelper.setPagination(
                    ROWS_PER_PAGE,
                    count.total,
                    req.query.page
                )

                res.render(
                    'guestbooks/index',
                    {
                        guestbooks: data,
                        currPage,
                        nextPage,
                        prevPage,
                        lastPage,
                        ROWS_PER_PAGE
                    }
                )
            }
        }
    } catch (err) {
        console.log(`err: ${err}`)
        next()
    }
})

router.get('/create', (req, res, next) => {
    res.render('guestbooks/create')
})

router.post('/store', formValidator, async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (errors.isEmpty()) {
            const result = await db.one(
                `
                    INSERT INTO guestbooks(name, email, message)
                    VALUES($1, $2, $3)
                    RETURNING guestbook_id
                `,
                [req.body.name, req.body.email, req.body.message]
            )

            if (result) {
                res.redirect('/guestbooks')
            }
        } else {
            res.render('guestbooks/create', { errors: errors.array() })
        }
    } catch (err) {
        console.log(`err: ${err}`)
        next()
    }
})

router.get('/edit/:id', async (req, res, next) => {
    try {
        const data = await db.one(
            `
                SELECT guestbook_id, name, email, message
                FROM guestbooks
                WHERE guestbook_id = $1
            `,
            [req.params.id]
        )

        res.render('guestbooks/edit', { guestbook: data })
    } catch (err) {
        console.log(`err: ${err}`)
        next()
    }
})

router.post('/update', formValidator, async (req, res, next) => {
    try {
        const errors = validationResult(req)

        if (errors.isEmpty()) {
            const result = await db.one(
                `
                    UPDATE guestbooks SET name=$1, email=$2, message=$3
                    WHERE guestbook_id=$4
                    RETURNING guestbook_id
                `,
                [req.body.name, req.body.email, req.body.message, req.body.guestbook_id]
            )

            if (result) {
                res.redirect('/guestbooks')
            }
        } else {
            res.render('guestbooks/edit', { errors: errors.array() })
        }
    } catch (err) {
        console.log(`err: ${err}`)
        next()
    }
})

router.post('/delete/:id', async (req, res, next) => {
    try {
        const result = await db.one(
            `
                DELETE FROM guestbooks
                WHERE guestbook_id=$1
                RETURNING guestbook_id
            `,
            [req.params.id]
        )

        if (result) {
            res.redirect('/guestbooks')
        }
    } catch (err) {
        console.log(`err: ${err}`)
        next()
    }
})

module.exports = router