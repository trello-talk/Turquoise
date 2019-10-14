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

const qs = (function(a) {
  if (a == "") return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p=a[i].split('=', 2);
    if (p.length == 1)
      b[p[0]] = "";
    else
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
})(window.location.search.substr(1).split('&'))
history.pushState(null, "", location.href.split("?")[0])

if(qs.t && qs.tk) {
  localStorage.setItem('token', qs.t)
  localStorage.setItem('ticket', qs.tk)
}

let token = qs.t || localStorage.token || '';
let ticket = qs.tk || localStorage.ticket || '';
if(!token || !ticket) window.location.href = `https://auth.trellobot.xyz/connect/trello#${window.location.href.replace(/((#|\?).+)/g, '')}`
if(!localStorage.token) localStorage.token = token
if(!localStorage.ticket) localStorage.ticket = ticket

window.discordRequest = async e => {
  try {
    let r = await fetch(`https://discordapp.com/api/users/${e}`, { headers: {
      'authorization': `Bearer ${token}`
    }})
    let json = await r.json()
    return json
  } catch (e) {
    localStorage.removeItem('token')
    localStorage.removeItem('ticket')
    window.location.href = `https://auth.trellobot.xyz/connect/trello#${window.location.href.replace(/((#|\?).+)/g, '')}`
  }
}

window.logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('ticket')
  window.location.href = `https://auth.trellobot.xyz/connect/trello#${window.location.href.replace(/((#|\?).+)/g, '')}`
}

window.onload = () => {
  console.log('loaded')
  Trello.authorize({
    persist: false,
    scope: {
      read: true,
      write: true,
      account: true
    },
    expiration: 'never',
    success: async () => {
      console.log('yay we got things done!')
      console.log(Trello.token());
      try{
        let res = await Snekfetch.get(`https://auth.trellobot.xyz/trello/post/${Trello.token()}`).set('Authorization', localStorage.ticket)
        console.log(res)
        document.querySelector('h1').innerText = "Hell yeah! It's done!"
      } catch (e) {
        if(e.statusCode === 401) return window.logout();
        if (e.statusCode === 400) return document.querySelector('h1').innerText = `Error: ${e.body}!!`
        console.log({e})
        document.querySelector('h1').innerText = "Oh no! Check console!"
      }
    },
    error: console.log,
    name: 'Trello Discord Bot'
  })
}
