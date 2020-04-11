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

const express = require('express')
const btoa = require('btoa')
const sf = require('snekfetch')
const router = express.Router()

router.get('/me', (req, res) => res.redirect('https://discordapp.com/api/users/@me'))
router.get('/guilds', (req, res) => res.redirect('https://discordapp.com/api/users/@me/guilds'))
router.get('/connections', (req, res) => res.redirect('https://discordapp.com/api/users/@me/connections'))

module.exports = router
