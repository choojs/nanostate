var tape = require('tape')

var nanostate = require('../')
var move = require('./move')

tape('sets an initial state', function (assert) {
  var machine = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })
  assert.equal(machine.state, 'green')
  assert.end()
})

tape('change state', function (assert) {
  var machine = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  move(assert, machine, [
    ['timer', 'yellow'],
    ['timer', 'red'],
    ['timer', 'green']
  ])
  assert.end()
})

tape('emit events', function (assert) {
  var machine = nanostate('idle', {
    idle: { click: 'loading' }
  })

  machine.on('loading', function () {
    assert.pass('an event named after the new state is emitted when state changes')
    assert.end()
  })

  machine.emit('click')
})
