/**
 * @description Easy communication between threads
 * @Author Jaenster
 */


(function (module, require) {
  const myEvents = new (require("Events"));
  const Worker = require("Worker");

  Worker.runInBackground.messaging = (new function () {
    const workBench = [];
    addEventListener("scriptmsg", data => workBench.push(data));

    this.update = function () {
      if (!workBench.length) return true;

      /* let work = workBench.splice(0, workBench.length);
      work.filter(data => typeof data === "object" && data)
        .forEach(function (data) {
          Object.keys(data).forEach(function (item) {
            myEvents.emit(item, data[item]); // Trigger those events
          });
        }); */
      let work = workBench.splice(0, workBench.length);
      work.filter(data => typeof data === "string" && data)
        .forEach(function (data) {
          data = JSON.parse(data);
          Object.keys(data).forEach(function (item) {
            myEvents.emit(item, data[item]); // Trigger those events
          });
        });

      return true; // always, to keep looping;
    };
  }).update;

  module.exports = {
    on: myEvents.on,
    off: myEvents.off,
    once: myEvents.once,
    send: (scriptName, what) => {
      let script = getScript(scriptName);
      return script && script.running && script.send(what);
    },
    broadcast: what => scriptBroadcast(JSON.stringify(what))
    //send: what => scriptBroadcast(what)
  };

})(module, require);
