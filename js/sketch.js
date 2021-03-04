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
var stepByStep = false;

// look at p5.js API for ideas on how to expand and improve this

function setup() {
	createCanvas(1440, 840);

	initFields();

	pickTrueMeans();
	placeDatapoints();

	noLoop();
}

function initFields() {
	for (var i = 0; i < NUM_GROUPS || i < groupings.length; i++) {
		if (i < NUM_GROUPS) {
			groupings[i] = new Grouping(i);
		} else {
			groupings[i] = null;
		}
	}

	bounds = [];
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
			initFields();
			pickCalcMeans();
		}

		// if (bounds[i].length > NUM_BOUNDS) {
		// 	for (var del = NUM_BOUNDS; del < bounds[i].length; del++) {

		// 	}
		// }

		var autocontinue = true;
		while (autocontinue) {
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
			autocontinue = updateBounds() && !this.stepByStep;
		}
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
	// auto mode (!stepByStep)
	else if (key === 'a') {
		this.stepByStep = !this.stepByStep;
	}
	// help modal
	else if (key === 'h') {
		// TODO 
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
		// groupings[grouping].addDatapoint(datapoints[i]);
	}
}

/**
 * returns true if at least one boundary was updated, and false if all boundaries remained stable
 */
function updateBounds() {
	var allBoundsStable = true;
	for (var i = 0; i < NUM_BOUNDS; i++) {
		// if (bounds[i].stable) {
		// 	continue;
		// }

		// xmax, ymax to only get larger; xmin, ymin to only get smaller
		var xmax = 0, ymax = 0;
		var xmin = width;
		var ymin = height;

		// to be used for new calcMean
		var xsum = 0, ysum = 0;

		if (bounds[i].datapoints.length == 0) {
			bounds[i] = new Boundary(0, 0, 0, 0);
			calcMeans[i] = new Datapoint(random(width), random(height));
			// as long as there is one boundary that has no points, it will choose a new random
			// position next round, which could be inside another boundary, so it's not stable
			allBoundsStable = false;
		} else {
			// console.log("bounds[" + i + "]: " + bounds[i].datapoints.length + " dps");
			for (var j = 0; j < bounds[i].datapoints.length; j++) {
				xsum += bounds[i].datapoints[j].x;
				ysum += bounds[i].datapoints[j].y;

				if (bounds[i].datapoints[j].x > xmax) xmax = bounds[i].datapoints[j].x;
				if (bounds[i].datapoints[j].x < xmin) xmin = bounds[i].datapoints[j].x;
				if (bounds[i].datapoints[j].y > ymax) ymax = bounds[i].datapoints[j].y;
				if (bounds[i].datapoints[j].y < ymin) ymin = bounds[i].datapoints[j].y;
			}

			var newBoundary = new Boundary(xmin, xmax, ymin, ymax);

			// check if this boundary remained the same as last round
			if (/** !bounds[i].stable && */ bounds[i] != null && bounds[i].equals(newBoundary)) {

				var sumDistFromNearestBoundary = 0;
				var sumDistFromMean = 0;

				for (var j = 0; j < bounds[i].datapoints.length; j++) {
					var minDistToBound = Math.min(xmax - bounds[i].datapoints[j].x, bounds[i].datapoints[j].x - xmin, ymax - bounds[i].datapoints[j].y, bounds[i].datapoints[j].y - ymin);
					var distToMean = Math.abs(dist(bounds[i].datapoints[j].x, bounds[i].datapoints[j].y, (xmax + xmin) / 2, (ymax + ymin) / 2));
					sumDistFromNearestBoundary += minDistToBound;
					sumDistFromMean += distToMean;
				}

				bounds[i].averageDistFromDatapointToCenter = sumDistFromMean / bounds[i].datapoints.length;
				bounds[i].averageDistFromDatapointToNearestBoundary = sumDistFromNearestBoundary / bounds[i].datapoints.length;

				bounds[i].stable = true;
			} else {
				// this breaks the boundaries
				// bounds[i].xmax = xmax;
				// bounds[i].xmin = xmin;
				// bounds[i].ymax = ymax;
				// bounds[i].ymin = ymin;

				calcMeans[i] = new Datapoint(xsum / bounds[i].datapoints.length, ysum / bounds[i].datapoints.length);
				newBoundary.datapoints = bounds[i].datapoints;
				bounds[i] = newBoundary;
				allBoundsStable = false;
			}
		}
	}

	// compile stats once all bounds are stable, no more regrouping will occur
	// move this into calculateGroupingScore()
	if (allBoundsStable) {
		console.log("all boundaries have stabilized. calculating grouping score...");

		var score = 0;
		for (var i = 0; i < bounds.length; i++) {
			// console.log("boundary[" + i + "] stabilized...");
			// console.log("(" + Math.round(bounds[i].xmin) + ", " + Math.round(bounds[i].ymin) + "), " +
			// "(" + Math.round(bounds[i].xmax) + ", " + Math.round(bounds[i].ymax) + ")");
			// console.log("\taverage dist from dp to nearest boundary: " + bounds[i].averageDistFromDatapointToNearestBoundary);
			// console.log("\taverage dist from dp to center of boundary: " + bounds[i].averageDistFromDatapointToCenter);

			console.log("\tadding bounds[" + i + "] score... " + bounds[i].averageDistFromDatapointToCenter 
				+ " (" + bounds[i].datapoints.length + " dps)");
			score += bounds[i].averageDistFromDatapointToCenter * bounds[i].datapoints.length;
		}

		score *= bounds.length;
		// score /= DP_COUNT;
		console.log("final score: " + score + "... smallest score wins! :)");
	}

	return !allBoundsStable;
}

/**
 * calculate grouping score to compare others against
 */
function calculateGroupingScore() {

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
