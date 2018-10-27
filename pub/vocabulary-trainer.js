'use strict';

class VocabularyTrainer {
	constructor(vocabulary) {
		// status vars
		this.vocabulary = vocabulary;
		this.aktuelleVokabeln = [];
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.verlauf = [];
		this.index = 0;
		this.runde = 1;
		this.abfrageSprache;
		this.vorgebeneSprache;
		// elemente
		this.el = {};
		this.el.controlpanel = document.querySelector('#controlpanel');
		this.el.nextList = this.el.controlpanel.querySelector('#nextList');
		this.el.nextRound = this.el.controlpanel.querySelector('#nextRound');
		this.el.startEnglish = this.el.controlpanel.querySelector("#startEnglish");
		this.el.startDeutsch = this.el.controlpanel.querySelector("#startDeutsch");
		this.el.startRound = this.el.controlpanel.querySelector("#startRound");
		this.el.selectList = this.el.controlpanel.querySelector("select");
		this.el.spielBox = document.querySelector('#spielBox');;
		this.el.ende = document.querySelector('#ende');;
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
			this.neuesSpiel();
		}.bind(this);
		this.el.startDeutsch.addEventListener('click', e => newGameListener('deutsch', 'english'));
		this.el.startDeutsch.addEventListener('touch', e => newGameListener('deutsch', 'english'));
		this.el.startEnglish.addEventListener('click', e => newGameListener('english', 'deutsch'));
		this.el.startEnglish.addEventListener('touch', e => newGameListener('english', 'deutsch'));
		this.el.startRound.addEventListener('click', e => this.startNeueRunde().bind(this));
		this.zeigeNeuesSpiel();
	}


	neuesSpiel() {
		if (!this.el.selectList.value) return;
		// neue vokabelliste
		this.aktuelleVokabeln = this.vocabulary[this.el.selectList.value].vocabulary.shuffle();;
		// werte auf startwerte zuruecksetzen
		this.runde = 1;
		this.index = 0;
		this.el.verlauf.innerHTML = '';
		this.el.nextList.classList.remove('aktiv');
		this.el.ende.classList.remove('aktiv');
		// anzeige and
		this.el.spielBox.classList.add('aktiv');
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
			this.werteEingabe();
		}
	}

	werteEingabe() {
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
			this.el.spielBox.classList.remove('aktiv');
			this.aktualisiereAnzeigen();
			if (this.falscheVokabeln.length) {
				this.zeigeNeueRunde();
			} else {
				this.zeigeEnde();
				this.verlauf = [];
				this.richtigeVokabeln = [];
			}
		}
	}

	zeigeEnde() {
		this.el.verlauf.innerHTML = '';
		this.zeigeNeuesSpiel();
		this.el.spielBox.classList.remove('aktiv');
		this.el.ende.classList.add('aktiv');
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
		this.el.ende.querySelector('.wert:nth-child(1)').innerHTML = score.achieved;
		this.el.ende.querySelector('.wert:nth-child(2)').innerHTML = score.max;
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
		this.aktuelleVokabeln = this.falscheVokabeln.shuffle();
		this.falscheVokabeln = [];
		this.richtigeVokabeln = [];
		this.runde++;
		this.index = 0;
		this.el.spielBox.classList.add('aktiv');
		this.aktualisiereAnzeigen();
		this.zeigeVorgabe();
		this.el.abfrageFeld.focus();
	}


	zeigeAbgefragteVokabel(vokabel, richtig, ende) {
		let wortPaar = document.createElement('div');
		wortPaar.classList.add('wortPaar');
		let english = document.createElement('div');
		english.innerHTML = vokabel.english.join(', ');
		let deutsch = document.createElement('div');
		deutsch.innerHTML = vokabel.deutsch;
		wortPaar.appendChild(english);
		wortPaar.appendChild(deutsch);
		wortPaar.classList.add(richtig);
		if (ende) {
			this.el.verlauf.appendChild(wortPaar);
		} else {
			this.el.verlauf.insertBefore(wortPaar, this.el.verlauf.firstChild);
		}
	}


	aktualisiereAnzeigen() {
		document.querySelector('#anzeigeRunde .wert').innerHTML = this.runde;
		document.querySelector('#anzeigeVokabeln .wert:nth-child(1)').innerHTML = this.index + 1;
		document.querySelector('#anzeigeVokabeln .wert:nth-child(2)').innerHTML = this.aktuelleVokabeln.length;
		document.querySelector('#anzeigeRichtig .wert').innerHTML = this.richtigeVokabeln.length;
		document.querySelector('#anzeigeFalsch .wert').innerHTML = this.falscheVokabeln.length;

	}

	zeigeNeueRunde() {
		this.el.nextRound.classList.add('aktiv');
		this.el.nextList.classList.remove('aktiv');
		this.el.startEnglish.focus();
	}

	zeigeNeuesSpiel() {
		this.el.nextList.classList.add('aktiv');
		this.el.nextRound.classList.remove('aktiv');
		this.el.startEnglish.focus();
	}
}