var datapoints = [];
var bounds = [];

var k = 3;

var x;
var y;

var DP_COUNT = 50;

function setup() {
	createCanvas(1440, 840);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i] = new Datapoint(random(width), random(height));
	}
	for (var i = 0; i < k; i++) {
		bounds[i] = new Boundary();
	}
	
	return;
}

function draw() {
	background(51);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i].show();
	}
	for (var i = 0; i < k; i++) {
		bounds[i].show();
	}

	return;
}

function keyPressed() {
	if (key === ' ') {
		// update boundaries
	}
	else if (key === 'n') {
		for (var i = 0; i < DP_COUNT; i++) {
			datapoints[i] = new Datapoint(random(width), random(height));
		}
	}
}
