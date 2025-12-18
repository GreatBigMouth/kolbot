(function (module) {
  const getChangedKeys = (newObj, oldObj) => {
    const isEqual = (a, b) => {
      if (a === b) return true;
      if (
        a === null || b === null ||
        typeof a !== "object" || typeof b !== "object"
      ) {
        return false;
      }

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => isEqual(a[key], b[key]));
    };

    newObj = newObj || {};
    oldObj = oldObj || {};

    const allKeys = {};
    Object.keys(oldObj).forEach(key => allKeys[key] = true);
    Object.keys(newObj).forEach(key => allKeys[key] = true);

    const changedKeys = [];
    Object.keys(allKeys).forEach(key => {
      if (
        !oldObj.hasOwnProperty(key) ||
        !newObj.hasOwnProperty(key) ||
        !isEqual(oldObj[key], newObj[key])
      ) {
        changedKeys.push(key);
      }
    });

    return changedKeys;

    //return Object.keys(newObj).filter(key => !isEqual(oldObj[key], newObj[key]));
  };

  const getChangedPaths = (oldObj, newObj, basePath = "") => {
    let changed = [];

    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    keys.forEach((key) => {
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      const path = basePath ? [basePath, key].join(".") : key;
  
      if (
        typeof oldVal === "object" &&
        typeof newVal === "object" &&
        oldVal !== null &&
        newVal !== null
      ) {
        changed = changed.concat(getChangedPaths(oldVal, newVal, path));
      } else if (oldVal !== newVal) {
        changed.push(path);
      }
    });

    return changed;
  };

  // === Utility: Readonly proxy wrapper ===
  const readonly = (() => {
    const cache = new WeakMap();

    const wrap = (obj) => {
      if (obj === null || typeof obj !== "object") return obj;
      if (cache.has(obj)) return cache.get(obj);

      const proxy = new Proxy(obj, {
        get: (target, prop) => {
          const desc = Object.getOwnPropertyDescriptor(target, prop);
          if (desc && !desc.configurable && !desc.writable) {
            return target[prop];
          }

          const value = target[prop];
          if (typeof value === "object" && value !== null) {
            return wrap(value);
          }
          return value;
        },
        set: (target, prop, value) => {
          throw new Error("Attempt to mutate readonly object at property " + String(prop));
        },
        deleteProperty: (target, prop) => {
          throw new Error("Attempt to delete property " + String(prop));
        },
        defineProperty: (target, prop, descriptor) => {
          throw new Error("Attempt to define property " + String(prop));
        },
        setPrototypeOf: () => {
          throw new Error("Attempt to change prototype of readonly object");
        }
      });

      cache.set(obj, proxy);
      return proxy;
    };

    return wrap;
  })();

  // === Recursive State Store ===
  const StateStore = (params) => {
    params = params || {};
    let initialState = params.initialState || {};
    const reducer = params.reducer;

    const globalListeners = [];
    const sliceListeners = {};

    let _state = clone(initialState);
    const _reducer = reducer;

    const attachSubscriptions = (state) => {
      if (
        !state ||
        typeof state !== "object" ||
        Array.isArray(state)
      ) return;

      if (!state.hasOwnProperty("subscribe")) {
        Object.defineProperty(state, "subscribe", {
          value: (listener) => {
            if (typeof listener !== "function") throw new Error("Listener must be a function");
            globalListeners.push(listener);
          },
          writable: true,
          configurable: true
        });
      }

      Object.keys(state).forEach((key) => {
        const value = state[key];

        if (
          !value ||
          typeof value !== "object" ||
          Array.isArray(value)
        ) return;

        if (value.hasOwnProperty("subscribe")) return;

        Object.defineProperty(value, "subscribe", {
          value: (listener) => {
            if (typeof listener !== "function") throw new Error("Listener must be a function");
            if (!sliceListeners[key]) sliceListeners[key] = [];
            sliceListeners[key].push(listener);
          },
          writable: true,
          configurable: true
        });

      });
    };

    const notifyGlobalListeners = (currValue, prevValue) => {
      globalListeners.forEach((listener) => {
        try {
          listener({
            newValue: readonly(currValue),
            oldValue: readonly(prevValue),
            changedKeys: getChangedKeys(currValue, prevValue),
            changedPaths: getChangedPaths(currValue, prevValue),
          });
        } catch (e) {
          console.error("Error in global listener: " + e);
        }
      });
    };

    const notifySliceListeners = (currValue, prevValue) => {
      Object.keys(sliceListeners).forEach((key) => {
        if (JSON.stringify(currValue[key]) === JSON.stringify(prevValue[key])) return;
        
        const listeners = sliceListeners[key];
        listeners.forEach((listener) => {
          try {
            listener({
              newState: readonly(currValue),
              oldState: readonly(prevValue),
              changedKeys: getChangedKeys(currValue[key], prevValue[key]),
              changedPaths: getChangedPaths(currValue[key], prevValue[key]),
              newValue: readonly(currValue)[key],
              oldValue: readonly(prevValue)[key],
            });
          } catch (e) {
            console.error("Error in listener for slice " + key + ": " + e);
          }
        });
      });
    };


    const store = {
      getState: () => readonly(_state),

      dispatch: (action) => {
        let prevState = clone(_state);
        _state = _reducer(_state, action);  // Mutate state directly for easier state handling

        if (JSON.stringify(_state) === JSON.stringify(prevState)) return;

        attachSubscriptions(_state);

        notifyGlobalListeners(_state, prevState);
        notifySliceListeners(_state, prevState);
      },

      subscribe: (listener) => {
        if (typeof listener !== "function") throw new Error("Listener must be a function");
        if (globalListeners.indexOf(listener) !== -1) {
          throw new Error("Listener already subscribed");
        }

        globalListeners.push(listener);

        const unsubscribe = () => {
          let idx = globalListeners.indexOf(listener);
          if (idx >= 0) globalListeners.splice(idx, 1);
        };

        return unsubscribe;
      },

      addReducer: (reducer) => {
        Object.assign(_reducer, reducer);
      },
    };

    attachSubscriptions(_state);

    return store;
  };

  module.exports = StateStore;
})(module);
