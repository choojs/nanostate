var tape = require('tape')

var nanostate = require('./')

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

tape('move down one level and back', function (assert) {
  var machine = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  machine.event('powerOutage', nanostate('flashingRed', {
    flashingRed: {
      powerRestored: 'green',
      completeOutage: 'noLight'
    },
    noLight: { powerRestored: 'green' }
  }))

  move(assert, machine, [
    ['powerOutage', 'flashingRed'],
    ['completeOutage', 'noLight'],
    ['powerRestored', 'green']
  ])
  assert.end()
})

tape('move down two levels', function (assert) {
  var machine = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  var machine2 = nanostate('flashingRed', {
    flashingRed: { powerRestored: 'green' }
  })

  machine2.event('completeOutage', nanostate('noLight', {
    noLight: { fullPowerRestored: 'green' }
  }))

  machine.event('powerOutage', machine2)

  move(assert, machine, [
    ['powerOutage', 'flashingRed'],
    ['completeOutage', 'noLight']
  ])
  assert.end()
})

// Move the machine a bunch of states.
function move (assert, machine, states) {
  states.forEach(function (tuple) {
    var initial = machine.state
    var expected = tuple[1]
    console.log('initial', initial, 'expected', expected, 'actual', machine.state)
    machine.emit(tuple[0])
    assert.equal(machine.state, expected, `from ${initial} to ${expected}`)
  })
}
