const express = require('express')
const app = express()
const path = require('path')
const nunjucks = require('nunjucks')
const port = 3000

nunjucks.configure(
    'views',
    {
        autoescape: true,
        express: app
    }
)

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'html')

const users = [
    { name: 'Ahmet '},
    { name: 'Lily' },
    { name: 'Zulkar' }
]

app.get('/', (req, res) => {
    res.render('index', { users })
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})