'use strict';

const http = require('https');

module.exports = function (nodecg) {

	nodecg.log.info('Setting up!');

	const rawSchedule = nodecg.Replicant('raw_schedule', {defaultValue: []});

	const masterControl = nodecg.Replicant('master_control', {
		defaultValue: {
			currentDay: 'day_1'
		}
	});

	const room1Rep = nodecg.Replicant('room_1', {
		defaultValue: {
			day_1: [],
			day_2: [],
			day_3: [],
		}
	});
	const room2Rep = nodecg.Replicant('room_2', {
		defaultValue: {
			day_1: [],
			day_2: [],
			day_3: [],
		}
	});
	const room3Rep = nodecg.Replicant('room_3', {
		defaultValue: {
			day_1: [],
			day_2: [],
			day_3: [],
		}
	});

	const room1Active = nodecg.Replicant('room_1_active', {defaultValue: {}});
	const room2Active = nodecg.Replicant('room_2_active', {defaultValue: {}});
	const room3Active = nodecg.Replicant('room_3_active', {defaultValue: {}});

	nodecg.listenFor('syncSchedule', (data, cb) => {
		nodecg.log.info('Synchronising Schedule Data');
		http.get("https://perlcon.eu/schedule/json", (res) => {
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				rawSchedule.value = JSON.parse(data);
				cb(null);
			});
		}).on('error', (err) => {
			cb(err.message);
		});
	});

	nodecg.listenFor('processSchedule', (data, cb) => {
		nodecg.log.info('Processing Schedule Data');
		const schedule = rawSchedule.value;

		// Reset everything
		room1Rep.value = {day_1: [], day_2: [], day_3: []};
		room2Rep.value = {day_1: [], day_2: [], day_3: []};
		room3Rep.value = {day_1: [], day_2: [], day_3: []};

		schedule.sort((a, b) => {
			const ad = new Date(`${a.date} ${a.time}`);
			const bd = new Date(`${b.date} ${b.time}`);
			if (ad > bd) return 1;
			if (ad < bd) return -1;
			return 0;
		});

		schedule.forEach((e) => {
			e = Object.assign({}, e);
			switch (e.room) {
				case '1':
					switch (e.day) {
						case 1:
							room1Rep.value.day_1.push(e);
							break;
						case 2:
							room1Rep.value.day_2.push(e);
							break;
						case 3:
							room1Rep.value.day_3.push(e);
							break;
					}
					break;
				case '2':
					switch (e.day) {
						case 1:
							room2Rep.value.day_1.push(e);
							break;
						case 2:
							room2Rep.value.day_2.push(e);
							break;
						case 3:
							room2Rep.value.day_3.push(e);
							break;
					}
					break;
				case '3':
					switch (e.day) {
						case 1:
							room3Rep.value.day_1.push(e);
							break;
						case 2:
							room3Rep.value.day_2.push(e);
							break;
						case 3:
							room3Rep.value.day_3.push(e);
							break;
					}
					break;
			}
		})
	});

	nodecg.listenFor('setDay', (data, cb) => {
		masterControl.value.currentDay = data;
		cb(null);
	});

	nodecg.listenFor('setRoom', (data, cb) => {
		switch (data.room) {
			case 'room_1':
				setRoom(data, room1Rep, room1Active);
				break;
			case 'room_2':
				setRoom(data, room2Rep, room2Active);
				break;
			case 'room_3':
				setRoom(data, room3Rep, room3Active);
				break;
		}
	});

	function setRoom(data, active, target) {
		let talk = active.value[data.day][data.index];

		// TODO check if actually exists
		let img = `https://perlcon.eu/i/talk/${talk.id}.png`;

		target.value = {
			name: talk.name,
			talk: talk.title,
			img: img,
		};
	}
};
