(function (module) {
  const MutationObservable = (obj) => {
    const listeners = [];

    const notify = (oldObj, newObj, key, oldValue, newValue) => {
      listeners.forEach(listener => listener({
        oldObj: oldObj,
        newObj: newObj,
        key: key,
        oldValue: oldValue,
        newValue: newValue
      }));
    };

    const proxy = new Proxy(obj, {
      get: (target, prop) => target[prop],
      set: (target, prop, value) => {
        const oldTarget = clone(target);
        const oldValue = target[prop];

        target[prop] = value;
        
        let changed = false;

        if (typeof oldValue === "object" && typeof value === "object") {
          changed = JSON.stringify(oldValue) !== JSON.stringify(value);
        } else {
          changed = oldValue !== value;
        }

        if (changed) {
          console.debug("Notifying " + prop + " change from " + JSON.stringify(oldValue) + " to " + JSON.stringify(value));
          notify(oldTarget, target, prop, oldValue, value);
        }
        return true;
      }
    });

    Object.defineProperty(proxy, "subscribe", {
      value: (listener) => {
        if (typeof listener !== "function") throw new Error("Listener must be a function");
        if (listeners.indexOf(listener) !== -1) throw new Error("Listener already subscribed");
        listeners.push(listener);
      },
      writable: true,
      enumerable: true
    });

    Object.defineProperty(proxy, "unsubscribe", {
      value: (listener) => {
        if (listeners.includes(listener)) {
          listeners.splice(listeners.indexOf(listener), 1);
        }
      },
      writable: true,
      enumerable: true
    });

    Object.defineProperty(proxy, "toJSON", {
      value: obj.toJSON,
      writable: true,
      enumerable: true
    });

    return proxy;
  };

  module.exports = MutationObservable;
})(module, require);
