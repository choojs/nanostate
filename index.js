var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Nanostate

function Nanostate (initialState, transitions) {
  if (!(this instanceof Nanostate)) return new Nanostate(initialState, transitions)
  assert.equal(typeof initialState, 'string', 'nanostate: initialState should be type string')
  assert.equal(typeof transitions, 'object', 'nanostate: transitions should be type object')

  this.transitions = transitions
  this.state = initialState
  this.children = {}
  this.submachine = null

  Nanobus.call(this)
}

Nanostate.prototype = Object.create(Nanobus.prototype)

Nanostate.prototype.emit = function (eventName) {
  var nextState

  if (this.submachine) {
    console.log('submachine')
    nextState = this.submachine.transitions[this.state][eventName]
    if (Object.keys(this.transitions).includes(nextState)) this.submachine = null
  } else {
    if (!this.submachine && this.children[eventName]) {
      this.submachine = this.children[eventName]
      nextState = this.submachine.state
    } else {
      nextState = this.transitions[this.state][eventName]
    }
  }
  assert.ok(nextState, `nanostate.emit: invalid transition ${this.state} -> ${eventName}`)
  console.log(eventName, ' -> ', nextState)

  this.state = nextState
  Nanobus.prototype.emit.call(this, eventName)
}

Nanostate.prototype.event = function (eventName, machine) {
  assert.equal(typeof eventName, 'string', 'nanostate: eventName should be type string')
  assert(machine instanceof Nanostate, 'nanostate: machine should be instance of Nanostate')
  this.children[eventName] = machine
  console.log(this)
}

