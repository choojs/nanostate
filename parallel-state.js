var Nanobus = require('nanobus')
var assert = require('assert')

module.exports = Parallelstate

function Parallelstate (transitions) {
  assert.equal(typeof transitions, 'object', 'nanostate: transitions should be type object')

  this.scopes = Object.keys(transitions)
  this.transitions = transitions

  Object.defineProperty(this, 'state', {
    get: function () {
      return this.scopes.reduce(function (state, scope) {
        state[scope] = transitions[scope].state
        return state
      }, {})
    }
  })

  Nanobus.call(this)
}

Parallelstate.prototype = Object.create(Nanobus.prototype)

Parallelstate.prototype.emit = function (eventName) {
  var hasColon = eventName.indexOf(':') >= 0
  assert.ok(hasColon, `nanostate.emit: invalid transition ${this.state} -> ${eventName}. For parallel nanostate eventName must have a collon ":"`)

  var eventNameSplitted = eventName.split(':')
  var scope = eventNameSplitted[0]
  var event = eventNameSplitted[1]
  assert.ok(scope, `nanostate.emit: invalid scope ${scope} for parallel emitting`)

  this.transitions[scope].emit(event)

  Nanobus.prototype.emit.call(this, eventName)
}
