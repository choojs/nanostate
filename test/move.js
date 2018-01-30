module.exports = move

// Move the machine a bunch of states.
function move (assert, machine, states) {
  states.forEach(function (tuple) {
    var initial = machine.state
    var expected = tuple[1]
    machine.emit(tuple[0])
    assert.equal(machine.state, expected, `from ${initial} to ${expected}`)
  })
}
