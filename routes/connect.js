const express = require('express')
const btoa = require('btoa')
const sf = require('snekfetch')
const router = express.Router()

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
    let redirect = encodeURIComponent(`http${req.config.testing ? '://localhost:429' : 's://turquoise.snazzah-is.cool'}/connect/${profile.id}`)
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
  let redirect = encodeURIComponent(`http${req.config.testing ? '://localhost:429' : 's://turquoise.snazzah-is.cool'}/connect/${profile.id}`)
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${profile.client_id}&scope=identify%20guilds&response_type=code&redirect_uri=${redirect}`);
})

module.exports = router