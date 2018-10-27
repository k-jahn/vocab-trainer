Array.prototype.shuffle = function () {
	
	let out = this.slice(0);
	let i = out.length, r;

	// While there remain elements to shuffle...
	while (0 !== i) {

		// Pick a remaining element...
		r = Math.floor(Math.random() * i);
		i -= 1;

		// And swap it with the current element.
		[out[i], out[r]] = [out[r], out[i]];
	}

	return out;
};
