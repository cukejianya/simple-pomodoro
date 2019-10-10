const pointer = document.getElementById('pointer');
const circle = document.getElementById('circle'); 
const progressCircle = document.getElementById('progress');
const control = document.getElementById('control');
const clock = document.getElementById('clock');
const session = document.getElementById('session');
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const addButton = document.querySelector('.add');
const cancelButton = document.querySelector('.fa.fa-times');
const workInput = document.getElementById('work-time');
const breakInput = document.getElementById('break-time');

let currentSessionDiv;

const radius = parseInt(progressCircle.getAttribute('r'));
const centerPoint = 110;
const circumfernce = Math.PI * radius * 2;

let timer = Timer({
  onTick: update,
  onStart: ready,
  onEnd: finish,
  onReset: reset,
});

timer.reset();

control.addEventListener('click', toggleControl);

addButton.addEventListener('click', openModal);

cancelButton.addEventListener('click', closeModal);

let inputs = [workInput, breakInput];
inputs.forEach(elm => elm.addEventListener('keydown', ()  => {
  if (elm.value.length === 2) {
    elm.value = "";
  }
}));

workInput.addEventListener('input', (evt) => {
  if (workInput.value.length === 2) {
    breakInput.focus();
  }
});

breakInput.addEventListener('input', (evt) => {
  if (breakInput.value.length === 2) {
    modal.focus();
  }
});

modal.addEventListener('keypress', (evt) => {
  if (evt.keyCode === 13) {
    let workMins = parseInt(workInput.value || workInput.placeholder)// * 60;
    let breakMins = parseInt(breakInput.value || breakInput.placeholder)// + * 60;
    workInput.value = "";
    breakInput.value = "";
    addSession(workMins, breakMins);
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

function toggleControl() {
  if (!timer.isActive()) {
    control.className = 'fa fa-play';
    return;
  }
  if (control.className === 'fa fa-play') {
    play();
  } else {
    pause();
  }
}

function play() {
  control.className = 'fa fa-pause';
  timer.play();
}

function pause() {
  control.className = 'fa fa-play';
  timer.pause();
}

function openModal() {
  modal.classList.toggle('closed');
  modal.focus();
  modalOverlay.classList.toggle('closed');
}

function closeModal() {
  modal.classList.toggle('closed');
  modalOverlay.classList.toggle('closed');
  workInput.value = "";
  breakInput.value = "";
}

function addSession(workSecs, breakSecs) {
  let newSession = document.createElement('div');
  let xIcon = document.createElement('i');
  let sessionId = timer.addSession(workSecs, breakSecs);
  newSession.setAttribute('class', 'session-circle');
  xIcon.setAttribute('class', 'fa fa-times delete');
  newSession.sessionId = sessionId;
  newSession.addEventListener('click', deleteSession);
  newSession.appendChild(xIcon);
  session.insertBefore(newSession, addButton);
}

function deleteSession(evt, sessionType) {
  let target = evt.currentTarget;
  let sessionId = target.sessionId;
  if (!timer.isSessionActive(sessionId) || !target.classList.contains('work')) {
    target.remove();
  }
  pause();
  timer.deleteSession(sessionId);
}

function ready(sessionId, sessionType) {
  let sessionDivs = Array.from(document.querySelectorAll('.session-circle'));
  currentSessionDiv = sessionDivs.find(sessionDiv => {
    return sessionDiv.sessionId == sessionId;
  });
  currentSessionDiv.classList.add(sessionType);
  sessionColor(progressCircle, sessionType);
  sessionColor(pointer, sessionType)
}

function finish(sessionType) {
  if (!sessionType) {
    return;
  }
  currentSessionDiv.classList.remove(sessionType);
  currentSessionDiv.classList.add('done');
  if (sessionType === 'break') {
    currentSessionDiv.removeEventListener('click', deleteSession); 
    currentSessionDiv.childNodes.forEach(child => child.remove());
  }
  reset();
  if (!timer.isActive()) {
    pause();
  }
}

function reset() {
  updateProgress(1);
  updatePointer(1);
  updateClock(0);
}

function sessionColor(elm, sessionType) {
  elm.style.stroke = (sessionType === 'break')
    ? 'var(--sec-complementary-color)' 
    : "";
}

function Timer(options) {
  let state = {};
  
  let timer = {
    start() {
      let session = state.sessions.shift();
      let [seconds, sessionType, symbol] = session; 
      state.sessionId = symbol;
      state.sessionType = sessionType;
      state.onStart(symbol, sessionType);
      state.onTick(seconds, seconds);
      state.total = seconds;
      state.duration = seconds;
    },
    pause() {
      timer.clear();
    },
    play() {
      timer.clear();
      if (!state.duration) {
        timer.end();
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
      state.onEnd(state.sessionType);
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
        sessions: state.sessions || [],
        ...options
      }
      state = Object.assign({}, defaultState);
      state.onReset();
    },
    addSession(workSecs, breakSecs) {
      let symbol = Symbol();
      state.sessions.push([workSecs, 'work', symbol]);
      state.sessions.push([breakSecs, 'break', symbol]);
      return symbol;
    },
    deleteSession(symbol) {
      if (state.sessionId === symbol) {
        timer.clear();
        timer.end();
        return;
      }
      state.sessions = state.sessions.filter((session) => session[2] !== symbol);
    },
    isActive() {
      return !!(state.sessions.length || state.sessionId);
    },
    isSessionActive(symbol) {
      return state.sessionId === symbol;
    }
  }

  return timer;
}
