var DP_COUNT = 150;				/** how many datapoints to include */
var CONCENTRATION_FACTOR = 1;	/** 1 is a standard value. higher means more spread out. */
var NUM_GROUPS = 3;						/** this is how many clusters are generated. */
var NUM_BOUNDS = NUM_GROUPS;		/** how many clusters we're attempting to sort by */

var datapoints = [];
var dpCategory = [];

var bounds = [];
var groupings = [];

var trueMeans = [];
var calcMeans = [];

var showBoundaries = true;

// look at p5.js API for ideas on how to expand and improve this

function setup() {
	createCanvas(1440, 840);

	initFields();

	pickTrueMeans();
	placeDatapoints();

	noLoop();
}

function initFields() {
	for (var i = 0; i < NUM_GROUPS; i++) {
		groupings[i] = new Grouping(i);
	}

	for (var i = 0; i < NUM_BOUNDS; i++) {
		bounds[i] = new Boundary(0, 0, 0, 0);
	}
}

function draw() {
	background(51);

	for (var i = 0; i < DP_COUNT; i++) {
		datapoints[i].show();
	}
	if (showBoundaries) {
		for (var i = 0; i < NUM_BOUNDS; i++) {
			bounds[i].show();
		}
	}
}

function keyPressed() {
	// update boundaries
	if (key === ' ' || (key <= '9' && key > '0')) {

		let numBoundaries = parseInt(key);
		if (numBoundaries != null && !Number.isNaN(numBoundaries)) {
			NUM_BOUNDS = numBoundaries;
		}
		if (calcMeans.length != NUM_BOUNDS) {
			pickCalcMeans();
		}

		// clear out datapoints currently in 
		for (var i = 0; i < NUM_BOUNDS; i++) {
			if (bounds[i] == null) {
				bounds[i] = new Boundary(0, 0, 0, 0);
			}
			bounds[i].datapoints = [];
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
			datapoints[i].setBoundary(closestMean);
			bounds[closestMean].addDatapoint(datapoints[i]);
		}

		// update the boundaries with the new categorizations
		updateBounds();
	}
	// reset the screen
	else if (key === 'n') {
		initFields();

		pickTrueMeans();
		placeDatapoints();
	}
	// toggle boundaries
	else if (key === 'b') {
		this.showBoundaries = !this.showBoundaries;
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
		datapoints[i].setGrouping(grouping);
		groupings[grouping].addDatapoint(datapoints[i]);
	}
}

function updateBounds() {
	for (var i = 0; i < NUM_BOUNDS; i++) {
		// if (bounds[i].stable) {
		// 	continue;
		// }

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
			if (/** !bounds[i].stable && */ bounds[i] != null && bounds[i].equals(newBoundary)) {
				var numDPWithinBoundary = 0;
				var sumDistFromNearestBoundary = 0;
				var sumDistFromMean = 0;
				for (var j = 0; j < DP_COUNT; j++) {
					if (dpCategory[j] == i) {
						var minDistToBound = Math.min(xmax - datapoints[j].x, datapoints[j].x - xmin, ymax - datapoints[j].y, datapoints[j].y - ymin);
						var distToMean = Math.abs(dist(datapoints[j].x, datapoints[j].y, (xmax + xmin) / 2, (ymax + ymin) / 2));
						sumDistFromNearestBoundary += minDistToBound;
						sumDistFromMean += distToMean;
						numDPWithinBoundary++;
					}
				}

				bounds[i].averageDistFromDatapointToCenter = sumDistFromMean / bounds[i].datapoints.length;
				bounds[i].averageDistFromDatapointToNearestBoundary = sumDistFromNearestBoundary / bounds[i].datapoints.length;

				console.log("boundary[" + i + "] stabilized...");
				console.log("(" + Math.round(xmin) + ", " + Math.round(ymin) + "), " +
				"(" + Math.round(xmax) + ", " + Math.round(ymax) + ")");
				console.log("\taverage dist from dp to nearest boundary: " + sumDistFromNearestBoundary / numDPWithinBoundary);
				console.log("\taverage dist from dp to center of boundary: " + sumDistFromMean / numDPWithinBoundary);

				console.log("\n\tnum dps within boundary: " + numDPWithinBoundary + ", num dps from this bounds element: " + bounds[i].datapoints.length);

				for (var j = 0; j < bounds[i].datapoints.length; j++) {
					var minDistToBound = Math.min(xmax - bounds[i].datapoints[j].x, bounds[i].datapoints[j].x - xmin, ymax - bounds[i].datapoints[j].y, bounds[i].datapoints[j].y - ymin);
					var distToMean = Math.abs(dist(bounds[i].datapoints[j].x, bounds[i].datapoints[j].y, (xmax + xmin) / 2, (ymax + ymin) / 2));
					sumDistFromNearestBoundary -= minDistToBound;
					sumDistFromMean -= distToMean;
				}

				console.log("should both be 0... " + Math.round(sumDistFromMean) + ", " + Math.round(sumDistFromNearestBoundary));

				bounds[i].stable = true;
			} else {
				bounds[i] = newBoundary;
				calcMeans[i] = new Datapoint(xsum / numDPHere, ysum / numDPHere);
			}
		}
	}

	var allBoundsStable = true;
	for (var i = 0; i < NUM_BOUNDS; i++) {
		if (!bounds[i].stable) {
			allBoundsStable = false;
			break;
		}
	}

	if (allBoundsStable) {

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
	calcMeans = [];
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
