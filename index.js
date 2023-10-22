const express = require('express')
const app = express()
const path = require('path')
const nunjucks = require('nunjucks')
const port = 3000

nunjucks.configure(
    path.join(__dirname, 'views'),
    {
        autoescape: true,
        express: app
    }
)

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'html')

const indexRouter = require('./routes/index')

app.use('/', indexRouter)

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})