var datapoints = [];
var bounds = [];

var k = 1;

var x;
var y;

var DP_COUNT = 50;

function setup() {
	createCanvas(1440, 840);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i] = new Datapoint(
			random(width),
			random(height)
		);
	}
	for (var i = 0; i < k; i++) {
		bounds[i] = new Boundary(
			// random(width),
			// random(width),
			// random(height),
			// random(height)
			20, 200, 40, 600
		);
	}
}

function draw() {
	background(51);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i].show();
	}
	for (var i = 0; i < k; i++) {
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
	}
}
