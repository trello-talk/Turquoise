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