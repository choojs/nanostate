var tape = require('tape')

var nanostate = require('../')

var createParallelTransitions = () => ({
  bold: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' }
  }),
  underline: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' }
  }),
  italics: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' }
  }),
  list: nanostate('none', {
    none: { bullets: 'bullets', numbers: 'numbers' },
    bullets: { none: 'none', numbers: 'numbers' },
    numbers: { bullets: 'bullets', none: 'none' }
  })
})

tape('create parallel state', (assert) => {
  var machine = nanostate.parallel(createParallelTransitions())

  machine.emit('bold:toggle')
  assert.deepEqual(machine.state, {
    bold: 'on', underline: 'off', italics: 'off', list: 'none'
  })

  assert.end()
})

tape('change states in parallel machine', (assert) => {
  var machine = nanostate.parallel(createParallelTransitions())

  machine.emit('underline:toggle')
  machine.emit('list:numbers')
  assert.deepEqual(machine.state, {
    bold: 'off', underline: 'on', italics: 'off', list: 'numbers'
  })

  machine.emit('bold:toggle')
  machine.emit('underline:toggle')
  machine.emit('italics:toggle')
  machine.emit('list:bullets')
  assert.deepEqual(machine.state, {
    bold: 'on', underline: 'off', italics: 'on', list: 'bullets'
  })

  machine.emit('list:none')
  assert.deepEqual(machine.state, {
    bold: 'on', underline: 'off', italics: 'on', list: 'none'
  })

  assert.end()
})
