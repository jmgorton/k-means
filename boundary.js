function Boundary(xmin, xmax, ymin, ymax) {
    this.xmin = xmin < xmax ? xmin : xmax;
    this.xmax = xmax > xmin ? xmax : xmin;
    this.ymin = ymin < ymax ? ymin : ymax;
    this.ymax = ymax > ymin ? ymax : ymin;

    this.show = function() {
        stroke(216, 219, 39);
        strokeWeight(2);
        line(xmin, ymin, xmax, ymin);
        line(xmin, ymax, xmax, ymax);
        line(xmax, ymin, xmax, ymax);
        line(xmin, ymin, xmin, ymax);
    }
}