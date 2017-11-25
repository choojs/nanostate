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

// Move the machine a bunch of states.
function move (assert, machine, states) {
  states.forEach(function (tuple) {
    var initial = machine.state
    var expected = tuple[1]
    machine.emit(tuple[0])
    assert.equal(machine.state, expected, `from ${initial} to ${expected}`)
  })
}
