var tape = require('tape')

var nanostate = require('../')
var move = require('./move')

tape('change to substate and back', function (assert) {
  var machine = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  machine.event('powerOutage', nanostate('flashingRed', {
    flashingRed: { powerRestored: 'green' }
  }))

  move(assert, machine, [
    ['timer', 'yellow'],
    ['powerOutage', 'flashingRed'],
    ['powerRestored', 'green']
  ])

  assert.end()
})

tape('move down two levels', function (assert) {
  var trafficLights = nanostate('green', {
    green: { timer: 'yellow' },
    yellow: { timer: 'red' },
    red: { timer: 'green' }
  })

  var powerOutage = nanostate('flashingRed', {
    flashingRed: { powerRestored: 'green' }
  })

  var apocalypse = nanostate('darkness', {
    darkness: { worldSaved: 'green' }
  })

  trafficLights.event('powerOutage', powerOutage)
  powerOutage.event('apocalypse', apocalypse)

  move(assert, trafficLights, [
    ['powerOutage', 'flashingRed'],
    ['apocalypse', 'darkness'],
    ['worldSaved', 'green']
  ])

  assert.equal(trafficLights._submachine, null, 'first level submachine is unregistered')
  assert.equal(powerOutage._submachine, null, 'second level submachine is unregistered')

  assert.end()
})
