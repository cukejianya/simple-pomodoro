const pointer = document.getElementById('pointer');
const progressCircle = document.getElementById('progress');
const control = document.getElementById('control');
const clock = document.getElementById('clock');
const session = document.getElementById('session');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const addButton = document.querySelector('.add');
const cancelButton = document.querySelector('.fa.fa-times');
const minInput = document.getElementById('minute');
const secInput = document.getElementById('second');

let currentSessionDiv;

const radius = parseInt(progressCircle.getAttribute('r'));
const centerPoint = 110;
const circumfernce = Math.PI * radius * 2;

var timer = Timer({
  onTick: update,
  onStart: ready,
  onEnd: finish,
});

timer.reset();
updateProgress(1);
updatePointer(1);

control.addEventListener('click', (evt) => {
  toggleControl(timer);
});

addButton.addEventListener('click', openModal);

cancelButton.addEventListener('click', closeModal);

[minInput, secInput].forEach(elm => elm.addEventListener('keydown', ()  => {
  if (elm.value.length === 2) {
    elm.value = "";
  }
}));

[minInput, secInput].forEach(elm => elm.onblur = () => {
  if (elm.value.length === 1) {
    elm.value = "0" + elm.value;
  }
})

minInput.addEventListener('input', (evt) => {
  if (minInput.value.length === 2) {
    secInput.focus();
  }
});

secInput.addEventListener('input', (evt) => {
  if (secInput.value.length === 2) {
    modal.focus();
  }
});

modal.addEventListener('keypress', (evt) => {
  if (evt.keyCode === 13) {
    let minutes = parseInt(minInput.value || 25);
    let seconds = parseInt(secInput.value || 0) + minutes * 60;
    addSession(seconds);
    closeModal();
  }
});
 
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

function updateClock(seconds) {
  let [min, sec] = convertSecondsToString(seconds);
  clock.innerHTML = `${min}:${sec}`;
}

function convertSecondsToString(seconds) {
  let min = parseInt(seconds / 60) + '';
  let sec = parseInt(seconds % 60) + '';
  return [min, sec].map(elm => elm.length === 1 ? '0' + elm : elm);
}

function toggleControl(timer) {
  if (!timer.isActive()) {
    control.className = 'fa fa-play';
    return;
  }
  if (control.className === 'fa fa-play') {
    control.className = 'fa fa-pause';
    timer.play();
  } else {
    control.className = 'fa fa-play';
    timer.pause();
  }
}

function openModal() {
  modal.classList.toggle('closed');
  modalOverlay.classList.toggle('closed');
}

function closeModal() {
  modal.classList.toggle('closed');
  modalOverlay.classList.toggle('closed');
  minInput.value = "";
  secInput.value = "";
}

function addSession(seconds) {
  let newSession = document.createElement('div');
  let xIcon = document.createElement('i');
  let sessionId = timer.addSession(seconds);
  newSession.setAttribute('class', 'session-circle');
  xIcon.setAttribute('class', 'fa fa-times delete');
  newSession.sessionId = sessionId;
  newSession.addEventListener('click', deleteSession);
  newSession.appendChild(xIcon);
  session.insertBefore(newSession, addButton);
}

function deleteSession(evt) {
  let sessionId = evt.currentTarget.sessionId;
  evt.currentTarget.remove();
  timer.deleteSession(sessionId);
}

function ready(sessionId, sessionType) {
  let sessionDivs = Array.from(document.querySelectorAll('.session-circle'));
  currentSessionDiv = sessionDivs.find(sessionDiv => {
    return sessionDiv.sessionId == sessionId;
  });
  currentSessionDiv.classList.add('flash');
  currentSessionDiv.removeEventListener('click', deleteSession); 
}

function finish() {
  let sessionDivs = Array.from(document.querySelectorAll('.session-circle'));
  currentSessionDiv.classList.remove('flash');
  currentSessionDiv.classList.add('done');
  updateProgress(1);
  updatePointer(1);
  if (!timer.isActive()) {
    toggleControl(timer);
  }
}

function Timer(options) {
  let state = {};
  
  let timer = {
    start() {
      let session = state.sessions.shift();
      let [seconds, sessionType, symbol] = session; 
      state.sessiontype = sessionType;
      state.onStart(symbol, sessionType);
      state.onTick(seconds, seconds);
      state.total = seconds;
      state.duration = seconds;
    },
    pause() {
      timer.clear();
    },
    play() {
      if (!state.duration) {
        timer.start();
      }
      state.liveTimer = setInterval(timer.tick, 1000);
    },
    tick() {
      state.duration -= 1;
      if (state.duration < 0) {
        timer.end();
        return;
      }
      if (state.onTick) {
        state.onTick(state.duration, state.total);
      }
    },
    end() {
      state.onEnd();
      if (state.sessions.length) {
        timer.start();
      } else {
        timer.reset();
      }
    },
    clear() {
      clearInterval(state.liveTimer);
    },
    reset() {
      timer.clear();
      let defaultState = {
        sessions: [],
        ...options
      }
      state = Object.assign({}, defaultState);
    },
    addSession(seconds) {
      let symbol = Symbol();
      state.sessions.push([seconds, 'work', symbol]);
      state.sessions.push([5, 'break', symbol]);
      return symbol;
    },
    deleteSession(symbol) {
      state.sessions = state.sessions.filter((session) => session[2] !== symbol);
    },
    isActive() {
      return !!(state.sessions.length);
    }
  }

  return timer;
}
