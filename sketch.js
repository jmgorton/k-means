var DP_COUNT = 150;
var CONCENTRATION_FACTOR = 1;
var K = 2;

var datapoints = [];
var bounds = [];

var trueMeans = [];


var x;
var y;

function setup() {
	createCanvas(1440, 840);

	for (var i = 0; i < K; i++) {
		trueMeans[i] = new Datapoint(
			random(width),
			random(height)
		);
	}
	for (var i = 0; i < DP_COUNT; i++) {
		// var x_i = random(K);
		// var y_i = random(K);
		var x_i = i % K;
		var y_i = i % K;

		var x = trueMeans[x_i].x;
		var y = trueMeans[y_i].y;

		for (var i = 0; i < 10 * CONCENTRATION_FACTOR; i++) {
			x += random(-99, 100);
			y += random(-99, 100);
		}
		
		datapoints[i] = new Datapoint(x, y);
	}
	for (var i = 0; i < K; i++) {
		bounds[i] = new Boundary(
			random(width),
			random(width),
			random(height),
			random(height)
		);
	}
}

function draw() {
	background(51);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i].show();
	}
	for (var i = 0; i < K; i++) {
		bounds[i].show();
	}
}

function keyPressed() {
	if (key === ' ') {
		// update boundaries
	}
	else if (key === 'n') {
		for (var i = 0; i < DP_COUNT; i++) {
			datapoints[i] = new Datapoint(
				random(width),
				random(height)
			);
		}
		for (var i = 0; i < K; i++) {
			bounds[i] = new Boundary(
				random(width),
				random(width),
				random(height),
				random(height)
			);
		}
	}
}
