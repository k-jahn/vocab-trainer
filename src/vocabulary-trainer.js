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
		this.el.nextList = document.querySelector('#nextList');
		this.el.currentList = document.querySelector('#currentList');
		this.el.nextRound = document.querySelector('#nextRound');
		this.el.startEnglish = document.querySelector("#startEnglish");
		this.el.startDeutsch = document.querySelector("#startDeutsch");
		this.el.startRound = document.querySelector("#startRound");
		this.el.selectList = document.querySelector("select");
		this.el.spielBox = document.querySelector('#spielBox');;
		this.el.end = document.querySelector('#end');;
		this.el.verlauf = document.querySelector('#verlauf');
		this.el.abfrageFeld;
		this.el.vorgabeFeld;
		// populate select
		for (let list in this.vocabulary) {
			let option = document.createElement('option');
			option.innerHTML = this.vocabulary[list].name;
			option.value = list;
			this.el.selectList.appendChild(option);
		}

		// event listneners
		const newGameListener = function (abfrageSprache, vorgebeneSprache) {
			this.abfrageSprache = abfrageSprache;
			this.vorgebeneSprache = vorgebeneSprache;
			this.newGame();
		}.bind(this);
		this.el.startDeutsch.addEventListener('click', e => newGameListener('de', 'en'));
		this.el.startDeutsch.addEventListener('touch', e => newGameListener('de', 'en'));
		this.el.startEnglish.addEventListener('click', e => newGameListener('en', 'de'));
		this.el.startEnglish.addEventListener('touch', e => newGameListener('en', 'de'));
		this.el.startRound.addEventListener('click', e => this.startNeueRunde().bind(this));
		this.el.startRound.addEventListener('touch', e => this.startNeueRunde().bind(this));
		this.showNewGame();
	}

	
	newGame() {
		if (!this.el.selectList.value) return;
		// neue vokabelliste
		this.aktuelleVokabeln = this.vocabulary[this.el.selectList.value].vocabulary.shuffle();;
		this.el.currentList.innerHTML = `${this.vocabulary[this.el.selectList.value].name} | ${this.abfrageSprache == 'en' ? 'english' : 'deutsch'}`;
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
