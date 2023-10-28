const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const db = require('../db')

const formValidator = [
    body('name', 'name must not empty').not().isEmpty(),
    body('email', 'invalid email').isEmail()
]

router.get('/', (req, res, next) => {
    const ROWS_PER_PAGE = 2
    const PAGE_NUM_DELTA = 3

    const pageParam = req.query.page && !isNaN(req.query.page)
        ? parseInt((req.query.page - 1) * ROWS_PER_PAGE)
        : 0

    const searchParam = req.query.search ? [`%${req.query.search}%`] : []
    const where = searchParam.length ? 'name ILIKE $1' : '1=1';

    db.one(
        `
            SELECT COUNT(*) AS total
            FROM guestbooks
        `
    )
    .then((data) => {
        let limitQuery = ''
        let currPage = ''
        let nextPage = ''
        let prevPage = ''
        let lastPage = ''

        if (data.total > ROWS_PER_PAGE) {
            limitQuery = `LIMIT ${ROWS_PER_PAGE} OFFSET ${pageParam}`

            currPage = parseInt(req.query.page) && !isNaN(req.query.page)
                ? parseInt(req.query.page)
                : 1

            lastPage = Math.ceil(data.total / ROWS_PER_PAGE)
            nextPage = currPage == lastPage ? currPage : currPage + 1
            prevPage = currPage == 1 ? currPage : currPage - 1

            // currPage = parseInt(req.query.page) ? parseInt(req.query.page) : 1,
            // lastPage = Math.ceil(data.total / ROWS_PER_PAGE)

            // nextPage = currPage == lastPage
            //     ? lastPage
            //     : (currPage + PAGE_NUM_DELTA > lastPage ? currPage : currPage + PAGE_NUM_DELTA)

            // prevPage = currPage == 1
            //     ? 1
            //     : (currPage - PAGE_NUM_DELTA > 1 ? 1 : currPage - PAGE_NUM_DELTA)

            // totalPageNum = PAGE_NUM_DELTA && currPage < lastPage
            //                 ? (currPage + PAGE_NUM_DELTA > lastPage ? currPage + ROWS_PER_PAGE : currPage + ROWS_PER_PAGE)
            //                 : lastPage

            // pageNumStart = PAGE_NUM_DELTA && currPage < lastPage
            //     ? (currPage + PAGE_NUM_DELTA > lastPage ? currPage - 1 : currPage - 1)
            //     : currPage - PAGE_NUM_DELTA

            // console.log(totalPageNum,pageNumStart)
        }

        db.any(
            `
                SELECT guestbook_id, name, email
                FROM guestbooks
                WHERE ${where}
                ORDER BY guestbook_id DESC
                ${limitQuery}
            `,
            searchParam
        )
        .then((data) => {
            res.render(
                'guestbooks/index',
                {
                    guestbooks: data,
                    // pageNumStart,
                    currPage,
                    nextPage,
                    prevPage,
                    lastPage,
                    ROWS_PER_PAGE,
                    PAGE_NUM_DELTA,
                    // totalPageNum
                }
            )
        })
        .catch((err) => {
            console.log(`err: ${err}`)
        })
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