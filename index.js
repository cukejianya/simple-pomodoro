const pointer = document.getElementById('pointer');
const progressCircle = document.getElementById('progress');
const control = document.getElementById('control');
const clock = document.getElementById('clock');
const session = document.getElementById('session');
const addButton = document.querySelector('.add');

const radius = parseInt(progressCircle.getAttribute('r'));
const centerPoint = 110;
const circumfernce = Math.PI * radius * 2;

var timer = Timer({
  onTick: update,
});

timer.start(30);

control.addEventListener('click', (evt) => {
  toggleControl(timer);
});

addButton.addEventListener('click', addSession);

function Timer(options) {
  let defaultState = {
    duration: null,
    total: null,
    ...options
  }

  let state = {};
  
  let timer = {
    start(seconds) {
      timer.clear();
      state.total = seconds;
      state.duration = seconds + 1;
    },
    pause() {
      clearInterval(state.liveTimer);
    },
    play() {
      state.liveTimer = setInterval(timer.tick, 1000);
    },
    tick() {
      state.duration -= 1;
      if (state.onTick) {
        state.onTick(state.duration, state.total);
      }
      if (!state.duration) {
        timer.end();
      }
    },
    end () {
      timer.clear();
    },
    clear() {
      clearInterval(state.liveTimer);
      state = Object.assign({}, defaultState);
    }
  }

  return timer;
}

function update(timeLeft, timeTotal) {
  let timePercentage = timeLeft/timeTotal;
  updatePointer(timePercentage);
  updateProgress(timePercentage);
  updateClock(timeLeft);
}

function updatePointer(percentage) {
  let angle = 360 * (1 - percentage);
  let rotateVal = `rotate(${angle} ${centerPoint} ${centerPoint})`;
  pointer.setAttribute('transform', rotateVal);
}

function updateProgress(percentage) {
  let partCircumfernce = circumfernce * percentage;
  let fill = Math.ceil(partCircumfernce);
  let blank = Math.floor(circumfernce - partCircumfernce);
  progressCircle.setAttribute('stroke-dasharray', `${blank}, ${fill}`);
}

function toggleControl(timer) {
  if (control.className === 'fa fa-play') {
    control.className = 'fa fa-pause';
    timer.play();
  } else {
    control.className = 'fa fa-play';
    timer.pause();
  }
}

function updateClock(seconds) {
  let [min, sec] = convertSecondsToString(seconds);
  clock.innerHTML = `${min}:${sec}`;
}

function convertSecondsToString(seconds) {
  let min = parseInt(seconds / 60) + '';
  let sec = seconds % 60 + '';
  return [min, sec].map(elm => elm.length === 1 ? '0' + elm : elm);
}

function addSession() {
  let newSession = document.createElement('div');
  newSession.setAttribute('class', 'session-circle');
  session.insertBefore(newSession, addButton);
}
