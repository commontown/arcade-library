export const PublicPath = process.env.PUBLIC_URL;
export const Phaser = window.Phaser;

const rndgen = new Phaser.Math.RandomDataGenerator();
export function randBetween(x, y) {
  return rndgen.between(x, y);
}

// 1. tell parent window ready for gameData
// 2. wait for parent window to postMessage with gameData
// 3. call startfn with the supplied gameData
// 4. misc: set up pause and unpause callback also
let __server;
export function portalRequestGameData(scene, startfn) {
  // do only if embeded
  if (window.parent !== window) {
    // listen for events from parents: pause, unpause and gameData
    window.addEventListener('message', ev => {
      const { data } = ev;
      //       console.log('message:', data);
      if (data === 'pause') scene.scene.pause();
      else if (data === 'unpause') scene.scene.resume();
      else if (typeof data === 'object') {
        if (data.gameData) {
          // remember the server
          const { server } = data.gameData || {};
          if (server) __server = server;

          // gameData sent from parent, call startfn to start game
          startfn(scene, data.gameData);
        }
      }
    });

    // show loading message
    const { width, height } = scene.scale;
    scene.add.text(width / 2, height / 2, 'Loading...', { fontFamily: 'san-serif', fontSize: 30, align: 'center' }).setOrigin(0.5);

    // tell parent i am ready
    window.parent.postMessage('requestGameData', '*');
  }
  else {
    startfn(scene);
  }
}

export function portalReportHighscore(score, callback) {
  if (__server) {
    // gameId: is the path of the embedded portal page, eg. "/ca4_dd/books/848-4f5f/game5test"
    // highscoreUrl: the url to post, eg. "https://dd.ca4dev.url3.net/cos/o.x?c=/ca4_dd/etitle&func=furl&furlpath=/api/highscore"
    const { highscoreUrl, gameId } = __server;
    if (highscoreUrl && gameId) {
      requestXHR(highscoreUrl, {
        method: 'post',
        data: {
          cat: gameId,
          total: score,
        }
      }).then(data => {
        if (callback) callback(data);
      });
    }
  }
  else console.warn('Must call portalRequestGameData before to obtain server info');
}

export function requestXHR(url, options = {}) {
  let { rawResult = false, method = 'get', data = {} } = options;
  return new Promise((resolve, reject) => {
    function reqListener() {
      var result = this.responseText;
      if (!rawResult) result = JSON.parse(result);

      //       // 2018-06-11 joel: if not login, go to message page
      //       if (response.data.queryError && response.data.reason==='not_login') {
      //         if (document.location.hash!=='#/notlogin')
      //           document.location.hash='#/notlogin'
      //       }

      resolve(result);
    }

    function reqError(err) {
      console.log('XHR Fetch Error: ', err);
      reject(err);
    }

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.open(method, url, true);
    oReq.withCredentials = true; // need this to enable cookie accept/send (even in login)

    if (method === 'post') {
      let params = '';
      if (data)
        params = 'apiData=' + encodeURIComponent(typeof data === 'object' ? JSON.stringify(data) : data);
      //
      //       for (let k in data) params+= (params.length>0?'&':'') + k + '=' + encodeURIComponent(typeof data[k]==='object'?JSON.stringify(data[k]):data[k]);

      oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      oReq.send(params);
    }
    else oReq.send();
  });
}

// shuffle an array
Array.prototype.shuffle = function () {
  let arr = this;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/*  ****************
ActionFigure: figure capable of playing different anim sequence
eg.
  preload() {
    this.load.spritesheet('rabbitsheet4', `${modpath}/rabbit/dancing.png`, { frameWidth: 209, frameHeight: 210 });
  }

  make instance:
    const rabbit = new ActionFigure(this.scene, {x, y, depth}, [{
      sheet: 'rabbitsheet4',
      origin:[.42, .95],
      anims: [
        { _act:'dance', frameRate: 8, repeat:-1, _frames: '012103430121034305657500000', },
      ],
    }],

  do an act:
    rabbit.act('happy');

  instance vars:
    rabbit.nextEvent : set if there are event timer for next future event)
    rabbit.object    : the game object (sprite or container) for tweening, setting etc
*/

export class ActionFigure {
  constructor(scene, config, defs) {
    this.scene = scene;
    this.make(scene, config, defs);
  }

  make(scene, { x, y, depth }, defs) {
    this.sprites = [];
    this.acts = {};  // to create this shape: { <act> : [ [<sprite>, <anim-key = sheet-act-i>], ...], <act>: .... } ====> used by act
    this.nextEvent = null;

    let act1; // first act to run

    // loop to create sprites
    defs.forEach(({ sheet, anims, origin: [ox, oy] }) => {
      // sprites
      const sp = scene.add.sprite(x, y, sheet);
      {
        sp.setOrigin(ox, oy);
        this.sprites.push(sp);
        sp.on('animationcomplete', _ => (this.nextEvent && (this.nextEvent.paused = false))); // when complete, unpaused the next event
      }

      anims.forEach(({ frameRate, repeat, _act, _frames }, i) => {
        if (typeof _frames === 'string')
          _frames = _frames.split('').map(s => parseInt(s));

        // gen a random key anim object so that anim manager will not reuse anim with old config
        const key = `anim-${new Date().getTime() % 100000000}-${Math.floor(Math.random() * 100000000)}`;
        //         const key = `${sheet}-${_act}-${i}-${Math.floor(Math.random()*1000)}${new Date().getTime() % 1000}`;
        //         console.log('anim key:', key);
        const frames = _frames.map(frame => ({ key: sheet, frame }));

        // anims
        const anim = scene.anims.create({
          key, repeat,
          frameRate, frames,
        });

        if (!this.acts[_act]) this.acts[_act] = [];
        this.acts[_act].push([(this.sprites[this.sprites.length - 1]), key]);
        if (!act1) act1 = _act;
      });
    });
    //     console.log('format of sprites:', sprites, 'acts:', this.acts);
    //     this.sprites.forEach((sp,i)=>(sp.setDepth(depth).setVisible(i===0?true:false)));

    let ctn;
    if (this.sprites.length === 1) ctn = this.sprites[0];
    else {
      ctn = scene.add.container(x, y, this.sprites);
      this.sprites.forEach((sp, i) => {
        sp.setVisible(i === 0 ? true : false);
        sp.setX(0).setY(0);
      });
    }
    ctn.setDepth(depth)

    // run act1
    this.act(act1);
    this.object = ctn;
  }

  act(what) {
    const actions = this.acts[what];
    let idx = 0;
    if (actions.length > 1) idx = Math.floor(Math.random() * 1000) % actions.length;  // pick a random action
    const [sp, action] = actions[idx]; // actions must be array, rnd to pic one randomly

    // need to pause pending future events
    if (this.nextEvent) this.nextEvent.paused = true;

    //       console.log('act:', what, 'act count:', actions.length, 'idx:', idx, 'nextEvent:', this.nextEvent);

    // only one sprite visible
    if (this.sprites.length > 1) {
      this.sprites.forEach(s => s.setVisible(false));
      sp.setVisible(true);
    }
    sp.play(action);
  }

}

// --------
export class TextInput {
  constructor(scene, props) {
    const {
      text = '',
      x = 0, y = 0,
      maxWidth = 15,
      depth = 1000,
      style = { fontFamily: 'Andale Mono', fontSize: 40, color: 0x404040, textAlign: 'right' },
      boxStyle = { backgroundColor: 0xf0f0f0, borderWidth: 3, borderColor: 0x909090, borderRadius: 8 },
      onComplete,
    } = props || {};

    this.scene = scene;
    this.text = text;
    this.maxWidth = maxWidth;
    this.onComplete = onComplete;

    // box
    const box = this.scene.add.graphics({ x, y }).setDepth(depth), boxw = parseInt(style.fontSize) * maxWidth * .7, boxh = parseInt(style.fontSize) * 1.2;
    {
      box.fillStyle(boxStyle.backgroundColor, 1);
      box.lineStyle(boxStyle.borderWidth, boxStyle.borderColor, 1);
      box.fillRoundedRect(0, 0, boxw, boxh, boxStyle.borderRadius);
      box.strokeRoundedRect(0, 0, boxw, boxh, boxStyle.borderRadius);
    }

    // text itself
    this.textObj = scene.add.text(x, y, this.makeFinal(this.text), style).setOrigin(0, 0).setDepth(depth);

    // cursor
    {
      const shorten = 3, width = parseInt(style.fontSize) * .5, height = this.textObj.height - shorten * 2;
      this.cursorObj = this.scene.add.graphics({ x: x + this.textObj.width, y: y + shorten + 1 }).setDepth(depth);
      this.cursorObj.fillStyle(style.color, .8);
      this.cursorObj.fillRect(0, 0, width, height);
      this.scene.tweens.add({ targets: this.cursorObj, alpha: .3, repeat: -1, yoyo: true, duration: 1000 });
    }

    // enable input
    this.scene.input.keyboard.on('keyup', ev => this.keyHandler(ev));
  }

  makeFinal(text) {
    // make final display string with >...._
    return '>' + text;
  }

  keyHandler(ev) {
    const maptab = Phaser.Input.Keyboard.KeyCodes;
    //  Only allow A-Z . and -
    let code = ev.keyCode;

    if (code === maptab.PERIOD) { }
    else if (code === maptab.ENTER) {
      if (this.onComplete) this.onComplete(this.text);
      this.cursorObj.destroy();
      this.cursorObj = null;
    }
    else if (code === maptab.BACKSPACE || code === maptab.DELETE)
      this.text = this.text.substr(0, this.text.length - 1);
    else {
      const ch = String.fromCharCode(code);
      if (ev.shiftKey && ch >= 'A' && ch <= 'Z') this.text += ch;
      else if (ch >= 'A' && ch <= 'Z') this.text += ch.toLowerCase();
      else if (!ev.shiftKey && (ch === ' ' || (ch >= '0' && ch <= '9'))) this.text += ch;
    }
    if (this.text.length > this.maxWidth) this.text = this.text.substring(0, this.maxWidth);
    this.update();
  }

  update(text) {
    if (typeof text === 'string') this.text = text;
    this.textObj.setText(this.makeFinal(this.text));
    if (this.cursorObj)
      this.cursorObj.setX(this.textObj.x + this.textObj.width);
  }
}

export class Copyright {
  constructor(scene, pref) {
    this.scene = scene;

    let year = (pref.releaseDate.split('-')[0] || '');
    if (year) year += ' ';

    this.text = `© ${year}${pref.publisher || ''}. All rights reserved.  ${pref.version || ''} ${pref.releaseDate || ''}`;
    this.style = { fontFamily: 'san-serif', fontSize: 14, color: '#444', textAlign: 'right' };
  }
  render(scene) {
    if (!scene) scene = this.scene;
    const { width, height } = scene.scale;
    return scene.add.text(width - 5, height - 5, this.text, this.style).setOrigin(1, 1).setStroke('#eee', 3);
  }
}

