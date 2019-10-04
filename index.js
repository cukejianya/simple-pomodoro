const pointer = document.getElementById('pointer');

let timer = Timer({
  onTick: update
});

timer.start(20);


function Timer(options) {
  let defaultState = {
    duration: null,
    total: null,
    ...options
  }

  let state = {}
  
  let timer = {
    start(seconds) {
      timer.clear();
      console.log(state);
      state.total = seconds;
      state.duration = seconds + 1;
      state.liveTimer = setInterval(timer.tick, 1000);
    },
    tick() {
      state.duration -= 1;
      if (state.onTick) {
        state.onTick(state.duration, state.total);
      }
      if (!state.duration) {
        timer.end()
      }
    },
    end () {
      timer.clear();
    },
    clear() {
      console.log('Hey')
      clearInterval(state.liveTimer);
      state = Object.assign({}, defaultState);
    }
  }

  return timer;
}

function update(timeLeft, timeTotal) {
  let timePercentage = timeLeft/timeTotal;
  let angle = 360 * timePercentage;
  let rotateVal = `rotate(${angle} 70 70)`;
  pointer.setAttribute('transform', rotateVal);
}

