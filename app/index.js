import VocabularyTrainer from './vocabulary-trainer';
// import vocabulary from './vocabulary/index';
import './vendor/shuffleArray';
// import 'bootstrap/js/dist/collapse';


let vocabularyTrainer;

document.addEventListener("DOMContentLoaded", function () {
	try {
		document.querySelectorAll('.version').forEach(el=>el.innerHTML = VERSION);
		
		let app = firebase.app();
		let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
		let vocabDatabase = app.database().ref('/vocabulary/');
		console.log(`Firebase SDK loaded with ${features.join(', ')}`);
		// vocabDatabase.remove()
		// 	.then(_ => {
		// 		vocabDatabase.set(vocabulary);
		// 		console.log('vocabulary uploaded!');
		// 		console.log(vocabulary);
		// 	});
		vocabDatabase.once('value')
			.then(snapshot => {
				let vocab = snapshot.val();
				document.querySelector('#loading').classList.remove('active');
				vocabularyTrainer = new VocabularyTrainer(vocab);
			});
	} catch (e) {
		console.error(e);
	}

});
