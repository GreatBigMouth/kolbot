/**
 * @description Easy communication between clients
 * @Author Jaenster
 *
 */
!isIncluded("require.js") && include("require.js"); // load the require.js

(function (threadInfo, globalThis) {
  console.log("type: " + threadInfo.type);
  console.log("thread id: " + threadInfo.threadid);

  const others = [];

  const myEvents = new (require("Events"));
  const Worker = require("Worker");
  const Messaging = require("Messaging");
  const defaultCopyDataMode = 0xC0FFFEE;

  const Team = {
    on: myEvents.on,
    off: myEvents.off,
    once: myEvents.once,
    send: function (who, what, mode = defaultCopyDataMode) {
      what.profile = me.windowtitle;
      print("sending " + JSON.stringify(what) + " to " + JSON.stringify(who));
      return sendCopyData(null, who, mode || defaultCopyDataMode, JSON.stringify(what));
    },
    broadcast: (what, mode) => {
      what.profile = me.windowtitle;
      return others.forEach(other => sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what)));
    },
    broadcastInGame: (what, mode) => {
      what.profile = me.windowtitle;
      print("broadcasting " + JSON.stringify(what));
      others.forEach(function (other) {
        for (const party = getParty(); party && party.getNext();) {
          typeof party === "object" && party && party.hasOwnProperty("name") && party.name === other.name && sendCopyData(null, other.profile, mode || defaultCopyDataMode, JSON.stringify(what));
        }
      });
    }
  };

  
  if (threadInfo.type === "thread") {
    print("ÿc2Kolbotÿc0 :: Team thread started");

    //console.log("thread id as " + threadInfo.type + ": " + threadInfo.threadid + ", name: " + getScript(threadInfo.threadid).name);

    let parentScriptId,
      parentScriptName;

    const getParentScriptId = (data) => {
      try {
        if (typeof data === "string"
          && JSON.parse(data).hasOwnProperty("parentScriptId")) {
          parentScriptId = JSON.parse(data).parentScriptId;
          removeEventListener("scriptmsg", getParentScriptId);
          print("parent script id received: " + parentScriptId);
        }
      } catch (e) {
        print(e.message);
      }
    };
    
    addEventListener("scriptmsg", getParentScriptId);
    
    //console.log("waiting for parent script id...");
    while (!parentScriptId) {
      delay(10);
    }
    parentScriptName = getScript(parentScriptId).name;
    //console.log("parent script name: " + parentScriptName);

    Messaging.on("Team", data => (
      typeof data === "object" && data
      && data.hasOwnProperty("call")
      && Team[data.call].apply(Team, data.hasOwnProperty("args")
        && data.args || [])
    ));

    Worker.runInBackground.copydata = (new function () {
      const workBench = [];
      const updateOtherProfiles = function () {
        const fileList = dopen("data/").getFiles();
        fileList && fileList.forEach(function (filename) {
          let newContent, obj, profile = filename.split("").reverse().splice(5).reverse().join(""); // strip the last 5 chars (.json) = 5 chars


          if (profile === me.windowtitle || !filename.endsWith(".json")) return;
          try {
            newContent = FileTools.readText("data/" + filename);
            if (!newContent) return; // no content
          } catch (e) {
            print("Can't read: `" + "data/" + filename + "`");
          }


          try { // try to convert to an object
            obj = JSON.parse(newContent);
          } catch (e) {
            return;
          }

          let other;
          for (let i = 0, tmp; i < others.length; i++) {
            tmp = others[i];
            if (tmp.hasOwnProperty("profile") && tmp.profile === profile) {
              other = tmp;
              break;
            }
          }

          if (!other) {
            others.push(obj);
            other = others[others.length - 1];
          }

          other.profile = profile;
          Object.keys(obj).map(key => other[key] = obj[key]);
        });
      };
      addEventListener("copydata", (mode, data) => {
        //print("Pushing to workbench: " + JSON.stringify({ mode: mode, data: data }));
        workBench.push({ mode: mode, data: data });
      });

      let timer = getTickCount() - Math.round((Math.random() * 2500) + 1000); // start with 3 seconds off
      this.update = function () {
        if (!((getTickCount() - timer) < 3500)) { // only ever 3 seconds update the entire team
          timer = getTickCount();
          updateOtherProfiles();
        }

        // nothing to do? next
        if (!workBench.length) return true;

        const emit = workBench.splice(0, workBench.length)
          .map(function (obj) { // Convert to object, if we can
            let data = obj.data;
            try {
              data = JSON.parse(data);
            } catch (e) {
              /* Dont care if we cant*/
              return {};
            }
            return { mode: obj.mode, data: data };
          })
          .filter(obj => typeof obj === "object" && obj)
          .filter(obj => typeof obj.data === "object" && obj.data)
          .filter(obj => typeof obj.mode === "number" && obj.mode);
        //print("emit: " + JSON.stringify(emit));
        /* emit.length && Messaging.broadcast({
          Team: {
            emit: emit
          }
        }); */
        //print("emitting to " + parentScriptName + " with thread id: " + parentScriptId);
        emit.length && Messaging.send(
          parentScriptName,
          {
            Team: {
              emit: emit
            }
          });
        return true; // always, to keep looping;
      };
    }).update;

    let quiting = false;
    addEventListener("scriptmsg", data => data === "quit" && (quiting = true));

    // eslint-disable-next-line dot-notation
    globalThis["main"] = function () {
      while (!quiting) delay(3);
      //@ts-ignore
      getScript(true).stop();
    };

  } else {

    //console.log("thread id as " + threadInfo.type + ": " + threadInfo.threadid + ", name: " + getScript(threadInfo.threadid).name);
    (function (module) {
      const localTeam = module.exports = Team; // <-- some get overridden, but this still works for auto completion in your IDE

      // Filter out all Team functions that are linked to myEvent
      /* Object.keys(Team)
        .filter(key => !myEvents.hasOwnProperty(key) && typeof Team[key] === "function")
        .forEach(key => module.exports[key] = (...args) => Messaging.broadcast({
          Team: {
            call: key,
            args: args
          }
        })); */

      console.log("thread name: " + getScript(threadInfo.threadid).name);
      Object.keys(Team)
        .filter(key => !myEvents.hasOwnProperty(key) && typeof Team[key] === "function")
        .forEach(key => module.exports[key] = (...args) => Messaging.send(
          getScript(threadInfo.threadid).name,
          {
            Team: {
              call: key,
              args: args
            }
          }));

      Messaging.on("Team", msg =>
        typeof msg === "object"
        && msg
        && msg.hasOwnProperty("emit")
        && Array.isArray(msg.emit)
        && msg.emit.forEach(function (obj) {

          // Registered events on the mode
          myEvents.emit(obj.mode, obj.data);

          // Only if data is set
          typeof obj.data === "object" && obj.data && Object.keys(obj.data).forEach(function (item) {

            // For each item in the object, trigger an event
            obj.data[item].reply = (what, mode) => localTeam.send(obj.data.profile, what, mode);

            // Registered events on a data item
            myEvents.emit(item, obj.data[item]);
          });
        })
      );
    })(module);
  }
})(getScript.startAsThread(), [].filter.constructor("return this")());
