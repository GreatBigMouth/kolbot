(function(module) {
  // We have this in misc module for the restock system, 
  // but will better copy it here since this is supposed to be a generic module
  const readonly = (() => {
    const cache = new WeakMap();

    const wrap = (obj) => {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      if (cache.has(obj)) {
        return cache.get(obj);
      }

      const proxy = new Proxy(obj, {
        get: (target, prop) => {
          const value = target[prop];
          return (typeof value === "object" && value !== null)
            ? wrap(value)
            : value;
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

      cache.set(obj, proxy); // store proxy for reuse
      return proxy;
    };

    return wrap;
  })();

  const StateStore = (params = {}) => {
    const { initialState, reducer } = params;

    const globalListeners = [];
    const sliceListeners = {};
    let _state = Object.assign({}, initialState);
    let _reducer = reducer;

    const attachSubscribe = (store, state) => {
      Object.defineProperty(state, "subscribe", {
        value: store.subscribe,
        writable: true,
        //enumerable: false
      });

      Object.keys(state).forEach(slice => {
        if (typeof state[slice] === "object") {
          Object.defineProperty(state[slice], "subscribe", {
            value: store.subscribeToSlice(slice),
            writable: true,
            //enumerable: false
          });
        }
      });
    };

    const store = {
      getState: () => readonly(_state),

      dispatch: (action) => {
        // Clone the state since it's being directly mutated in the reducer
        let prevState = clone(_state);
        _state = _reducer(_state, action);

        if (JSON.stringify(_state) === JSON.stringify(prevState)) return;

        attachSubscribe(store, _state);

        // Notify global listeners
        globalListeners.forEach(listener => listener({
          newState: _state,
          prevState: prevState,
          action: action
        }));

        // Notify slice listeners
        Object.keys(_state).forEach(slice => {
          if (JSON.stringify(_state[slice]) === JSON.stringify(prevState[slice])) return;
          
          if (sliceListeners.hasOwnProperty(slice)) {
            sliceListeners[slice].forEach(listener => listener({
              newState: _state,
              prevState: prevState,
              newSlice: _state[slice],
              prevSlice: prevState[slice],
              action: action,
            }));
          }
        });
      },

      subscribe: (listener) => {
        if (typeof listener !== "function") throw new Error("Listener must be a function");
        if (globalListeners.indexOf(listener) !== -1) throw new Error("Listener already subscribed");

        globalListeners.push(listener);

        const unsubscribe = () => {
          const index = globalListeners.indexOf(listener);
          if (index > -1) {
            globalListeners.splice(index, 1);
          }
        };

        return unsubscribe;
      },

      subscribeToSlice: (slice) => (listener) => {
        if (typeof listener !== "function") throw new Error("Listener must be a function");

        if (!sliceListeners.hasOwnProperty(slice)) {
          sliceListeners[slice] = [];
        }
        sliceListeners[slice].push(listener);

        const unsubscribe = () => {
          const index = sliceListeners[slice].indexOf(listener);
          if (index > -1) {
            sliceListeners[slice].splice(index, 1);
          }
          if (sliceListeners[slice].length === 0) {
            delete sliceListeners[slice];
          }
        };

        return unsubscribe;
      },

      addReducer: (reducer) => {
        Object.assign(_reducer, reducer);
      }
    };

    attachSubscribe(store, _state);

    return store;
  };
  
  module.exports = StateStore;
})(module, require);
