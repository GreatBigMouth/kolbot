/**
 * @description More clean way of using gameevent
 * @Author Jaenster
 */


(function (module, require) {
	const myEvents = new (require('../modules/Events'));
	const Worker = require('../modules/Worker');


	Worker.runInBackground.gameevent = (new function () {
		const workBench = [];
		const types = {};
		types[0x00] = 'timeout';
        types[0x01] = types[0x03] = 'quit';
		types[0x02] = 'join';
		types[0x06] = 'slain';
		//types[0x07] = 'hostile';
		types[0x07] = 'relations';
		types[0x11] = 'soj';
		types[0x12] = 'clone';
		addEventListener('gameevent', (...data) => workBench.push(data));

		this.update = function () {
			if (!workBench.length) return true;

			let work = workBench.splice(0, workBench.length);
			work.forEach(function (data) {
				const [mode, param1, param2, name1, name2] = data;
				const args = [];
				if (types[mode] === 'timeout' || 
					types[mode] === 'quit' || 
					types[mode] === 'join' || 
					(types[mode] === 'slain' && param2 === 0x03)) {
						args.push(types[mode], name1, name2);
					} else if (types[mode] === 'relations') {
						const vals = {
							0x03: 'hostile',
							0x04: 'unhostile',
							0x07: 'partyjoin',
							0x09: 'partyleave'
						}
						if (Object.keys(vals).map(val => parseInt(val)).includes(param2)) {
							args.push(vals[param2], name1);
						}
					} else if (types[mode] === 'soj') {
						args.push(types[mode], param1);
					}
				
				args.length > 0 && myEvents.emit.apply(myEvents, args); // trigger the events
			});

			return true; // always, to keep looping;
		}
	}).update;


	/**
	 * @type {{once: ((function(*=, *): void)|*), off: ((function(*, *): void)|*), on: ((function(*=, *=): *)|*)}}
	 */
	module.exports = {
		/**
		 * @event module:GameData#quit
		 * @param {string} name
		 * @param {string} account
		 *
		 * @event module:GameData#join
		 * @param {string} name
		 * @param {string} account
		 *
		 * @event module:GameData#slain
		 * @param {string} name
		 * @param {string} killer
		 *
		 * @event module:GameData#hostile
		 * @param {string} name
		 *
		 * @event module:GameData#soj
		 * @param {string} count
		 *
		 * @event module:GameData#clone
		 */
		on: myEvents.on,
		off: myEvents.off,
		once: myEvents.once,
	};
})(module, require);