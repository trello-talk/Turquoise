const express = require('express')
const btoa = require('btoa')
const sf = require('snekfetch')
const router = express.Router()

router.get('/me', (req, res) => res.redirect('https://discordapp.com/api/users/@me'))
router.get('/guilds', (req, res) => res.redirect('https://discordapp.com/api/users/@me/guilds'))
router.get('/connections', (req, res) => res.redirect('https://discordapp.com/api/users/@me/connections'))

module.exports = router