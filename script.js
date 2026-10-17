const fieldWidth = 9;
const fieldHeight = 6;
const routeOrder = ['shibukawa', 'station', 'entrance', 'stoneSteps', 'ikahoShrine', 'kajikaBridge', 'openAirBath', 'sakurai'];
const scenery = {
  '1,3': 'tree',
  '3,0': 'tree',
  '3,4': 'tree',
  '8,0': 'tree',
  '0,4': 'tree',
  '2,5': 'tree',
  '5,5': 'tree',
  '0,2': 'flower',
  '2,3': 'flower',
  '4,4': 'flower',
  '8,2': 'flower'
};

const places = {
  shibukawa: { x: 0, y: 0, name: '渋川駅', title: '駅舎から旅の第一歩', description: '渋川駅に降り立ち、伊香保温泉への旅が始まる。駅前では、ゆっくりとした旅支度の気配がある。' },
  station: { x: 2, y: 1, name: '伊香保温泉駅', title: '湯けむりの駅に着く', description: '伊香保温泉駅に着くと、湯気と木々の香りが心をやわらげる。石段を上ると温泉街が見えてくる。' },
  entrance: { x: 4, y: 1, name: '伊香保温泉街入口', title: '温泉街への入口', description: '温泉街の入り口には旅館の軒先や石畳の道が続き、湯けむりに包まれた散策路が広がっている。' },
  stoneSteps: { x: 5, y: 2, name: '石段街', title: '伊香保の石段街を歩く', description: '365段の石段の両側に土産物店や飲食店が並ぶ、伊香保温泉を代表する景色。湯の香りに包まれながら、街のにぎわいを楽しめる。' },
  ikahoShrine: { x: 6, y: 2, name: '伊香保神社', title: '温泉街を見守る神社', description: '石段街を上った先にある伊香保神社。温泉街の静けさを感じながら、旅の安全を願ってお参りする。' },
  kajikaBridge: { x: 7, y: 3, name: '河鹿橋', title: '朱色の河鹿橋に立ち寄る', description: '湯元付近に架かる朱色の太鼓橋。周囲の木々と橋の鮮やかな色が美しく、季節ごとの景色を楽しめる。' },
  openAirBath: { x: 7, y: 4, name: '露天風呂', title: '伊香保の湯でひと休み', description: '自然に囲まれた露天風呂で、伊香保の湯をゆっくり味わう。散策の疲れがほどけていく。' },
  sakurai: { x: 8, y: 5, name: '旅館さくらい', title: '旅の終着点', description: '旅館さくらいに到着し、旅の疲れがやわらぎ、静かな満足感に包まれる。ここで散策の旅は終わる。' }
};

const state = {
  x: 0,
  y: 0,
  finished: false
};

const currentLocationEl = document.getElementById('current-location');
const storyBoxEl = document.getElementById('story-box');
const fieldMapEl = document.getElementById('field-map');
const logListEl = document.getElementById('log-list');
const lookButton = document.getElementById('look-button');
const resetButton = document.getElementById('reset-button');
const modeLabelEl = document.getElementById('mode-label');

function addLog(message) {
  const item = document.createElement('li');
  item.textContent = message;
  logListEl.prepend(item);

  while (logListEl.children.length > 1) {
    logListEl.removeChild(logListEl.lastElementChild);
  }
}

function getCurrentPlace() {
  return Object.keys(places).find((key) => places[key].x === state.x && places[key].y === state.y) || null;
}

function getPlaceAt(x, y) {
  for (const [key, place] of Object.entries(places)) {
    if (place.x === x && place.y === y) {
      return key;
    }
  }
  return null;
}

function getRouteTiles() {
  const tiles = new Set();

  for (let index = 1; index < routeOrder.length; index += 1) {
    const previous = places[routeOrder[index - 1]];
    const next = places[routeOrder[index]];
    let x = previous.x;
    let y = previous.y;
    tiles.add(`${x},${y}`);

    while (x !== next.x) {
      x += Math.sign(next.x - x);
      tiles.add(`${x},${y}`);
    }

    while (y !== next.y) {
      y += Math.sign(next.y - y);
      tiles.add(`${x},${y}`);
    }
  }

  return tiles;
}

function getLocationData() {
  const placeKey = getCurrentPlace();
  if (placeKey) {
    const place = places[placeKey];
    return {
      name: place.name,
      title: place.title,
      description: place.description
    };
  }

  return {
    name: '野道',
    title: 'ゆるやかな散策路',
    description: '石畳と木々の間を進むと、伊香保温泉の風景が広がる。少し道を歩くだけで、旅の気分が深まる。'
  };
}

function renderMap() {
  fieldMapEl.innerHTML = '';
  const routeTiles = getRouteTiles();

  for (let y = 0; y < fieldHeight; y += 1) {
    for (let x = 0; x < fieldWidth; x += 1) {
      const tile = document.createElement('div');
      const placeKey = getPlaceAt(x, y);
      const position = `${x},${y}`;
      tile.className = `field-tile grass-${(x * 7 + y * 11) % 3}`;
      tile.setAttribute('role', 'gridcell');

      if (placeKey) {
        tile.classList.add('place', `place-${placeKey}`);
        const place = places[placeKey];
        tile.setAttribute('aria-label', place.name);

        const sprite = document.createElement('span');
        sprite.className = 'landmark-sprite';
        sprite.setAttribute('aria-hidden', 'true');
        tile.appendChild(sprite);

        const label = document.createElement('span');
        label.className = 'place-name';
        label.textContent = place.name;
        tile.appendChild(label);
      } else {
        tile.setAttribute('aria-label', routeTiles.has(position) ? '散策路' : '草地');
        if (routeTiles.has(position)) {
          tile.classList.add('trail');
        } else if (scenery[position]) {
          const decoration = document.createElement('span');
          decoration.className = `scenery-sprite ${scenery[position]}`;
          decoration.setAttribute('aria-hidden', 'true');
          tile.appendChild(decoration);
        }
      }

      if (state.x === x && state.y === y) {
        tile.classList.add('player');
        tile.setAttribute('aria-label', `${tile.getAttribute('aria-label')}・現在地`);
        const hero = document.createElement('span');
        hero.className = 'hero';
        hero.setAttribute('aria-hidden', 'true');
        tile.appendChild(hero);
      }

      fieldMapEl.appendChild(tile);
    }
  }
}

function renderStory() {
  const location = getLocationData();
  currentLocationEl.textContent = location.name;
  storyBoxEl.innerHTML = `
    <h3>${location.title}</h3>
    <p>${location.description}</p>
  `;

  modeLabelEl.textContent = '渋川駅から旅館さくらいへ';
}

function movePlayer(dx, dy) {
  if (state.finished) {
    addLog('旅はもう終わっている。やり直しで最初から出発しよう。');
    return;
  }

  const nextX = state.x + dx;
  const nextY = state.y + dy;

  if (nextX < 0 || nextX >= fieldWidth || nextY < 0 || nextY >= fieldHeight) {
    addLog('そこには進めない。周囲を見て、別の道を選ぼう。');
    return;
  }

  state.x = nextX;
  state.y = nextY;

  const placeKey = getCurrentPlace();
  if (placeKey) {
    const place = places[placeKey];
    addLog(`${place.name}に到着した。`);

    if (placeKey === 'sakurai') {
      state.finished = true;
      addLog('旅館さくらいに着いた。伊香保温泉の旅は、静かな終わりを迎えた。');
    }
  } else {
    addLog('野道を歩いて、伊香保温泉の雰囲気を感じている。');
  }

  renderMap();
  renderStory();
}

function resetGame() {
  state.x = 0;
  state.y = 0;
  state.finished = false;
  logListEl.innerHTML = '';
  addLog('渋川駅から旅が始まった。次は伊香保温泉へ向かおう。');
  renderMap();
  renderStory();
}

function handleLook() {
  const location = getLocationData();
  addLog(`${location.name}を見ている。${location.title}だ。`);
  renderStory();
}

function bindControls() {
  document.querySelectorAll('[data-dir]').forEach((button) => {
    button.addEventListener('click', () => {
      const dir = button.dataset.dir;
      const moveMap = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };
      const [dx, dy] = moveMap[dir];
      movePlayer(dx, dy);
    });
  });

  lookButton.addEventListener('click', handleLook);
  resetButton.addEventListener('click', resetGame);
}

bindControls();
resetGame();
