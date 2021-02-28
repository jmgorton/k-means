function Boundary(xmin, xmax, ymin, ymax) {
    this.xmin = xmin < xmax ? xmin : xmax;
    this.xmax = xmax > xmin ? xmax : xmin;
    this.ymin = ymin < ymax ? ymin : ymax;
    this.ymax = ymax > ymin ? ymax : ymin;

    this.grouping = null;

    this.show = function() {
        stroke(216, 219, 39);
        strokeWeight(2);
        line(xmin, ymin, xmax, ymin);
        line(xmin, ymax, xmax, ymax);
        line(xmax, ymin, xmax, ymax);
        line(xmin, ymin, xmin, ymax);
    }

    this.setGrouping = function(newGrouping) {
        this.grouping = newGrouping;
    }

    this.equals = function(otherBoundary) {
        console.log("comparing boundaries...");
        if (otherBoundary != null
            && otherBoundary.xmax == this.xmax
            && otherBoundary.xmin == this.xmin
            && otherBoundary.ymax == this.ymax
            && otherBoundary.ymin == this.ymin) {
            return true;
        } else {
            return false;
        }
    }
}