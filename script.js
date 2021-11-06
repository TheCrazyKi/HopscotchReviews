var popUpOpen = {
  reviews: false,
  player: false
};

var chd;

fetch('https://api.allorigins.win/raw?url=https://community.gethopscotch.com/api/v2/channels/').then(response => {
  if (response.ok) return response.json()
  throw new Error('Network response was not ok.')
}).then(v => {
  v.channels.forEach(v => {
    if (v.id != 148) {
      var g = document.createElement('a');
      g.tabIndex = 2;
      g.id = 'ch_' + v.path.replaceAll('/', '').replaceAll('#', '');
      g.innerText = v.title;
      g.setAttribute('data-path', v.path);
      g.setAttribute('data-desc', v.description);
      g.href = '?channel=' + v.title.replaceAll('#', '');
      g.onclick = (e) => {
        e.preventDefault();
        chd = v.description;
        getProjects(v.path);
      }
      document.querySelector('#pickchannel').children[1].appendChild(g);
    }
  });
  start();
});

var apiToken = '4f7769439adf7ef8e482d2daef77375cd6d0158b65fcdca543b74b5c0c92&user%5Bauth_token%5D=qKok4lCx8YB9Wgp%2Bo862AA%3D%3D&user%5Bid%5D=4753230';

console.log('%cHopscotch Reviews', 'padding: 8px; background-color: #007bff; color: white; border: 2px solid #00a1ff; font-size: 35px;');

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var pleaseopensearch = false;

function convert(time, unix) {
  let date;
  (unix) ? date = new Date(time * 1000): date = new Date(time);
  let year = date.getFullYear();
  let month = months[date.getMonth()];
  let day = date.getDate();
  let hour = (date.getHours() < 10) ? '0' + date.getHours() : date.getHours();
  let minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();

  return {
    d: day,
    y: year,
    m: month,
    h: hour,
    min: minute
  };
}

var lastPage = false;
var pg = 1;

var busy = false;
var channelLoaded = false;
var chan, path;


function start() {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  if (urlParams.has('id')) {
    showProject(urlParams.get('id'));
    chan = 'reviewed';
  } else if (urlParams.has('channel')) {
    Object.values(document.querySelector('#pickchannel').children[1].children).forEach((v, i, x) => {
      if (v.innerText.replaceAll('#', '') == urlParams.get('channel')) {
        chd = v.getAttribute('data-desc');
        getProjects(v.getAttribute('data-path'));
      } else {
        if (i == x.length - 1) getProjects('reviewed');
      }
    });
  } else {
    getProjects('reviewed');
  }
}

function showProject(uuid) {
  opene(true, 4);
  document.querySelector('#popup').remove();
  var pop = document.createElement('div')
  pop.id = 'popup';
  document.getElementsByClassName('fx')[0].appendChild(pop);
  document.body.style.pointerEvents = 'none';
  document.body.style.overflow = 'hidden';
  document.querySelector('#popup').innerHTML = 'Hold on...';
  opene(true, 0);
  document.activeElement.blur();

  popUpOpen.reviews = true;

  let projectReviews = document.createElement('div');
  projectReviews.id = 'projectReviews';
  projectReviews.innerHTML = '<div id="prtitle" style="font-weight: 800"><i class="fa fa-comments"></i> Reviews</div>';
  let projectInfo = document.createElement('div');
  projectInfo.id = 'aboutProject';
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://community.gethopscotch.com/api/v1/projects/' + uuid)}`)
    .then(response => {
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    })
    .then(function(data) {
      opene(false, 4);
      if (data.status.http_code == 500) {
        document.body.style.pointerEvents = 'initial';
        document.body.style.overflowX = 'auto';
        document.querySelector('#popup').classList.add('close');
        popUpOpen.reviews = false;
        projectnotfound();
        getProjects('reviewed')
        return;
      }

      document.querySelector('#popup').innerHTML = '';

      let top = document.createElement('div');
      top.style.display = 'flex';
      top.className = 'top';
      top.innerHTML = '<span style="background: #fff; padding: 4px 6px; border-radius: 30px"><button class="btns" title="Close" tabindex="1" onclick="if(!popUpOpen.reviews){return;}; opene(false, 2); document.body.style.overflow = \'initial\'; window.history.replaceState(null, \'HS Reviews\', \'?channel=' + chan + '\'); if(!channelLoaded) getProjects(\'' + chan + '\'); opene(false, 0); if(pleaseopensearch) searchp();"><i class="fa fa-times"></i></button><button class="btns" tabindex="1" onclick="opene(true, 2); document.querySelector(\'#rpdialog\').children[0].children[4].onclick = () => { reqFlag(\'' + uuid + '\'); }" title="Flag Project"><i class="fa fa-flag"></i></button><button tabindex="1" class="btns" title="Share Project" onclick="share(\'' + uuid + '\')"><i class="fa fa-link"></i></button></span><button tabindex="1" style="margin-left: auto; background: #fff; padding: 4px 6px; border-radius: 30px; width: 20%" class="btns" title="Play Project" onclick="playProject(\'' + uuid + '\');"><i class="fa fa-play"></i></button>';
      let tH = document.createElement('div');
      tH.style.textAlign = 'center';
      document.querySelector('#popup').appendChild(top);
      document.querySelector('#popup').appendChild(tH);
      document.querySelector('#popup').appendChild(projectInfo);
      document.querySelector('#popup').appendChild(projectReviews);

      window.history.replaceState(null, 'HS Reviews', '?id=' + uuid);
      let projectStuff = JSON.parse(data.contents);
      var im = document.createElement('img');
      im.src = projectStuff.screenshot_url;
      im.alt = 'Project Thumbnail';
      im.style.width = im.style.height = 'auto';
      im.style.borderRadius = '8px';
      im.style.maxWidth = '100%';
      im.onerror = () => {
        tH.style.border = 'solid 3px #fff';
        tH.style.borderRadius = '8px';
        tH.style.padding = '1em 10px';
        tH.style.fontWeight = 'bold';
        tH.innerText = 'Project thumbnail could not be loaded.';
      }
      tH.appendChild(im);
      var title = document.createElement('div');
      title.style.fontSize = '1.45em';
      title.innerHTML = `<span style="font-weight: 800">${projectStuff.title}</span> by <b>${projectStuff.user.nickname}</b>`;
      projectInfo.appendChild(title);
      var pfp = document.createElement('img');
      pfp.style.float = 'right';
      pfp.style.height = pfp.style.width = '1.5em';
      pfp.setAttribute('aria-hidden', 'true');
      pfp.src = (('remote_avatar_url' in projectStuff.user)) ? projectStuff.user.remote_avatar_url : 'images/avatars/' + projectStuff.user.avatar_type + '.png';
      title.appendChild(pfp);
      var details = document.createElement('div');
      details.style.color = '#5e5e5e';
      details.style.fontSize = '.8em';
      details.setAttribute('aria-label', `${projectStuff.plants} plants, ${projectStuff.play_count} plays, ${projectStuff.number_of_stars} likes, ${projectStuff.project_remixes_count} remixes. ${(projectStuff.original_user.id != projectStuff.user.id)?`Originally by ${projectStuff.original_user.nickname}`:''}`);
      var date = new Date(projectStuff.correct_published_at);
      details.innerHTML = `<i class="fa fa-leaf"></i> ${projectStuff.plants} <i class="fa fa-play"></i> ${projectStuff.play_count} <i class="fa fa-heart"></i> ${projectStuff.number_of_stars} <i class="fa fa-random"></i> ${projectStuff.project_remixes_count}<br /><i class="fa fa-clock-o"></i> ${date.toLocaleString()} (${datething(new Date(), date, true)})${(projectStuff.original_user.id != projectStuff.user.id)?`<br /><i class="fa fa-edit"></i> Originally made by ${projectStuff.original_user.nickname}`:''}`;
      projectInfo.appendChild(details);

      document.body.style.pointerEvents = 'initial';

      fetch('reviews.json').then(response => {
          if (response.ok) return response.json()
          throw new Error('Network response was not ok.')
        })
        .then(function(stuff) {
          if ((uuid in stuff)) {
            let reviews = stuff[uuid].reviews;
            reviews.forEach(function(value) {
              let el = document.createElement('div');
              el.className = 'reviewDiv';
              el.innerHTML = '<div style="background-color: #fff; border-top-left-radius: 4px; border-top-right-radius: 4px; margin-top: -1px"><b>' + value.username + '</b><span class="reviewTime">' + convert(value.time, true).m + ' ' + convert(value.time, true).d + ', ' + convert(value.time, true).y + '</span></div><div style="margin-top: -1px; background-color: #c1c1c1; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px">' + value.review + '</div>';
              el.setAttribute('aria-label', `${value.username} on ${convert(value.time, true).m} ${convert(value.time, true).d}, ${convert(value.time, true).y} said: ${value.review}`);
              projectReviews.appendChild(el);
            });
          } else {
            let theDiv = document.createElement('div');
            theDiv.innerText = 'No reviews yet :( — feel free to leave a review by letting me know on the forum.';
            projectReviews.appendChild(theDiv);
          }
        });
    }).catch(e => {
      document.querySelector('#popup').style.height = 'max-content';
      document.querySelector('#popup').innerHTML = '<div style="text-align: center; font-weight: bold">Project Not Found / Fetch Error</div>';
      setTimeout(() => {
        opene(false, 0);
        setTimeout(() => {
          document.body.style.overflow = 'initial';
          document.body.style.pointerEvents = 'initial';
          document.querySelector('#popup').style.height = '80%';
          window.history.replaceState(null, 'HS Reviews', '?channel=' + chan);
          if (!channelLoaded) getProjects(chan);
        }, 300);
      }, 2000);
    })
}

var no = false;

function getProjects(channel, page) {
  if (!busy) {
    busy = true;
    if (channel == path && path != 'reviewed' && page === undefined) {
      busy = false;
      return;
    }
    if (channel != path || (path != 'reviewed' && page === undefined)) {
      lastPage = false;
      document.querySelector('#projectsList').innerHTML = '';
      pg = 1;
    }
    if (channel != 'reviewed') no = false;
    if (lastPage) return;
    if (channel == 'reviewed') {
      if (no) {
        busy = false;
        return;
      }
      chan = path = 'reviewed';
      document.querySelectorAll('#pickchannel > span > a').forEach(v => {
        v.style.borderBottom = 'none';
        v.style.fontWeight = 'initial';
      });
      document.querySelector('#descr').innerText = 'Projects reviewed by the community.';
      document.querySelector('#ch_reviewed').style.borderBottom = 'solid 3px black';
      document.querySelector('#ch_reviewed').style.fontWeight = 'bold';
      window.history.replaceState(null, 'Reviewed Projects — HS Reviews', '?channel=reviewed');
      fetch('reviews.json')
        .then(response => {
          if (response.ok) return response.json()
          throw new Error('Network response was not ok.')
        })
        .then(function(data) {
          let projects = data;
          var tu, im, di;
          Object.keys(projects).forEach(v => {
            fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://community.gethopscotch.com/api/v1/projects/' + v)}`)
              .then(res => {
                if (res.ok) return res.json()
                throw new Error('Network response was not ok.')
              })
              .then(function(d) {
                let dat = JSON.parse(d.contents);
                tu = document.createElement('a');
                tu.className = 'project';
                tu.setAttribute('role', 'button');
                tu.setAttribute('aria-label', `${dat.title} by ${dat.user.nickname}. ${dat.plants} plants, ${dat.play_count} plays, and ${dat.number_of_stars} likes. Published ${datething(new Date(), new Date(dat.correct_published_at), true)}.`)
                tu.addEventListener('click', (e) => {
                  e.preventDefault();
                  showProject(v);
                });
                tu.onkeyup = e => {
                  e.preventDefault();
                  if (e.key == 'Enter') showProject(v);
                }
                tu.href = '?id=' + v;
                tu.tabIndex = 3;
                im = document.createElement('div');
                im.style.backgroundImage = `url(${dat.screenshot_url})`;
                im.style.height = '75%';
                tu.appendChild(im);
                di = document.createElement('div');
                di.innerHTML = `<div style="font-size: .8em; text-align: right">${dat.user.nickname}</div><div style="font-size: 1.1em; height: 2.1em; margin-top: 4px; text-align: right;">${dat.title}</div><div style="text-align: right; color: grey; font-size: .7em"><span><i class="fa fa-leaf"></i> ${dat.plants} <i class="fa fa-heart"></i> ${dat.number_of_stars} <i class="fa fa-play"></i> ${dat.play_count} <i class="fa fa-clock-o"></i> ${datething(new Date(), new Date(dat.correct_published_at), false)}</span></div>`;
                di.style.padding = '0 10px';
                di.style.paddingTop = '7px';
                di.style.overflow = 'hidden';
                tu.setAttribute('data-uuid', v);
                tu.appendChild(di);
                if (chan != 'reviewed') return;
                document.querySelector('#projectsList').appendChild(tu);
              });
          });
        }).then(() => {
          busy = false;
          channelLoaded = true;
          no = true;
        }).catch(error => {
          busy = false;
          document.querySelector('#projectsList').innerHTML = '<div style="font-size: 1.6em"><div aria-hidden="true" style="font-size: 1.4em">┐( ∵ )┌</div>Server Error</div>';
        });
    } else {
      var chn = channel.replaceAll('/', '');
      var name = document.getElementById('ch_' + chn);
      if (no) {
        busy = false;
        return;
      }
      chan = name.innerText;
      path = channel;
      if (page || 1 == 1) {
        document.querySelector('#descr').innerText = chd;
      }
      document.querySelectorAll('#pickchannel > span > a').forEach(v => {
        v.style.borderBottom = 'none';
        v.style.fontWeight = 'initial';
      });
      document.getElementById('ch_' + chn).style.borderBottom = 'solid 3px black';
      document.getElementById('ch_' + chn).style.fontWeight = 'bold';
      window.history.replaceState(null, name.innerText + ' — HS Reviews', '?channel=' + name.innerText.replaceAll('#', ''));
      fetch(`https://api.allorigins.win/raw?url=https://c.gethopscotch.com/api/v2/${channel}?page=${(typeof page == 'number') ? page : 1}&api_token=${apiToken}`)
        .then(res => {
          if (res.ok) return res.json()
          throw new Error('Network response was not ok.')
        })
        .then(function(d) {
          addToList(d, name.innerText);
        }).then(() => {
          busy = false;
          channelLoaded = true;
        }).catch(error => {
          busy = false;
          document.querySelector('#projectsList').innerHTML = '<div style="font-size: 1.6em"><div aria-hidden="true" style="font-size: 1.4em">┐( ∵ )┌</div>Server Error</div>';
        });
    }
  }
}

function reqFlag(u) {
  if (confirm('Are you sure? It will be sent directly to THT, so be careful.')) flagProject(u);
}

function flagProject(u) {
  opene(false, 2);
  opene(true, 4);
  document.querySelector('#rpdialog').children[0].children[2].onclick = '';
  fetch('https://api.allorigins.win/raw?url=https://c.gethopscotch.com/api/v2/flags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      api_token: "4f7769439adf7ef8e482d2daef77375cd6d0158b65fcdca543b74b5c0c92",
      user: {
        id: "4753230",
        auth_token: "qKok4lCx8YB9Wgp+o862AA=="
      },
      flag: {
        reason: document.getElementById("rp").value || "Inappropriate content",
        project_uuid: u
      }
    })
  }).then(response => {
    opene(false, 4);
    if (response.status == 200) {
      alert('Project flagged');
      document.querySelector(`[data-uuid="${u}"]`).remove();
      document.querySelector('#rpdialog').style.display = 'none';
      document.querySelector('#popup').className = 'close';
      document.body.style.pointerEvents = 'initial';
      document.body.style.overflow = 'scroll';
    } else {
      alert('🤷‍♂️ Failed to flag project');
    }
  })
}

function share(u) {
  if (navigator.share) {
    navigator.share({
      url: 'https://c.gethopscotch.com/p/' + u
    });
    return;
  }
  document.querySelector('#cpt').value = 'https://c.gethopscotch.com/p/' + u;
  document.querySelector('#cpt').setSelectionRange(0, 99999);
  document.querySelector('#cpt').focus();
  document.querySelector('#cpt').select();
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
}

function searchp() {
  opene(true, 1);
  document.body.style.overflow = 'hidden';
  if(!pleaseopensearch) document.querySelector('#searc').focus();
  pleaseopensearch = false;
}

var isSearching = false;

document.querySelector('#searchp').addEventListener('submit', e => {
  e.preventDefault();
  if (isSearching) return;
  let pag = 1;
  let lp = false;
  document.querySelector('#searchp').onscroll = () => {
    if (document.querySelector('#searchp').scrollHeight - document.querySelector('#searchp').scrollTop === document.querySelector('#searchp').clientHeight) {
      if (!lp) {
        pag += 1;
        loadC();
      }
    }
  }
  document.querySelector('#searchres').innerHTML = '';

  function loadC() {
    isSearching = true;
    opene(true, 4);
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('http://community.gethopscotch.com/api/v2/projects/search?title=' + document.querySelector('#searc').value + '&page=' + pag)}`)
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Network response was not ok.')
      })
      .then(function(d) {
        opene(false, 4);
        if (d.projects.length == 0) {
          if (pag == 1) {
            document.querySelector('#searchres').innerHTML = 'sadly, nothing was found';
          } else {
            lp = true;
          }
          return;
        }
        var tu, im, di;
        let dat = d;
        dat.projects.forEach(v => {
          tu = document.createElement('a');
          tu.className = 'project';
          tu.setAttribute('role', 'button');
          tu.addEventListener('click', (e) => {
            e.preventDefault();
            pleaseopensearch = true;
            opene(false, 1);
            showProject(v.uuid);
          });
          tu.href = '?id=' + v.uuid;
          tu.setAttribute('aria-label', `${v.title} by ${v.user.nickname}. ${v.plants} plants, ${v.play_count} plays, and ${v.number_of_stars} likes. Published ${datething(new Date(), new Date(v.correct_published_at), true)}.`);
          im = document.createElement('div');
          im.style.backgroundImage = `url(${v.screenshot_url})`;
          im.style.height = '75%';
          tu.appendChild(im);
          di = document.createElement('div');
          di.innerHTML = `<div style="font-size: .8em; text-align: right">${v.user.nickname}</div><div style="font-size: 1.1em; height: 2.1em; margin-top: 4px; text-align: right;">${v.title}</div><div style="text-align: right; color: grey; font-size: .7em"><span><i class="fa fa-leaf"></i> ${v.plants} <i class="fa fa-heart"></i> ${v.number_of_stars} <i class="fa fa-play"></i> ${v.play_count} <i class="fa fa-clock-o"></i> ${datething(new Date(), new Date(v.correct_published_at), false)}</span></div>`;
          di.style.padding = '0 10px';
          di.style.paddingTop = '7px';
          di.style.overflow = 'hidden';
          tu.setAttribute('data-uuid', v.uuid);
          tu.appendChild(di);
          document.querySelector('#searchres').appendChild(tu);
        });
      }).then(() => {
        isSearching = false;
      });
  }
  loadC();
  return false;
});

window.onscroll = function(ev) {
  if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
    if (path != 'reviewed' && !busy && !lastPage) {
      pg += 1;
      getProjects(path, pg);
    }
  }
};

function addToList(dat, cha) {
  fetch('reviews.json')
    .then(res => {
      if (res.ok) return res.json()
      throw new Error('Network response was not ok.')
    })
    .then(function(d) {
      var tu, im, di;
      if (dat.projects.length < 1) {
        lastPage = true;
        return;
      }
      dat.projects.forEach(v => {
        tu = document.createElement('a');
        tu.className = 'project';
        tu.addEventListener('click', (e) => {
          e.preventDefault();
          showProject(v.uuid);
        });
        tu.setAttribute('role', 'button');
        tu.tabIndex = 3;
        tu.onkeyup = e => {
          e.preventDefault();
          if (e.key == 'Enter') showProject(v.uuid);
        }
        tu.href = '?id=' + v.uuid;
        tu.setAttribute('aria-label', `${v.title} by ${v.user.nickname}. ${v.plants} plants, ${v.play_count} plays, and ${v.number_of_stars} likes. Published ${datething(new Date(), new Date(v.correct_published_at), true)}.`);
        im = document.createElement('div');
        im.style.backgroundImage = `url(${v.screenshot_url})`;
        im.style.height = '75%';
        tu.appendChild(im);
        di = document.createElement('div');
        di.innerHTML = `<div style="font-size: .8em; text-align: right">${v.user.nickname}</div><div style="font-size: 1.1em; height: 2.1em; margin-top: 4px; text-align: right;">${v.title}</div><div style="text-align: right; color: grey; font-size: .7em"><span>${Object.keys(d).includes(v.uuid) ? '<i class="fa fa-comment"></i> ' + d[v.uuid].reviews.length + ' | ' : ''}<i class="fa fa-leaf"></i> ${v.plants} <i class="fa fa-heart"></i> ${v.number_of_stars} <i class="fa fa-play"></i> ${v.play_count} <i class="fa fa-clock-o"></i> ${datething(new Date(), new Date(v.correct_published_at), false)}</span></div>`;
        di.style.padding = '0 10px';
        di.style.paddingTop = '7px';
        di.style.overflow = 'hidden';
        tu.setAttribute('data-uuid', v.uuid);
        tu.appendChild(di);
        if (chan != cha) return;
        document.querySelector('#projectsList').appendChild(tu);
      });
    }).then(() => {
      return;
    });
}

function playProject(uuid) {
  opene(false, 0);
  popUpOpen.reviews = false;
  opene(true, 3);
  popUpOpen.player = true;
  document.querySelector('#pplayer').children[0].children[0].onclick = function() {
    opene(false, 3);
    showProject(uuid);
    document.querySelector('#pplayer').children[1].src = '';
  };
  document.querySelector('#pplayer').children[1].src = 'https://c.gethopscotch.com/e/' + uuid;
}

document.addEventListener('keyup', e => {
  if (e.key == 'Escape') {
    opene(false, 0);
    document.body.style.overflow = 'auto';
  } else if (e.key == '/') {
    e.preventDefault();
    searchp();
    return false;
  }
});

function datething(current, previous, p) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerWeek = msPerDay * 7;
  var msPerMonth = msPerDay * new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()).getDate();
  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)}${(p) ? ' seconds ago' : 's'}`;
  }
  else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)}${(p) ? ' minutes ago' : 'm'}`;
  }
  else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)}${(p) ? ' hours ago' : 'h'}`;
  }
  else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)}${(p) ? ' days ago' : 'd'}`;
  }
  else {
    return `${Math.round(elapsed / msPerWeek)}${(p) ? ' weeks ago' : 'w'}`;
  }

}

function opene(a, b) {
  if (a) {
    document.querySelectorAll('.fx')[b].style.display = 'flex';
    document.querySelectorAll('.fx')[b].style.animation = 'fi .3s';
    document.querySelector('#projectsList').setAttribute('aria-hidden', 'true');
    document.querySelector('#descr').setAttribute('aria-hidden', 'true');
    document.querySelector('#pickchannel').setAttribute('aria-hidden', 'true');
  } else {
    document.querySelectorAll('.fx')[b].style.animation = 'fo .3s';
    setTimeout(() => {
      document.querySelectorAll('.fx')[b].style.display = 'none';
      if ([2, 4].includes(b)) return;
      document.querySelector('#projectsList').setAttribute('aria-hidden', 'false');
      document.querySelector('#descr').setAttribute('aria-hidden', 'false');
      document.querySelector('#pickchannel').setAttribute('aria-hidden', 'false');
    }, 290);
  }
}