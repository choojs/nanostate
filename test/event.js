var tape = require("tape");

var nanostate = require("../");

tape("event - any change", (test) => {
  test.plan(1);
  var machine = nanostate("green", {
    green: { timer: "yellow" },
    yellow: { timer: "red" },
    red: { timer: "green" },
  });
  machine.onchange((nextState) => {
    test.equal(nextState, "yellow");
  });
  machine.emit("timer");
});
