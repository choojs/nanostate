var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Nanostate

function Nanostate (initialState, transitions) {
  if (!(this instanceof Nanostate)) return new Nanostate(initialState, transitions)
  assert.equal(typeof initialState, 'string', 'nanostate: initialState should be type string')
  assert.equal(typeof transitions, 'object', 'nanostate: transitions should be type object')

  this.transitions = transitions
  this.state = initialState
  this.parent = null
  this.children = []

  Nanobus.call(this)
}

Nanostate.prototype = Object.create(Nanobus.prototype)

Nanostate.prototype.emit = function (eventName) {
  var nextState = this.transitions[this.state][eventName]
  assert.ok(nextState, `nanostate.emit: invalid transition ${this.state} -> ${eventName}`)

  this.state = nextState
  Nanobus.prototype.emit.call(this, eventName)
}

Nanostate.prototype.event = function (eventName, machine) {
  assert.equal(typeof eventName, 'string', 'nanostate: eventName should be type string')
  assert(machine instanceof Nanostate, 'nanostate: machine should be instance of Nanostate')
  assert(this.events[eventName], 'nanostate: eventName has already been declared')
  machine.parent = this
  this.children.push(machine)
}

