function Grouping(code) {
    this.code = code;
    this.boundary = null;
    this.datapoints = [];

    this.addDatapoint = function(newDatapoint) {
        this.datapoints.push(newDatapoint);
    }

    this.removeDatapoint = function() {
        this.datapoints.pop();
    }

    this.setBoundary = function(boundary) {
        this.boundary = boundary;
    }

    // this.getBoundary = function(boundary) {
    //     return this.boundary;
    // }
}