
import testbook from './testbook/index';
import book2 from './book2/index';



const vocabulary = {
	// testbook: testbook,
	book2: book2,
};


const outputElement = document.querySelector('#output')


document.addEventListener("DOMContentLoaded", function () {
	try {
		let app = firebase.app();
		let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
		let vocabDatabase = app.database().ref('/vocabulary/');
		outputElement.innerHTML += (`<p>Firebase SDK loaded with ${features.join(', ')}</p>`);
		outputElement.innerHTML += (`<p>Removing current vocabulary db</p>`);
		vocabDatabase.remove()
		.then(_ => {
			outputElement.innerHTML += ('<p>starting upload...</p>');
			vocabDatabase.set(vocabulary);
			outputElement.innerHTML += ('<p>vocabulary uploaded!</p>');
			outputElement.innerHTML += (`<pre>${JSON.stringify(vocabulary, null, 2)}</pre>`);
		});
	} catch (e) {
		outputElement.innerHTML += (`<p>Error!</p>`);
		outputElement.innerHTML += (`<pre>${JSON.stringify(e, null, 2)}</pre>`);
	}
});
