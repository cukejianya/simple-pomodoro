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

addButton.addEventListener('click', openModal);

cancelButton.addEventListener('click', closeModal);

[minInput, secInput].forEach(elm => elm.addEventListener('keydown', ()  => {
  if (elm.value.length === 2) {
    elm.value = "";
  }
}));

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
    timer.start(seconds);
    closeModal();
  }
});
 
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
      state.onTick(seconds, seconds);
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

function openModal() {
  modal.classList.toggle('closed');
  modalOverlay.classList.toggle('closed');
}

function addSession() {
  let newSession = document.createElement('div');
  newSession.setAttribute('class', 'session-circle');
  session.insertBefore(newSession, addButton);
}

function closeModal() {
  modal.classList.toggle('closed');
  modalOverlay.classList.toggle('closed');
  minInput.value = "";
  secInput.value = "";
}
//Make deleteSession
