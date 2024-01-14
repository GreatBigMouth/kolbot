/**
 * @author Nishimura-Katsuo, Jaenster
 * @description a basic implementation of delta's
 *
 */
(function (module, require) {
	const Worker = require("Worker");
	let instances = 0;

	/** @constructor
	 * @class Delta */
	module.exports = function (trackers) {
		let active = true;
		this.values = (Array.isArray(trackers) && (Array.isArray(trackers.first()) && trackers || [trackers])) || [];
		this.track = function (id, checkerFn, callback) {
			!id && (id = instances + 1);
			return this.values.push({ id: id, active: true, fn: checkerFn, callback: callback, value: checkerFn() });
		};
		this.check = function () {
			this.values.some(delta => {
				if (delta.active) {
					let val = delta.fn();

					if (delta.value !== val) {
						let ret = delta.callback(delta.value, val);
						delta.value = val;

						return ret;
					}
				}

				return null;
			});
		};

		this.toggle = (id) => id && (this.values.forEach(delta => (delta.id === id) && (delta.active = !delta.active)));

		//this.untrack = (id) => id && (this.values.splice(this.values.findIndex(delta => delta.id === id), 1));
		/*this.untrack = (id) => {
			if (id) {
				let i = this.values.findIndex(delta => delta.id === id);
				if (i === -1) return false;
				this.values.splice(i, 1);
			}
			return false;
		};*/

		this.untrack = (id) => this.values = this.values.filter(delta => delta.id !== id);

		this.destroy = () => active = false;

		Worker.runInBackground["__delta" + (instances++)] = () => active && (this.check() || true);
		return this;
	};

}).call(
	null,
	typeof module === "object" && module || {},
	typeof require === "undefined" && (include("require.js") && require) || require
);
