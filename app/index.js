import VocabularyTrainer from './_vocabulary-trainer';
// import vocabulary from './vocabulary/index';
import './vendor/shuffleArray';
// import 'bootstrap/js/dist/collapse';


let vocabularyTrainer;

document.addEventListener("DOMContentLoaded", function () {
	try {
		document.querySelectorAll('.version').forEach(el=>el.innerHTML = VERSION);
		
		let app = firebase.app();
		let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
		let provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider)
			.then(r => {
				let photo = document.createElement('img')
				photo.src = r.user.photoURL;
				photo.classList.add('avatar');
				let name = document.createElement('span');
				name.innerHTML = r.user.displayName;
				document.querySelector('#user').appendChild(photo);
				document.querySelector('#user').appendChild(name);
				let vocabDatabase = app.database().ref('/vocabulary/');
				console.log(`Firebase SDK loaded with ${features.join(', ')}`);
				vocabDatabase.once('value')
					.then(snapshot => {
						let vocab = snapshot.val();
						document.querySelector('#loading').classList.remove('active');
						vocabularyTrainer = new VocabularyTrainer(vocab);
					});
			})
	} catch (e) {
		console.error(e);
	}

});
