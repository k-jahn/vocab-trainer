'use strict';

module.exports = class VocabularyTrainer {


	constructor(vocabulary) {
		// status vars
		this.vocabulary = vocabulary;
		this.aktuelleVokabeln = [];
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.verlauf = [];
		this.index = 0;
		this.round = 1;
		this.abfrageSprache;
		this.vorgebeneSprache;

		// elemente
		this.el = {};
		this.el.currentList = document.querySelector('#currentList');
		this.el.controlpanel = document.querySelector('#controlpanel');
		this.el.end = document.querySelector('#end');;
		this.el.nextList = document.querySelector('#nextList');
		this.el.nextRound = document.querySelector('#nextRound');
		this.el.selectBook = document.querySelector("#selectBook");
		this.el.selectUnit = document.querySelector("#selectUnit");
		this.el.selectList = document.querySelector("#selectList");
		this.el.spielBox = document.querySelector('#spielBox');;
		this.el.startDeutsch = document.querySelector("#startDeutsch");
		this.el.startEnglish = document.querySelector("#startEnglish");
		this.el.startRound = document.querySelector("#startRound");
		this.el.verlauf = document.querySelector('#verlauf');
		this.el.abfrageFeld;
		this.el.vorgabeFeld;

		// show controlpanel
		this.el.controlpanel.classList.add('active');


		// add event listeners
		this.el.startDeutsch.addEventListener('click', function (e) { this.newGameListener('de', 'en'); }.bind(this));
		this.el.startDeutsch.addEventListener('touch', function (e) { this.newGameListener('de', 'en'); }.bind(this));
		this.el.startEnglish.addEventListener('click', function (e) { this.newGameListener('en', 'de'); }.bind(this));
		this.el.startEnglish.addEventListener('touch', function (e) { this.newGameListener('en', 'de'); }.bind(this));
		this.el.startRound.addEventListener('click', function (e) { this.startNeueRunde(); }.bind(this));
		this.el.startRound.addEventListener('touch', function (e) { this.startNeueRunde(); }.bind(this));
		this.el.selectBook.addEventListener('change', function (e) { this.populateSelectListener(this.el.selectUnit, this.vocabulary[e.target.value]); }.bind(this));
		this.el.selectUnit.addEventListener('change', function (e) { this.populateSelectListener(this.el.selectList, this.vocabulary[this.el.selectBook.value][e.target.value]); }.bind(this));
		this.showNewGame();

		// populate book select
		this.populateSelectListener(this.el.selectBook, this.vocabulary);
	}

	// event listnener functions
	populateSelectListener(selectElement, object) {
		selectElement.innerHTML = '';
		for (let key in object) {
			if (key === 'name') continue;
			let option = document.createElement('option');
			option.innerHTML = object[key].name;
			option.value = key;
			selectElement.appendChild(option);
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
		// neue vokabelliste
		this.aktuelleVokabeln = this.vocabulary[this.el.selectBook.value][this.el.selectUnit.value][this.el.selectList.value].vocabulary.shuffle();;
		this.el.currentList.innerHTML = [
			this.vocabulary[this.el.selectBook.value].name,
			this.vocabulary[this.el.selectBook.value][this.el.selectUnit.value].name,
			'<strong>' +
			this.vocabulary[this.el.selectBook.value][this.el.selectUnit.value][this.el.selectList.value].name +
			'</strong>',
			this.abfrageSprache == 'en' ? 'english' : 'deutsch'
		].join(' | ');
		// werte auf startwerte zuruecksetzen
		this.verlauf = [];
		this.richtigeVokabeln = [];
		this.round = 1;
		this.index = 0;
		this.el.verlauf.innerHTML = '';
		// display
		this.el.nextList.classList.remove('active');
		this.el.currentList.classList.add('active');
		this.el.end.classList.remove('active');
		this.el.spielBox.classList.add('active');
		// abfrageFeld
		let abfrageAnzeige = document.querySelector('#' + this.abfrageSprache);
		abfrageAnzeige.innerHTML = '';
		this.el.abfrageFeld = document.createElement('input');
		this.el.abfrageFeld.type = 'text';
		this.el.abfrageFeld.id = 'abfrageFeld';
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
		if (event.keyCode == 13 && event.target.value) {
			event.preventDefault();
			this.evaluateInput();
		}
	}

	evaluateInput() {
		// richtig oder falsch?
		if (
			this.aktuelleVokabeln[this.index][this.abfrageSprache]
				.some(definition => definition == document.querySelector('#abfrageFeld').value)
		) {
			this.richtigeVokabeln.push(this.aktuelleVokabeln[this.index]);
			this.zeigeAbgefragteVokabel(this.aktuelleVokabeln[this.index], 'richtig');
		} else {
			this.falscheVokabeln.push(this.aktuelleVokabeln[this.index]);
			this.zeigeAbgefragteVokabel(this.aktuelleVokabeln[this.index], 'falsch');
		}
		this.el.abfrageFeld.value = '';
		// runde zuende?
		if (this.index < this.aktuelleVokabeln.length - 1) {
			this.index++;
			this.aktualisiereAnzeigen();
			this.zeigeVorgabe();
		} else {
			this.verlauf.push(this.richtigeVokabeln);
			this.el.spielBox.classList.remove('active');
			this.aktualisiereAnzeigen();
			if (this.falscheVokabeln.length) {
				this.showNewRound();
			} else {
				this.zeigeEnde();
			}
		}
	}

	zeigeEnde() {
		this.el.verlauf.innerHTML = '';
		this.showNewGame();
		this.el.spielBox.classList.remove('active');
		this.el.end.classList.add('active');
		const score = this.verlauf.reduce(function (a, x, i) {
			switch (i) {
				case 0:
					return {
						achieved: a.achieved + 10 * x.length,
						max: a.max + 10 * x.length
					};
				case 1:
					return {
						achieved: a.achieved + 5 * x.length,
						max: a.max + 10 * x.length
					};
				case 2:
					return {
						achieved: a.achieved + 2 * x.length,
						max: a.max + 10 * x.length
					};
				case 3:
					return {
						achieved: a.achieved + 1 * x.length,
						max: a.max + 10 * x.length
					};
				default:
					return {
						achieved: a.achieved,
						max: a.max + 10 * x.length
					};
			}
		}, { achieved: 0, max: 0 });
		this.el.end.querySelector('.wert:nth-child(1)').innerHTML = score.achieved;
		this.el.end.querySelector('.wert:nth-child(2)').innerHTML = score.max;
		console.log(this.verlauf);
		this.verlauf.forEach(function (runde, i) {
			let rundenUeberschrift = document.createElement('h3');
			rundenUeberschrift.innerHTML = 'Runde ' + (i + 1) + ':';
			this.el.verlauf.appendChild(rundenUeberschrift);
			runde.forEach(function (vokabel) {
				this.zeigeAbgefragteVokabel(vokabel, 'richtig', true);
			}.bind(this));
		}.bind(this));
	}

	startNeueRunde() {
		this.el.verlauf.innerHTML = '';
		this.el.nextRound.classList.remove('active');
		this.aktuelleVokabeln = this.falscheVokabeln.shuffle();
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.round++;
		this.index = 0;
		this.el.spielBox.classList.add('active');
		this.aktualisiereAnzeigen();
		this.zeigeVorgabe();
		this.el.abfrageFeld.focus();
	}


	zeigeAbgefragteVokabel(vokabel, richtig, end) {
		let wortPaar = document.createElement('div');
		wortPaar.classList.add('wortPaar');
		let english = document.createElement('div');
		english.innerHTML = vokabel.en.join(', ');
		let deutsch = document.createElement('div');
		deutsch.innerHTML = vokabel.de.join(', ');
		wortPaar.appendChild(english);
		wortPaar.appendChild(deutsch);
		wortPaar.classList.add(richtig);
		if (end) {
			this.el.verlauf.appendChild(wortPaar);
		} else {
			this.el.verlauf.insertBefore(wortPaar, this.el.verlauf.firstChild);
		}
	}


	aktualisiereAnzeigen() {
		document.querySelector('#anzeigeRunde .wert').innerHTML = this.round;
		document.querySelector('#anzeigeVokabeln .wert:nth-child(1)').innerHTML = this.index + 1;
		document.querySelector('#anzeigeVokabeln .wert:nth-child(2)').innerHTML = this.aktuelleVokabeln.length;
		document.querySelector('#anzeigeRichtig .wert').innerHTML = this.richtigeVokabeln.length;
		document.querySelector('#anzeigeFalsch .wert').innerHTML = this.falscheVokabeln.length;

	}

	showNewRound() {
		this.el.nextRound.classList.add('active');
		this.el.startEnglish.focus();
	}

	showNewGame() {
		this.el.nextList.classList.add('active');
		this.el.currentList.classList.remove('active');
		this.el.nextRound.classList.remove('active');
		this.el.startEnglish.focus();
	}
};