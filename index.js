var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Nanostate

function Nanostate (initialState, transitions) {
  if (!(this instanceof Nanostate)) return new Nanostate(initialState, transitions)
  assert.equal(typeof initialState, 'string', 'nanostate: initialState should be type string')
  assert.equal(typeof transitions, 'object', 'nanostate: transitions should be type object')

  this.transitions = transitions
  this.state = initialState

  Nanobus.call(this)
}

Nanostate.prototype = Object.create(Nanobus.prototype)

Nanostate.prototype.emit = function (eventName) {
  var nextState = this.transitions[this.state][eventName]
  assert.ok(nextState, `nanostate: invalid transition ${this.state} -> ${eventName}`)

  this.state = nextState
  Nanobus.prototype.emit.call(this, eventName)
}
