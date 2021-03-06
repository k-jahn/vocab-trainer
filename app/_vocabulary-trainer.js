'use strict';

const RATINGS = require('./_ratings');

module.exports = class VocabularyTrainer {


	constructor(vocabulary) {
		// status vars
		this.vocabulary = vocabulary;
		this.aktuelleVokabeln = [];
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.history = [];
		this.index = 0;
		this.round = 1;
		this.abfrageSprache;
		this.vorgebeneSprache;

		// elemente
		this.el = {};
		this.el.currentList = document.querySelector('#currentList');
		this.el.gameState = document.querySelector('#gameState');
		this.el.end = document.querySelector('#end');;
		this.el.newGame = document.querySelector('#newGame');
		this.el.nextRound = document.querySelector('#nextRound');
		this.el.nextList = document.querySelector('#nextList');
		this.el.selectBook = document.querySelector("#selectBook");
		this.el.selectUnit = document.querySelector("#selectUnit");
		this.el.selectList = document.querySelector("#selectList");
		this.el.gameBox = document.querySelector('#gameBox');;
		this.el.stats = document.querySelector('#stats');
		this.el.startDeutsch = document.querySelector("#startDeutsch");
		this.el.startEnglish = document.querySelector("#startEnglish");
		this.el.startRound = document.querySelector("#startRound");
		this.el.history = document.querySelector('#history');
		this.el.abfrageFeld;
		this.el.vorgabeFeld;

		// add event listeners
		this.el.startDeutsch.addEventListener('click', function (e) { this.newGameListener('de', 'en'); }.bind(this));
		this.el.startDeutsch.addEventListener('touch', function (e) { this.newGameListener('de', 'en'); }.bind(this));
		this.el.startEnglish.addEventListener('click', function (e) { this.newGameListener('en', 'de'); }.bind(this));
		this.el.startEnglish.addEventListener('touch', function (e) { this.newGameListener('en', 'de'); }.bind(this));
		this.el.nextRound.addEventListener('click', function (e) { this.startNeueRunde(); }.bind(this));
		this.el.nextRound.addEventListener('touch', function (e) { this.startNeueRunde(); }.bind(this));
		this.el.nextList.addEventListener('click', function (e) { this.showNewGame(); }.bind(this));
		this.el.nextList.addEventListener('touch', function (e) { this.showNewGame(); }.bind(this));
		this.el.selectBook.addEventListener('change', function (e) { this.populateSelectListener(this.el.selectUnit, this.vocabulary.books[e.target.value]); }.bind(this));
		this.el.selectUnit.addEventListener('change', function (e) { this.populateSelectListener(this.el.selectList, this.vocabulary.books[this.el.selectBook.value].units[e.target.value]); }.bind(this));
		this.showNewGame();

		// populate book select
		this.populateSelectListener(this.el.selectBook, this.vocabulary);
	}

	// event listnener functions
	populateSelectListener(selectElement, object) {
		selectElement.innerHTML = '';
		for (let key of ['books', 'units', 'lists']) {
			if (object.hasOwnProperty(key)) {
				object[key].forEach((el, i) => {
					let option = document.createElement('option');
					option.innerHTML = el.name;
					option.value = i;
					selectElement.appendChild(option);
				})
			};
		}
		selectElement.dispatchEvent(new Event('change'));
	};

	newGameListener(abfrageSprache, vorgebeneSprache) {
		this.abfrageSprache = abfrageSprache;
		this.vorgebeneSprache = vorgebeneSprache;
		this.newGame();
	}

	newGame() {
		if (!this.el.selectList.value) return;

		// show gameState
		this.el.gameState.classList.add('active');
		this.el.stats.classList.add('active');

		// neue vokabelliste
		this.aktuelleVokabeln = this.vocabulary
			.books[this.el.selectBook.value]
			.units[this.el.selectUnit.value]
			.lists[this.el.selectList.value]
			.vocabulary.shuffle();;
		this.el.currentList.innerHTML = [
			this.vocabulary
				.books[this.el.selectBook.value]
				.name,
			this.vocabulary
				.books[this.el.selectBook.value]
				.units[this.el.selectUnit.value]
				.name,
			'<strong>' +
			this.vocabulary
				.books[this.el.selectBook.value]
				.units[this.el.selectUnit.value]
				.lists[this.el.selectList.value]
				.name +
			'</strong>',
			this.abfrageSprache == 'en' ? 'english' : 'deutsch'
		].join(' | ');
		// werte auf startwerte zuruecksetzen
		this.history = [];
		this.richtigeVokabeln = [];
		this.round = 1;
		this.index = 0;
		this.el.history.innerHTML = '';
		// display
		this.el.newGame.classList.remove('active');
		this.el.currentList.classList.add('active');
		this.el.end.classList.remove('active');
		this.el.gameBox.classList.add('active');
		// abfrageFeld
		let abfrageAnzeige = document.querySelector('#' + this.abfrageSprache);
		abfrageAnzeige.innerHTML = '';
		this.el.abfrageFeld = document.createElement('input');
		this.el.abfrageFeld.type = 'text';
		this.el.abfrageFeld.id = 'abfrageFeld';
		this.el.abfrageFeld.autocomplete = 'off';
		this.el.abfrageFeld.autocorrect = 'off';
		this.el.abfrageFeld.autocapitalize = 'off';
		this.el.abfrageFeld.spellcheck = false;
		this.el.abfrageFeld.addEventListener('keydown', this.enterGedrueckt.bind(this));
		abfrageAnzeige.appendChild(this.el.abfrageFeld);
		// vorgabeFeld
		let vorgabeAnzeige = document.querySelector('#' + this.vorgebeneSprache);
		vorgabeAnzeige.innerHTML = '';
		this.el.vorgabeFeld = document.createElement('span');
		this.el.vorgabeFeld.id = 'vorgabeFeld';
		vorgabeAnzeige.appendChild(this.el.vorgabeFeld);
		this.el.abfrageFeld.focus();
		this.zeigeVorgabe();
		this.aktualisiereAnzeigen();
	}

	zeigeVorgabe() {
		this.el.vorgabeFeld.innerHTML = this.aktuelleVokabeln[this.index][this.vorgebeneSprache].join(', ');
	}

	enterGedrueckt(event) {
		if (event.key === 'Enter') {
			this.evaluateInput();
		}
	}

	evaluateInput() {
		// richtig oder falsch?
		const inputString = document.querySelector('#abfrageFeld').value;
		if (
			this.aktuelleVokabeln[this.index][this.abfrageSprache]
				.some(definition => !/^\(.+\)$/.test(definition) && definition === inputString)
		) {
			this.richtigeVokabeln.push(this.aktuelleVokabeln[this.index]);
			this.showWord(this.aktuelleVokabeln[this.index], false, true);
		} else {
			this.falscheVokabeln.push(this.aktuelleVokabeln[this.index]);
			this.showWord(this.aktuelleVokabeln[this.index], false, false, inputString);
		}
		this.el.abfrageFeld.value = '';
		// runde zuende?
		if (this.index < this.aktuelleVokabeln.length - 1) {
			this.index++;
			this.aktualisiereAnzeigen();
			this.zeigeVorgabe();
		} else {
			this.index++;
			this.history.push(this.richtigeVokabeln);
			this.el.gameBox.classList.remove('active');
			this.aktualisiereAnzeigen();
			if (this.falscheVokabeln.length) {
				this.showNewRound();
			} else {
				this.zeigeEnde();
			}
		}
	}

	zeigeEnde() {
		this.el.history.innerHTML = '';
		this.el.gameBox.classList.remove('active');
		this.el.gameState.classList.remove('active');
		this.el.end.classList.add('active');
		const total = this.history.reduce((a, r) => a + r.length, 0);
		const percentage = Math.round(100 * this.history[0].length / total);

		let { msg } = RATINGS.find(e => e.minScore <= percentage);

		this.el.end.querySelector('.wert:nth-child(1)').innerHTML = `${percentage}%`;
		this.el.end.querySelector('.wert:nth-child(2)').innerHTML = msg;
		this.history.slice(0, 4).forEach((r, i) => this.el.end.querySelector(`.round${i + 1}`).style.width = 100 * r.length / total + '%');
		this.el.end.querySelector('.round5').style.width = this.history[4] ? 100 * this.history.slice(4).reduce((a, e) => a + e.length, 0) / total + '%' : 0;
	}

	startNeueRunde() {
		this.el.history.innerHTML = '';
		this.el.nextRound.classList.remove('active');
		this.el.stats.classList.add('active');

		this.aktuelleVokabeln = this.falscheVokabeln.shuffle();
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.round++;
		this.index = 0;
		this.el.gameBox.classList.add('active');
		this.aktualisiereAnzeigen();
		this.zeigeVorgabe();
		this.el.abfrageFeld.focus();
	}

	showWord(word, end, correct, inputString) {
		let wordEl = document.createElement('div');
		wordEl.classList.add('word');
		let english = document.createElement('div');
		english.innerHTML = word.en.join(', ');
		let deutsch = document.createElement('div');
		deutsch.innerHTML = word.de.join(', ');
		if (!correct) {
			let wrong = this.abfrageSprache == 'de' ? deutsch : english;
			wordEl.classList.add('tooltip')
			wrong.classList.add('tooltip')
			let tooltip = document.createElement('span');
			tooltip.classList.add('tooltip-text', 'tooltip-bottom-arrow');
			tooltip.innerHTML = `Your answer: "${inputString}"`
			wrong.appendChild(tooltip);
		}
		wordEl.appendChild(english);
		wordEl.appendChild(deutsch);
		if (end) {
			this.el.history.appendChild(wordEl);
		} else {
			wordEl.classList.add(correct ? 'richtig' : 'falsch');
			this.el.history.insertBefore(wordEl, this.el.history.firstChild);
		}
	}


	aktualisiereAnzeigen() {
		document.querySelector('#anzeigeRunde .wert').innerHTML = this.round;
		document.querySelector('#gameState .progress-bar.richtig').style.width = 100 * this.richtigeVokabeln.length / this.aktuelleVokabeln.length + '%';
		document.querySelector('#gameState .progress-bar.falsch').style.width = 100 * this.falscheVokabeln.length / this.aktuelleVokabeln.length + '%';
	}

	showNewRound() {
		this.el.stats.classList.remove('active');
		this.el.nextRound.classList.add('active');
		this.el.nextRound.innerHTML = `Round ${this.round + 1}`
		this.el.nextRound.focus();
	}

	showNewGame() {
		[1, 2, 3, 4, 5].forEach(i => this.el.end.querySelector(`.round${i}`).style.width = 0);
		this.el.end.classList.remove('active');
		this.el.history.innerHTML = '';
		this.el.currentList.classList.remove('active');
		this.el.nextRound.classList.remove('active');
		this.el.newGame.classList.add('active');
		this.el.startEnglish.focus();
	}
};
