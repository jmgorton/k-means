function Datapoint(x, y) {
	this.x = x;
	this.y = y;

	this.grouping = null;
	this.boundary = null;


	// if you instead type this.show() = ...
	// it will mess up the whole thing
	this.show = function() {
		stroke(255);
		strokeWeight(0.1);
		fill(255);
		rectMode(CENTER);
		rect(this.x, this.y, 2, 2);
	}

	this.setGrouping = function(newGrouping) {
		this.grouping = newGrouping;
	}

	this.setBoundary = function(newBoundary) {
		this.boundary = newBoundary;
	}

}

