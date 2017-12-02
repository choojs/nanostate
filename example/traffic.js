var choo = require('choo')
var html = require('choo/html')
var nanostate = require('../.')

const light = 'br-pill w2 h2 ba b--black-20 mh2 bg-black-10'
const button = 'mh2 ph3 pv2 ba b--black-20 br1 bg-black-10 black-70'

var app = choo()

app.route('*', function (state, emit) {
  return html`
    <body class="tc sans-serif"  style="background-color: pink;">
      <main class="center pt4" style="width: 50ex">
        <h1 class="mv5" style="color: palevioletred;">🚥 traffic light</h1>

        <div class="mv5">
          <p class="black-70">
            state: 
            <i class="bg-black-10 pv1 ph2 br2 black-50">${state.value}</i>
          </p>
        </div>

        <div class="flex mv5 justify-around">

          <div class="w--25">
            <p class="fw6 black-70 mt2 mb4"><span class="mh1">🚸</span> pedestrians</p>
            ${pedestrianLight(state, emit)}
          </div>

          <div class="w--25">
            <p class="fw6 black-70 mt2 mb4"><span class="mh1">🚗</span> vehicles</p>
            ${vehicleLight(state, emit)}
          </div>

        </div>
        
        <div class="mv5">
          ${state.value === 'flashingRed'
            ? html`
                <button onclick=${e => emit('powerRestored')} class=${button}>
                restore the power
              </button>`
            : html`
                <button onclick=${e => emit('powerOutage')} class=${button}>
                  cut the power
                </button>`
          }
        </div>

        <div class="mv5">
          <p class="f3 fw8 black-70">${state.time.toFixed(1)}</p>
        </div>
      </main>
    </body>`
})

class Timer {
  constructor (duration, callback) {
    this.duration = duration
    this.currentTime = duration
    this.callback = callback
    this.timer = null
    this.onTick = function () {}
  }

  reset () {
    clearInterval(this.timer)
    this.timer = null
    this.currentTime = this.duration
  }

  start () {
    this.timer = setInterval(() => {
      this.currentTime -= 100
      if (this.currentTime <= 0) {
        this.currentTime = this.duration
        this.onTick()
      }
      this.callback()
    }, 100)
  }
}

app.use(function (state, emitter) {
  var initialState = 'green'

  var timer = new Timer(3000, function () {
    state.time = timer.currentTime / 1000
    if (state.time <= 0) vehicleMachine.emit('timer')
    state.value = vehicleMachine.state
    emitter.emit('render')
  })

  timer.onTick = function () {
    vehicleMachine.emit('timer')
  }

  var vehicleMachine = nanostate(initialState, {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  vehicleMachine.event('powerOutage', nanostate('flashingRed', {
    flashingRed: { powerRestored: 'green' }
  }))

  state.value = initialState
  state.time = 3.0

  emitter.on('DOMContentLoaded', function () {
    emitter.on('powerOutage', onPowerOutage)
    emitter.on('powerRestored', onPowerRestored)
    timer.start()
  })

  function onPowerOutage () {
    vehicleMachine.emit('powerOutage')
    state.value = vehicleMachine.state
    timer.reset()
    emitter.emit('render')
  }

  function onPowerRestored () {
    vehicleMachine.emit('powerRestored')
    state.value = vehicleMachine.state
    timer.start()
    emitter.emit('render')
  }
})

app.mount('body')

function pedestrianLight (state, emit) {
  return html`
    <div class="flex justify-center">
      <div class=${light}>
        ${state.value !== 'flashingRed'
          ? html`<img class="ma1" src="${state.value === 'red' ? 'walk' : 'stop'}.svg" />`
          : ''
        }
      </div>
    </div>`
}

function vehicleLight (state, emit) {
  return html`
    <div class="flex justify-center">
      <span class="${light} ${state.value === 'green' ? 'bg-green' : ''}"></span>
      <span class="${light} ${state.value === 'yellow' ? 'bg-yellow' : ''}"></span>
      <span class="${light} ${state.value === 'red' ? 'bg-red' : state.value === 'flashingRed' ? 'flashRed' : ''}"></span>
    </div>`
}