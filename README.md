# nanostate
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Small Finite State Machines. Great data structure to make code more readable,
maintainable and easier to debug.

## Usage
```js
var nanostate = require('nanostate')

var machine = nanostate('green', {
  green: { timer: 'yellow' },
  yellow: { timer: 'red' },
  red: { timer: 'green' }
})

machine.emit('timer')
console.log(machine.state)
// => 'yellow'

machine.emit('timer')
console.log(machine.state)
// => 'red'

machine.emit('timer')
console.log(machine.state)
// => 'green'
```

## Hierarchical (to be implemented)
Let's implement a traffic light that flashes red whenever there's a power
outage. Instead of adding a `powerOutage` event to each normal state, we
introduce a hierarchy which allows any normal state to emit the `powerOutage`
event to change the state to `flashingRed`.
```js
var nanostate = require('nanostate')

var machine = nanostate('green', {
  green: { timer: 'yellow' },
  yellow: { timer: 'red' },
  red: { timer: 'green' }
})

machine.event('powerOutage', nanostate('flashingRed', {
  flashingRed: { powerRestored: 'green' }
}))

machine.emit('timer')
console.log(machine.state)
// => 'yellow'

machine.emit('powerOutage')
console.log(machine.state)
// => 'flashingRed'

machine.emit('powerRestored')
console.log(machine.state)
// => 'green'
```

## History (to be implemented)
Implementers note: keep track of the last state a machine was in before exiting
to the next machine. That way if `'$history'` is called, it can be merged into
the previous machine.

TODO: figure out how it works if machines are combined in a non-linear fashion.

```js
var nanostate = require('nanostate')

var machine = nanostate('cash', {
  cash: { check: 'check' },
  check: { cash: 'cash' }
})

machine.join('next', nanostate('review', {
  review: { previous: '$history' }
}))
```

## Parallel
Sometimes there's multiple parallel states that need
expressing; `nanostate.parallel` helps with that. For example when editing
text, a particular piece of text might be `bold`, `italic` and `underlined` at
the same time. The trick is that all of these states operate in parallel
```js
var nanostate = require('nanostate')

var machine = nanostate.parallel({
  bold: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' },
  }),
  underline: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' },
  }),
  italics: nanostate('off', {
    on: { 'toggle': 'off' },
    off: { 'toggle': 'on' },
  }),
  list: nanostate('none', {
    none: { bullets: 'bullets', numbers: 'numbers' },
    bullets: { none: 'none', numbers: 'numbers' },
    numbers: { bullets: 'bullets', none: 'none' }
  })
})

machine.emit('bold:toggle')
console.log(machine.state)
// => {
//   bold: 'on',
//   italics: 'off',
//   underline: 'off',
//   list: 'none'
// }
```

## Nanocomponent
Usage in combination with
[nanocomponent](https://github.com/choojs/nanocomponent) to create stateful UI
components.
```js
var Nanocomponent = require('nanocomponent')
var nanostate = require('nanostate')

module.exports = class Component extends Nanocomponent {
  constructor (name, state, emit) {
    super(name, state, emit)

    this.state = {
      data: {},
      input: ''
    }

    this.machine = nanostate('idle', {
      idle: { click: 'loading' },
      loading: { resolve: 'data', reject: 'error' },
      data: { click: 'loading' },
      error: { click: 'loading' }
    })

    this.machine.on('loading', () => this.searchRepositories())
  }

  createElement () {
    var buttonText = {
      idle: 'Fetch Github',
      loading: 'Loading…',
      error: 'Github fail. Retry?',
      data: 'Fetch Again?'
    }[this.machine.state]

    return html`
      <div>
        <input
          type="text"
          value=${this.state.input}
          onChange=${e => (this.state.input = e.target.value) && this.rerender()}
        >
        <button
          onClick=${() => this.machine.emit('click')}
          disabled=${this.machine.state === 'loading'}
        >
          ${buttonText}
        </button>
        ${data && html`<div>${JSON.stringify(data, null, 2)}</div>`}
        ${this.machine.state === 'error' && html`<h1>Error</h1>`}
      </div>
    `
  }

  searchRepositories () {
    fetch(`${ROOT_URL}/${this.state.input}`)
      .then(res => res.json())
      .then(res => {
         this.state.data = res.data
         this.machine.emit('resolve')
       })
      .catch(err => this.machine.emit('reject'))
  }
}
```

## API
### `machine = nanostate(initialState, transitions)`
Create a new instance of Nanostate. Takes the name of the initial state, and a
mapping of states and their corresponding transitions. A state mapping is
defined as `{ 1: { 2: 3 }}`, where `1` is the state's name, `2` is an event
name it accepts, and `3` is the new state after the event has been emitted.

### `machine.emit(event)`
Move from the current state to a new state. Will throw if an invalid command is
passed.

### `machine.on(state, cb)`
Trigger a callback when a certain state is entered. Useful to trigger side
effects upon state change.

### `state = machine.state`
Return the current state.

### `machine.event(eventName, machine)` (to be implemented)
Add another machine to the transition graph. The first argument is an event
name, which can be transitioned to from all other states in the graph.

### `machine = nanostate.parallel(machines)` (to be implemented)
Combine several state machines into a single machine. Takes an object of state
machines, where the key is used to prefix the events for the state machine.

Say we have two state machine: `'foo'` and `'bar'`. `'foo'` has an event called
`'beep'`. When combined through `.parallel()`, the event on the combined
machine would be `'foo:beep'`.

## Installation
```sh
$ npm install nanostate
```

## See Also
- [Infinitely Better UIs With Finite Automata (video)](https://www.youtube.com/watch?v=VU1NKX6Qkxc&feature=youtu.be)
- [yoshuawuyts/fsm-event](https://github.com/yoshuawuyts/fsm-event)
- [davidkpiano/xstate](https://github.com/davidkpiano/xstate/)

## License
[Apache-2.0](./LICENSE)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nanostate.svg?style=flat-square
[3]: https://npmjs.org/package/nanostate
[4]: https://img.shields.io/travis/choojs/nanostate/master.svg?style=flat-square
[5]: https://travis-ci.org/choojs/nanostate
[6]: https://img.shields.io/codecov/c/github/choojs/nanostate/master.svg?style=flat-square
[7]: https://codecov.io/github/choojs/nanostate
[8]: http://img.shields.io/npm/dm/nanostate.svg?style=flat-square
[9]: https://npmjs.org/package/nanostate
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
