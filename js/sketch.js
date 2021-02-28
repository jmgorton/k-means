var DP_COUNT = 150;				/* how many datapoints to include */
var CONCENTRATION_FACTOR = 1;	/* 1 is a standard value. higher means more spread out. */
var NUM_GROUPS = 3;						/* this is how many clusters are calculated. */
var NUM_BOUNDS = NUM_GROUPS;

var datapoints = [];
var dpCategory = [];
var bounds = [];

var trueMeans = [];
var calcMeans = [];

// look at p5.js API for ideas on how to expand and improve this

function setup() {
	createCanvas(1440, 840);

	pickTrueMeans();
	// pickCalcMeans();

	placeDatapoints();

	// if you don't include this in the setup
	// the boundaries never get shown or updated for some reason
	// and the whole keyPressed() function breaks i guess
	for (var i = 0; i < NUM_BOUNDS; i++) {
		bounds[i] = new Boundary(0, 0, 0, 0);
	}

	noLoop();
}

function draw() {
	background(51);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i].show();
	}
	for (var i = 0; i < NUM_BOUNDS; i++) {
		bounds[i].show();
	}
}

function keyPressed() {
	// update boundaries
	if (key === ' ' || (key <= '9' && key > '0')) {
		var updated = [];
		let numBoundaries = parseInt(key);
		if (numBoundaries != null && !Number.isNaN(numBoundaries)) {
			NUM_BOUNDS = numBoundaries;
		}
		if (calcMeans.length != NUM_BOUNDS) {
			console.log("generating calcMeans... NUM_BOUNDS=" + NUM_BOUNDS);
			pickCalcMeans();

			for (var i = 0; i < calcMeans.length; i++) {
				console.log("calcMeans[" + i + "]=" + JSON.stringify(calcMeans[i]));
			}
		}

		// initialize
		for (var i = 0; i < NUM_BOUNDS; i++) {
			updated[i] = 0;
		}

		var averageDistToMean = [];
		// cycle through datapoints, finding which calcMean the point is closest to
		for (var i = 0; i < DP_COUNT; i++) {
			var closestMean = 0;
			var distToClosestMean = dist(
				datapoints[i].x,
				datapoints[i].y,
				calcMeans[0].x,
				calcMeans[0].y
			);
			for (var j = 1; j < NUM_BOUNDS; j++) {
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

		// update the boundaries with the new categorizations
		updateBounds();
	}
	// reset the screen
	else if (key === 'n') {
		pickTrueMeans();
		// pickCalcMeans();

		placeDatapoints();

		for (var i = 0; i < NUM_BOUNDS; i++) {
			bounds[i] = new Boundary(0, 0, 0, 0);
		}
	}

	// calls the draw function
	redraw();
	// seems like this does the same thing as
	// draw();
}

function placeDatapoints() {
	for (var i = 0; i < DP_COUNT; i++) {
		// var x_i = random(NUM_GROUPS);
		// var y_i = random(NUM_GROUPS);
		var grouping = i % NUM_GROUPS;

		var x = trueMeans[grouping].x;
		var y = trueMeans[grouping].y;

		for (var j = 0; j < 10 * CONCENTRATION_FACTOR; j++) {
			x = x + random(-39, 40);
			y = y + random(-19, 20);
		}
		
		datapoints[i] = new Datapoint(x, y);
		// datapoints[i].setGrouping(grouping);
	}
}

function updateBounds() {
	for (var i = 0; i < NUM_BOUNDS; i++) {
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
			var newBoundary = new Boundary(xmin, xmax, ymin, ymax);
			if (bounds[i] != null && bounds[i].equals(newBoundary)) {
				var numDPWithinBoundary = 0;
				var sumDistFromNearestBoundary = 0;
				var sumDistFromMean = 0;
				for (var j = 0; j < DP_COUNT; j++) {
					if (dpCategory[j] == i) {
						var minDistToBound = Math.min(xmax - datapoints[i].x, datapoints[i].x - xmin, ymax - datapoints[i].y, datapoints[i].y - ymin);
						var distToMean = dist(datapoints[i].x, datapoints[i].y, xmax + xmin / 2, ymax + ymin / 2);
						sumDistFromNearestBoundary += minDistToBound;
						sumDistFromMean += distToMean;
						numDPWithinBoundary++;
					}
				}
				console.log("boundary stabilized...");
				console.log("boundary[" + i + "] (xmin of " + xmin + ") has:");
				console.log("\taverage dist from dp to nearest boundary: " + sumDistFromNearestBoundary / numDPWithinBoundary);
				console.log("\taverage dist from dp to center of boundary: " + sumDistFromMean / numDPWithinBoundary);
			} else {
				// bounds[i] = new Boundary(xmin, xmax, ymin, ymax);
				bounds[i] = newBoundary;
				calcMeans[i] = new Datapoint(xsum / numDPHere, ysum / numDPHere);
			}
		}
	}

}

/**
 * this function is called to select where the datapoint groups will be centered
 */
function pickTrueMeans() {
	for (var i = 0; i < NUM_GROUPS; i++) {
		trueMeans[i] = getNewRandomDatapoint();
	}
}

/**
 * this function is called once at the beginning for random starting points, then updated by calculation
 */
function pickCalcMeans() {
	// maybe pick the calcMeans more strategically, to avoid two clusters being grouped together
	for (var i = 0; i < NUM_BOUNDS; i++) {
		calcMeans[i] = getNewRandomDatapoint();
	}
}

function getNewRandomDatapoint() {
	return new Datapoint(
		random(width - 200) + 100,
		random(height - 200) + 100
	);
}
