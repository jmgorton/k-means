function Datapoint(x, y) {
	this.x = x;
	this.y = y;


	this.show = function() {
		fill(255);
		rectMode(CENTER);
		rect(this.x, this.y, 3, 3);
	}

}
