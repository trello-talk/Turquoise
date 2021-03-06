/*
 This file is part of Turquoise.
 Copyright (c) Snazzah 2016-2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

const fetch = require("node-fetch");

const db2 = new Database();
await db2.connect(config.r2);

    app.get("/trello/post/:token", async (req, res) => {
        console.log("here");
        if (!req.params.token) res.status(400).send("Please give a token")
        const ticket = req.header("authorization");
        console.log(ticket);
        const details = await db.getTicket(ticket);
        if (await db2.getUser(details.user) !== null){
            return res.status(400).send("You're already authorized");
        }
        const result = await (
          fetch(`https://api.trello.com/1/tokens/${req.params.token}?token=${req.params.token}&key=${config.trelloKey}`)
            .then(res => res.json())
            .then(json => json.idMember)
        ).catch(() => new Error("coudn't get trello user id"))
        console.log(result);
        console.log(details);
        db2.addToken(details.user, req.params.token, result);
        res.send('POST request to the homepage')
    });


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
app.use('/trello', require('./routes/trello'))
app.use('/*', require('./routes/404'))

app.listen(config.port, () => {
  console.info(`Running on port ${config.port}`)
})

})()
