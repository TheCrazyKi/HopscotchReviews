var op = false;
var mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const { createClient } = supabase;
supabase = createClient('https://nnljfqrnueelbvpiplqc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNDM2ODQ0NCwiZXhwIjoxOTM5OTQ0NDQ0fQ.XTwZVwh1ofrgIjg7OONVZH05bGZjn8XPIpOFkM1plfk');

async function submit() {
  if(document.querySelector('#uin').value.length < 1) return;
  op = true;
  document.querySelector('#subp').style.display = 'block';
  document.querySelector('#prog').value = 0;
  document.querySelector('#uin').value = document.querySelector('#uin').value.toLowerCase();
  document.querySelector('#sub').setAttribute('onclick', '');
  document.querySelector('#uin').disabled = true;
  document.querySelector('#ed').innerText = '';
  document.querySelector('#et').innerHTML = '<b>Checking...</b>';

  var { data, error } = await supabase.from('main').select('uuid');
  if (error) {
    trans('<b>An error occured.</b>');
    document.querySelector('#ed').innerText = 'An error related to the database occured. Try again?';
  } else if (data.map(v => { return v.uuid }).includes(document.querySelector('#uin').value)) {
    trans('<b>That project is already in the database!</b>');
    document.querySelector('#ed').innerText = 'That project is already in the database. Try another project?';
  } else {
    document.querySelector('#prog').value = 1;
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://c.gethopscotch.com/api/v1/projects/'+document.querySelector('#uin').value)}`)
      .then(response => {
        if (response.ok) return response.json()
        throw new Error('Network response was not ok.')
      })
      .then(async data => {
        document.querySelector('#prog').value = 2;
        var { error } = await supabase.from('main').insert([
          { uuid: document.querySelector('#uin').value, things: '{}' }
        ]);
        if (error) {
          trans('<b>An error occured.</b>');
          document.querySelector('#ed').innerText = 'An error related to the database occured. Try again?';
        } else {
          document.querySelector('#prog').value = 3;
          trans('<b>Yay!</b>');
          document.querySelector('#ed').innerText = 'That project has been added to the database. All you need to do is wait!';
        }
      }).catch(e => {
        trans('<b>Whoops.</b>');
        document.querySelector('#ed').innerText = 'That project does not exist, or an error related to fetch occured. Try another project?';
      })
  }
  document.querySelector('#uin').disabled = false;
  document.querySelector('#sub').setAttribute('onclick', 'submit()');
  op = false;
}

function foc() {
  if (!op) {
    document.querySelector('#subp').style.display = 'none';
    document.querySelector('#data').style.display = 'none';
  }
}

async function data() {
  if(document.querySelector('#uit').value.length < 1) return;
  document.querySelector('#get').setAttribute('onclick', '');
  document.querySelector('#data').innerHTML = '';
  document.querySelector('#data').style.display = 'block';
  var { data, error } = await supabase.from('main').select('uuid');
  if (error) {
    document.querySelector('#data').i = 'An error related to the database occured.';
  } else if (!data.map(v => { return v.uuid }).includes(document.querySelector('#uit').value)) {
    document.querySelector('#data').innerText = 'That project is not in the database (yet?).';
  } else {
    var val = await supabase.from('main').select('*').match({ 'uuid': document.querySelector('#uit').value });
    if (val.data[0].things == '{}') {
      document.querySelector('#data').innerText = 'No data available (yet!)';
    } else {
      val = val.data[0];
      val.things = JSON.parse(val.things);

      var b = document.createElement('div');
      b.innerHTML = '<b style="font-size: 1.4em">Year</b>';
      var d = document.createElement('select');
      d.style.float = 'right';
      Object.keys(val.things).forEach(v => {
        var t = document.createElement('option');
        t.value = v;
        t.innerText = v;
        d.appendChild(t);
      });
      b.appendChild(d);
      document.querySelector('#data').appendChild(b);

      function generateY(y, g) {
        var res = { val: [], lab: [] };
        var dat = Object.keys(val.things).indexOf(y);
        dat = Object.keys(val.things[y]);
        dat.forEach(v => {
          res.lab.push(mon[v]);
          var p = 0;
          Object.values(val.things[y][v]).forEach(v => {
            p += (v[g] - p);
          });
          res.val.push(p);
        })

        return res;
      }

      function generateM(m, y, g) {
        var res = { val: [], lab: [] };
        var dat = val.things[y][m];
        Object.keys(dat).forEach(v => {
          res.lab.push(v);
          res.val.push(val.things[y][m][v][g]);
        })
        return res;
      }

      var a = document.createElement('div');
      a.innerText = 'Likes';
      a.chart = new Chartist.Line(a, {
        labels: generateY(Object.keys(val.things)[0], 'likes').lab,
        series: [generateY(Object.keys(val.things)[0], 'likes').val]
      });

      var c = document.createElement('div');
      c.innerText = 'Plants';
      c.chart = new Chartist.Line(c, {
        labels: generateY(Object.keys(val.things)[0], 'plants').lab,
        series: [generateY(Object.keys(val.things)[0], 'plants').val]
      });

      var e = document.createElement('div');
      e.innerText = 'Plays';
      e.chart = new Chartist.Line(e, {
        labels: generateY(Object.keys(val.things)[0], 'plays').lab,
        series: [generateY(Object.keys(val.things)[0], 'plays').val]
      });

      document.querySelector('#data').appendChild(a);
      document.querySelector('#data').appendChild(c);
      document.querySelector('#data').appendChild(e);

      document.querySelector('#data').appendChild(document.createElement('hr'));

      var f = document.createElement('div');
      f.innerHTML = '<b style="font-size: 1.4em">Month</b>';
      var g = document.createElement('select');
      g.style.float = 'right';
      Object.keys(val.things[d.value]).forEach(v => {
        var t = document.createElement('option');
        t.value = v;
        t.innerText = mon[v];
        g.appendChild(t);
      });
      //  g.onselect = () => generateY(d.value);
      f.appendChild(g);
      document.querySelector('#data').appendChild(f);

      var h = document.createElement('div');
      h.innerText = 'Likes';
      h.chart = new Chartist.Line(h, {
        labels: generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'likes').lab,
        series: [generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'likes').val]
      });

      var i = document.createElement('div');
      i.innerText = 'Plants';
      i.chart = new Chartist.Line(i, {
        labels: generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'plants').lab,
        series: [generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'plants').val]
      });

      var j = document.createElement('div');
      j.innerText = 'Plays';
      j.chart = new Chartist.Line(j, {
        labels: generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'plays').lab,
        series: [generateM(Object.keys(val.things[Object.keys(val.things)[0]])[0], Object.keys(val.things)[0], 'plays').val]
      });

      document.querySelector('#data').appendChild(h);
      document.querySelector('#data').appendChild(i);
      document.querySelector('#data').appendChild(j);
      

      d.onchange = () => {
        a.chart.update({
          labels: generateY(d.value, 'likes').lab,
          series: [generateY(d.value, 'likes').val]
        });
        c.chart.update({
          labels: generateY(d.value, 'plants').lab,
          series: [generateY(d.value, 'plants').val]
        });
        e.chart.update({
          labels: generateY(d.value, 'plays').lab,
          series: [generateY(d.value, 'plays').val]
        });

        g.innerHTML = '';
        Object.keys(val.things[d.value]).forEach(v => {
          var t = document.createElement('option');
          t.value = v;
          t.innerText = mon[v - 1];
          g.appendChild(t);
        });

        h.chart.update({
          labels: generateM(g.value, d.value, 'likes').lab,
          series: [generateM(g.value, d.value, 'likes').val]
        });
        i.chart.update({
          labels: generateM(g.value, d.value, 'plants').lab,
          series: [generateM(g.value, d.value, 'plants').val]
        });
        j.chart.update({
          labels: generateM(g.value, d.value, 'plays').lab,
          series: [generateM(g.value, d.value, 'plays').val]
        });
      }
      
      g.onchange = () => {
        h.chart.update({
          labels: generateM(g.value, d.value, 'likes').lab,
          series: [generateM(g.value, d.value, 'likes').val]
        });
        i.chart.update({
          labels: generateM(g.value, d.value, 'plants').lab,
          series: [generateM(g.value, d.value, 'plants').val]
        });
        j.chart.update({
          labels: generateM(g.value, d.value, 'plays').lab,
          series: [generateM(g.value, d.value, 'plays').val]
        });
      }
    }
  }
  document.querySelector('#data').appendChild(document.createElement('hr'));
  document.querySelector('#get').setAttribute('onclick', 'data()');
}

function trans(a) {
  document.querySelector('#et').style.opacity = 0;
  document.querySelector('#et').style.animation = 'ex .6s';
  setTimeout(() => {
    document.querySelector('#et').innerHTML = a;
    document.querySelector('#et').style.opacity = 1;
  document.querySelector('#et').style.animation = 'en .6s';
  }, 600);
}