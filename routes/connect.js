/*
 This file is part of Turquoise.
 Copyright (c) Snazzah ???-2019
 Copyright (c) Yamboy1 (and contributors) 2019

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

const express = require('express')
const btoa = require('btoa')
const sf = require('snekfetch')
const router = express.Router()
const config = require('../config.json')

router.get('/:id', async (req, res) => {
  if(!req.params.id) return res.displayError(400, 'Empty Profile ID')
  let profile = await req.db.getProfile(req.params.id)
  if(!profile) return res.displayError(400, 'Invalid Profile ID')
  if(!req.query.code){
    res.renderVue('connecting',
      { profile: profile.id, profileName: profile.name, fetching: true, match: profile.match, token: '', ticket: '' },
      { head: { meta: [ { script: '/js/connect.js' } ] } })
  } else {
    const auth = btoa(`${profile.client_id}:${profile.secret}`)
    let redirect = encodeURIComponent(`${config.ip}:${config.port}/connect/${profile.id}`)
    try {
      let tokenres = await sf.post(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}&redirect_uri=${redirect}`)
        .set('Authorization', `Basic ${auth}`)
      console.log(tokenres.body)

      if(tokenres.body.scope !== 'identify guilds') return res.displayError(400, 'Invalid Scope')

      let userres = await sf.get(`https://discordapp.com/api/users/@me`)
        .set('Authorization', `Bearer ${tokenres.body.access_token}`)

      let ticket = req.tokengen.generate()
      await req.db.addTicket(ticket, profile.id, tokenres.body.access_token, userres.body)

      res.renderVue('connecting',
        { profile: profile.id, profileName: profile.name, fetching: false, match: profile.match, token: tokenres.body.access_token, ticket },
        { head: { meta: [ { script: '/js/connect.js' } ] } })
    } catch (e) {
      res.displayError(500, e.toString())
      console.error(e)
    }
  }
  //res.send({id:req.params.id, profile})
  //res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirect}`);
})


router.get('/:id/redirect', async (req, res) => {
  if(!req.params.id) return res.displayError(400, 'Empty Profile ID')
  let profile = await req.db.getProfile(req.params.id)
  if(!profile) return res.displayError(400, 'Invalid Profile ID')
  let redirect = encodeURIComponent(`${config.ip}:${config.port}/connect/${profile.id}`)
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${profile.client_id}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
})

module.exports = router
