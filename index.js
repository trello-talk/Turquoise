(async ()=>{

const express = require('express')
const expressVue = require('express-vue')
const path = require('path')
const config = require('./config.json')
const pkg = require('./package.json')

const app = express()
const Database = require('./utils/db')
const db = new Database()
await db.connect(config.r)
let profiles = await db.getAllProfiles()
const tokengen = require('token-generator')(config.tg)

app.use(expressVue.init({
    rootPath: path.join(__dirname, 'views'),
    vue: {
        head: {
            title: pkg.name,
            meta: [
                { script: 'https://unpkg.com/vue@2.4.2/dist/vue.js' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
                { style: '/main.css' },
                { name: 'theme-color', content: '#40E0D0' },
                { rel: 'icon', type: 'image/png', href: '/images/icon.png' },
                { name: 'title', content: pkg.name },
                { name: 'description', content: 'Turquoise OAuth Gate' },
                { property: 'og:title', content: pkg.name },
                { property: 'og:description', content: 'Turquoise OAuth Gate' },
                { name: 'owner', content: 'Snazzah' }
            ]
        }
    },
    data: {
        availableProfiles: profiles.map(p => ({ id: p.id, name: p.name, client_id: p.client_id }))
    }
}));

app.use((req, res, next) => {
    res.displayError = (code = 404, error = 'Not Found') => res.status(code).renderVue('404',
      { error: `${code} - ${error}` },
      { head: { meta: [
        { rel: 'icon', type: 'image/png', href: '/images/icon-error.png' },
        { name: 'theme-color', content: '#ee5253' }
      ] } })
    Object.assign(req, { db, config, pkg, tokengen })
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    return next()
});

app.use(express.static(__dirname+'/public'))
app.use('/connect', require('./routes/connect'))
app.use('/endpoints', require('./routes/endpoints'))
app.use('/*', require('./routes/404'))

app.listen(429, () => {
  console.info('Running on port 429')
})

})()