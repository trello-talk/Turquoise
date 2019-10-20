/*
 This file is part of Turquoise.
 Copyright (c) Snazzah 2016-2019
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

window.onload = () => {
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
  const hash = window.location.hash.substr(1)
  history.pushState(null, "", location.href.split("?")[0])

  const displayError = title => {
    document.querySelector('.main').classList.add('error')
    Array.from(document.querySelectorAll('img')).slice(1).map(e => document.querySelector('.main').removeChild(e))
    document.querySelector('img').src = '/images/error.svg'
    document.querySelector('link[rel="icon"]').href = '/images/icon-error.png'
    document.querySelector('meta[name="theme-color"]').content = '#ee5253'
    document.querySelector('.status').innerHTML = title
  }

  const dataObj = document.getElementsByTagName('data')[0].dataset

  if(qs.error === 'access_denied') {
    displayError('Access denied.')
    return
  }

  if(dataObj.fetching === 'true') {
    if(!hash) {
      return displayError('No Return URL given.')
    } else if(!hash.match(new RegExp(dataObj.match))) {
      return displayError('Invalid Return URL.')
    }
    localStorage.setItem('return', JSON.stringify(window.location.hash.substr(1)))
    setTimeout(() => window.location.href = window.location.href.replace(/((#|\?).+)/g, '')  + '/redirect', 2000)
  } else {
    let returnURL = localStorage.getItem('return')
    if(!returnURL) {
      displayError('No Return URL given.')
      return
    } else if(!JSON.parse(returnURL).match(new RegExp(dataObj.match))) {
      localStorage.removeItem('return')
      return displayError('Invalid Return URL.')
    }
    returnURL = JSON.parse(returnURL)
    if(!qs.code) return window.location.href = window.location.href.replace(/((#|\?).+)/g, '') + '/redirect'
    localStorage.removeItem('return')
    setTimeout(() => window.location.href = `${returnURL}?t=${dataObj.token}&tk=${dataObj.ticket}`, 2000)
  }
}
