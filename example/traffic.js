var choo = require('choo')
var html = require('choo/html')
var nanostate = require('../.')

const light = 'br-pill w2 h2 mh2 bg-black-10'

var app = choo()

app.route('*', function (state, emit) {
  return html`
    <body class="tc sans-serif mv5"  style="background-color: pink;">
      <main class="center pt4" style="width: 50ex">
        <h1 class="mb4" style="color: palevioletred;">traffic example</h1>

        <p>state: <i>${state.value}</i></p>
        <h2 class="black-70">${state.time.toFixed(1)}</h2>

        <div class="flex pv1 justify-around">

          <div class="w--25">
            <p class="fw6">pedestrians</p>
            ${pedestrianLight(state, emit)}
          </div>

          <div class="w--25">
            <p class="fw6">vehicles</p>
            ${vehicleLight(state, emit)}
          </div>

        </div>

      </main>
    </body>`
})

app.use(function (state, emitter) {
  var initialState = 'green'
  var vehicleMachine = nanostate(initialState, {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })
  var pedestrianMachine = nanostate('stop', {
    stop: { timer: 'walk' },
    walk: { timer: 'wait' },
    wait: { timer: 'stop' }
  })

  // vehicleMachine.event('timer', pedestrianMachine)

  state.value = initialState
  state.time = 3.0

  emitter.on('DOMContentLoaded', function () {
    setInterval(function () {
      requestAnimationFrame(function () {
        state.time -= 0.1

        if (state.time <= 0) {
          vehicleMachine.emit('timer')
          state.value = vehicleMachine.state
          state.time = 3.0
        }

        emitter.emit('render')
      }) 
    }, 100)
  })
})

app.mount('body')

function pedestrianLight (state, emit) {
  return html`
    <div class="flex justify-center">
      <div class=${light}>
        <img class="ma1" src="walk.svg" />
      </div>
    </div>`
}

function vehicleLight (state, emit) {
  return html`
    <div class="flex justify-center">
      <span class="${light} ${state.value === 'red' ? 'bg-red' : ''}"></span>
      <span class="${light} ${state.value === 'yellow' ? 'bg-yellow' : ''}"></span>
      <span class="${light} ${state.value === 'green' ? 'bg-green' : ''}"></span>
    </div>`
}