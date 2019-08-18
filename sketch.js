var DP_COUNT = 150;
var CONCENTRATION_FACTOR = 1;
var K = 2;

var datapoints = [];
var dpCategory = [];
var bounds = [];

var trueMeans = [];
var calcMeans = [];

var x;
var y;

function setup() {
	createCanvas(1440, 840);

	pickTrueMeans();
	pickCalcMeans();

	placeDatapoints();

	// if you don't include this in the setup
	// the boundaries never get shown or updated for some reason
	// and the whole keyPressed() function breaks i guess
	for (var i = 0; i < K; i++) {
		bounds[i] = new Boundary(0, 0, 0, 0);
	}

	noLoop();
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
	// update boundaries
	if (key === ' ') {
		var updated = [];

		// initialize
		for (var i = 0; i < K; i++) {
			updated[i] = 0;
		}

		// cycle through datapoints, finding which calcMean the point is closest to
		for (var i = 0; i < DP_COUNT; i++) {
			var closestMean = 0;
			var distToClosestMean = dist(
				datapoints[i].x,
				datapoints[i].y,
				calcMeans[0].x,
				calcMeans[0].y
			);
			for (var j = 1; j < K; j++) {
				var newDist = dist(
					datapoints[i].x,
					datapoints[i].y,
					calcMeans[j].x,
					calcMeans[j].y
				);
				if (newDist < distToClosestMean) {
					// datapoints[i] is closer to this calcMean than the previous best
					closestMean = j;
					distToClosestMean = newDist;
				}
			}

			dpCategory[i] = closestMean;
		}

		// redraw the boundaries with the new categorizations
		redrawBounds();
	}
	// reset the screen
	else if (key === 'n') {
		pickTrueMeans();
		pickCalcMeans();

		placeDatapoints();

		for (var i = 0; i < K; i++) {
			bounds[i] = new Boundary(0, 0, 0, 0);
		}
	}

	// calls the draw function
	redraw();
	// seems like this does the same thing
	// draw();
}

function placeDatapoints() {
	for (var i = 0; i < DP_COUNT; i++) {
		// var x_i = random(K);
		// var y_i = random(K);
		var x_i = i % K;
		var y_i = i % K;

		// var x = trueMeans[x_i].x;
		// var y = trueMeans[y_i].y;
		var x = trueMeans[x_i].x + random(-49, 50) + random(-49, 50) + random(-49, 50);
		var y = trueMeans[y_i].y + random(-99, 100) + random(-99, 100) + random(-99, 100);

		// for (var i = 0; i < 10; i++) {
		// 	x = x + random(-39, 40);
		// 	y = y + random(-19, 20);
		// }
		
		datapoints[i] = new Datapoint(x, y);
	}
}

function redrawBounds() {
	for (var i = 0; i < K; i++) {
		var xmax = 0, ymax = 0;
		var xmin = width;
		var ymin = height;

		var xsum = 0, ysum = 0;
		var numDPHere = 0;

		for (var j = 0; j < DP_COUNT; j++) {
			if (dpCategory[j] == i) {
				xsum += datapoints[j].x;
				ysum += datapoints[j].y;
				numDPHere++;

				if (datapoints[j].x > xmax) xmax = datapoints[j].x;
				if (datapoints[j].x < xmin) xmin = datapoints[j].x;
				if (datapoints[j].y > ymax) ymax = datapoints[j].y;
				if (datapoints[j].y < ymin) ymin = datapoints[j].y;
			}
		}

		if (numDPHere == 0) {
			bounds[i] = new Boundary(0, 0, 0, 0);
			calcMeans[i] = new Datapoint(random(width), random(height));
		} else {
			bounds[i] = new Boundary(xmin, xmax, ymin, ymax);
			calcMeans[i] = new Datapoint(xsum / numDPHere, ysum / numDPHere);
		}
	}

}

function pickTrueMeans() {
	for (var i = 0; i < K; i++) {
		trueMeans[i] = new Datapoint(
			random(width - 400) + 200,
			random(height - 400) + 200
		);
	}
}

function pickCalcMeans() {
	for (var i = 0; i < K; i++) {
		calcMeans[i] = new Datapoint(
			random(width - 200) + 100,
			random(height - 200) + 100
		);
	}
}
