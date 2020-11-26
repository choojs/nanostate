var Nanobus = require('nanobus')
var assert = require('assert')
var Parallelstate = require('./parallel-state')

module.exports = Nanostate

function Nanostate (initialState, transitions) {
  if (!(this instanceof Nanostate)) return new Nanostate(initialState, transitions)
  assert.equal(typeof initialState, 'string', 'nanostate: initialState should be type string')
  assert.equal(typeof transitions, 'object', 'nanostate: transitions should be type object')

  this.transitions = transitions
  this.state = initialState
  this.submachines = {}
  this._submachine = null

  Nanobus.call(this)
}

Nanostate.prototype = Object.create(Nanobus.prototype)

Nanostate.prototype.constructor = Nanostate

Nanostate.prototype.emit = function (eventName) {
  var nextState = this._next(eventName)

  assert.ok(nextState, 'nanostate.emit: invalid transition' + this.state + '->' + eventName)

  if (this._submachine && Object.keys(this.transitions).indexOf(nextState) !== -1) {
    this._unregister()
  }

  this.state = nextState
  Nanobus.prototype.emit.call(this, nextState)
}

Nanostate.prototype.event = function (eventName, machine) {
  this.submachines[eventName] = machine
}

Nanostate.parallel = function (transitions) {
  return new Parallelstate(transitions)
}

Nanostate.prototype._unregister = function () {
  if (this._submachine) {
    this._submachine._unregister()
    this._submachine = null
  }
}

Nanostate.prototype._next = function (eventName) {
  if (this._submachine) {
    var nextState = this._submachine._next(eventName)
    if (nextState) {
      return nextState
    }
  }

  var submachine = this.submachines[eventName]
  if (submachine) {
    this._submachine = submachine
    return submachine.state
  }

  if (Object.keys(this.transitions[this.state]).indexOf(eventName) === -1 && Object.keys(this.transitions).indexOf('_any') !== -1) {
    return this.transitions['_any'][eventName]
  }

  return this.transitions[this.state][eventName]
}
