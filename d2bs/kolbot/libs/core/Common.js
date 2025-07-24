/**
*  @filename    Common.js
*  @author      theBGuy
*  @desc        collection of functions shared between muliple scripts
*
*/

// each common functionality is loaded into this object when it's needed
// for the actual function files @see core/Common/
const Common = (function () {
  /**
   * @type {Map<string, any>}
   */
  const moduleCache = new Map();

  /**
   * @type {Map<string, string>}
   */
  const modulePathMap = new Map([
    ["Ancients", "./Common/Ancients"],
    ["Baal", "./Common/Baal"],
    ["Cain", "./Common/Cain"],
    ["Cows", "./Common/Cows"],
    ["Diablo", "./Common/Diablo"],
    ["Leecher", "./Common/Leecher"],
    ["Smith", "./Common/Smith"],
    ["Toolsthread", "./Common/Tools"],
  ]);

  /**
   * Lazy load a Common module
   * @param {string} moduleName - The name of the module to load
   * @returns {any} The loaded module
   */
  function loadModule(moduleName) {
    if (moduleCache.has(moduleName)) {
      return moduleCache.get(moduleName);
    }

    let modulePath = modulePathMap.get(moduleName);
    if (!modulePath) {
      throw new Error("Unknown module: " + moduleName);
    }

    try {
      console.debug("Loading Common module: " + moduleName + " from " + modulePath);
      let module = require(modulePath);
      moduleCache.set(moduleName, module);
      return module;
    } catch (error) {
      throw new Error("Failed to load module " + moduleName + ": " + error.message);
    }
  }

  return new Proxy({}, {
    /**
     * @param {Object} target
     * @param {string} property
     * @returns {any}
     */
    get: function (target, property) {
      if (typeof property === "string" && modulePathMap.has(property)) {
        return loadModule(property);
      }
      return target[property];
    },

    /**
     * @param {Object} target
     * @param {string} property
     * @param {any} value
     * @returns {boolean}
     */
    set: function (target, property, value) {
      target[property] = value;
      return true;
    },

    /**
     * @param {Object} target
     * @param {string} property
     * @returns {boolean}
     */
    has: function (target, property) {
      return typeof property === "string" && (
        modulePathMap.has(property)
        || target.hasOwnProperty(property)
      );
    },

    /**
     * @param {Object} target
     * @returns {string[]}
     */
    ownKeys: function (target) {
      return Array.from(modulePathMap.keys()).concat(Object.keys(target));
    },

    /**
     * @param {Object} target
     * @param {string} property
     * @returns {PropertyDescriptor | undefined}
     */
    getOwnPropertyDescriptor: function (target, property) {
      if (typeof property === "string" && modulePathMap.has(property)) {
        return {
          enumerable: true,
          configurable: true,
          get: function () {
            return loadModule(property);
          }
        };
      }
      return Object.getOwnPropertyDescriptor(target, property);
    },

    /**
     * @param {Object} target
     * @param {string} property
     * @returns {boolean}
     */
    deleteProperty: function (target, property) {
      if (typeof property === "string" && modulePathMap.has(property)) {
        // Remove from cache if it exists
        if (moduleCache.has(property)) {
          moduleCache.delete(property);
        }
        // Remove from target if it exists
        if (target.hasOwnProperty(property)) {
          delete target[property];
        }
        return true;
      }
      
      // Handle regular properties
      if (target.hasOwnProperty(property)) {
        delete target[property];
        return true;
      }
      
      return false;
    }
  });
})();
