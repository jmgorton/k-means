var DP_COUNT = 150;
var CONCENTRATION_FACTOR = 1;
var K = 2;

var datapoints = [];
var bounds = [];

var trueMeans = [];
var calcMeans = [];

var x;
var y;

function setup() {
	createCanvas(1440, 840);

	for (var i = 0; i < K; i++) {
		trueMeans[i] = new Datapoint(
			random(width - 200) + 100,
			random(height - 200) + 100
		);
		calcMeans[i] = new Datapoint(
			random(width),
			random(height)
		);
	}
	for (var i = 0; i < DP_COUNT; i++) {
		// var x_i = random(K);
		// var y_i = random(K);
		var x_i = i % K;
		var y_i = i % K;

		// var x = trueMeans[x_i].x;
		// var y = trueMeans[y_i].y;
		var x = trueMeans[x_i].x + random(-99, 100) + random(-99, 100);
		var y = trueMeans[y_i].y + random(-99, 100) + random(-99, 100);

		// for (var i = 0; i < 10; i++) {
		// 	x = x + random(-39, 40);
		// 	y = y + random(-19, 20);
		// }
		
		datapoints[i] = new Datapoint(x, y);
	}
	// for (var i = 0; i < K; i++) {
	// 	bounds[i] = new Boundary(
	// 		// random(width),
	// 		// random(width),
	// 		// random(height),
	// 		// random(height)
	// 		0, 0, 0, 0
	// 	);
	// }
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
		// var xmin = width;
		// var ymin = height;
		// var xmax = 0, ymax = 0;
		var updated = [];

		for (var i = 0; i < K; i++) {
			updated[i] = 0;
		}
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
			// it has now been determined which calcMean this datapoint is closest to
			if (updated[closestMean] == 0) {
				// this is the first datapoint falling into this cluster
				bounds[closestMean] = new Boundary(
					datapoints[i].x - 1,
					datapoints[i].x + 1,
					datapoints[i].y - 1,
					datapoints[i].y + 1
				);
				updated[closestMean] = 1;
			}
			else {
				// this cluster already contains at least one other datapoint
				if (datapoints[i].x < bounds[closestMean].xmin) {
					bounds[closestMean] = new Boundary(
						datapoints[i].x,
						bounds[closestMean].xmax,
						bounds[closestMean].ymin,
						bounds[closestMean].ymax
					);
				} else if (datapoints[i].x > bounds[closestMean].xmax) {
					bounds[closestMean] = new Boundary(
						bounds[closestMean].xmin,
						datapoints[i].x,
						bounds[closestMean].ymin,
						bounds[closestMean].ymax
					);
				}
				if (datapoints[i].y < bounds[closestMean].ymin) {
					bounds[closestMean] = new Boundary(
						bounds[closestMean].xmin,
						bounds[closestMean].xmax,
						datapoints[i].y,
						bounds[closestMean].ymax
					);
				} else if (datapoints[i].y > bounds[closestMean].ymax) {
					bounds[closestMean] = new Boundary(
						bounds[closestMean].xmin,
						bounds[closestMean].xmax,
						bounds[closestMean].ymin,
						datapoints[i].y
					);
				}
			}
		}
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
