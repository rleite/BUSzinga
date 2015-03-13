angular.module('BUSzinga').factory('Point', ['Store', function (Store) {
    'use strict';

    function Point(lat, lon, setMaxMin) {
        this.lat = Number(lat);
        this.lon = Number(lon);
        if (setMaxMin) {
            this.setMaxMin();
        }
    }

    Point.prototype.distance = function (p) {
        return d3.geo.distance(this.toArray(), p.toArray());
    };

    Point.prototype.toArray = function () {
        return [this.lon, this.lat];
    };

    Point.prototype.lineSegmentParameter = function (p0, p1) {
        var x10 = p1.lon - p0.lon;
        var y10 = p1.lat - p0.lat;
        var x20 = this.lon - p0.lon;
        var y20 = this.lat - p0.lat;
        return (x20 * x10 + y20 * y10) / (x10 * x10 + y10 * y10);
    };

    Point.prototype.setMaxMin = function () {
        var minPoint = Store.get('pointEdges', 'min') ||
                Store.register('pointEdges', 'min', new Point(this.lat, this.lon));
        var maxPoint = Store.get('pointEdges', 'max') ||
                Store.register('pointEdges', 'max', new Point(this.lat, this.lon));

        // update max
        minPoint.lat = this.lat < minPoint.lat ? this.lat : minPoint.lat;
        minPoint.lon = this.lon < minPoint.lon ? this.lon : minPoint.lon;
        // update min
        maxPoint.lat = this.lat > maxPoint.lat ? this.lat : maxPoint.lat;
        maxPoint.lon = this.lon > maxPoint.lon ? this.lon : maxPoint.lon;
    };

    return Point;
}]);

angular.module('BUSzinga').factory('Stop', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Stop(stop) {
        this.tag = stop._tag;
        this.title = stop._title;
        this.stopId = stop._stopId;

        this.point = new Point(stop._lat, stop._lon);

        Store.register('stop', this.tag, this);
    }
    return Stop;
}]);

angular.module('BUSzinga').factory('Direction', ['ToolkitService', 'Store', function (toolkit, Store) {
    'use strict';
    function Direction(direction) {
        this.name = direction._name;
        this.tag = direction._tag;
        this.title = direction._title;
        this.useForUI = direction._useForUI;

        this.stops = toolkit.toArray(direction.stop).map(function (stop) {
            return Store.get('stop', stop._tag);
        });
    }
    return Direction;
}]);

angular.module('BUSzinga').factory('Route', [
    'Stop', 'Point', 'Direction', 'Store', 'ToolkitService',
    function (Stop, Point, Direction, Store, toolkit) {
        'use strict';
        function Route(route) {
            this.tag = route._tag;
            this.title = route._title;
            this.color = route._color;
            this.oppositeColor = route._oppositeColor;

            this.minPoint = new Point(route._latMin, route._lonMin);
            this.maxPoint = new Point(route._latMax, route._lonMax);

            this.stops = toolkit.toArray(route.stop).map(function (stop) {
                return new Stop(stop);
            });

            this.directions = toolkit.toArray(route.direction).map(function (direction) {
                return new Direction(direction);
            });

            this.paths = toolkit.toArray(route.path).map(function (path) {
                return toolkit.toArray(path.point).map(function (point) {
                    return {point: new Point(point._lat, point._lon)};
                });
            });

            Store.register('route', this.tag, this);
        }

        Route.prototype.getDirection = function (tag) {
            return this.directions.filter(function (d) {
                return d.tag === tag;
            })[0];
        };
        return Route;
    }]);

angular.module('BUSzinga').factory('Vehicle', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Vehicle(vehicle) {
        this.id = vehicle._id;
        this.heading = vehicle._heading;
        this.predictable = vehicle._predictable;
        this.secsSinceReport = vehicle._secsSinceReport;
        this.speedKmHr = vehicle._speedKmHr;

        this.route = Store.get('route', vehicle._routeTag);

        this.direction = this.route.getDirection(vehicle._dirTag);

        this.point = new Point(vehicle._lat, vehicle._lon);
    }
    return Vehicle;
}]);

angular.module('BUSzinga').factory('Street', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Street(street) {
        this.accepted = street.properties.ACCEPTED;
        this.classcode = street.properties.CLASSCODE;
        this.cnn = street.properties.CNN;
        this.cnntext = street.properties.CNNTEXT;
        this.district = street.properties.DISTRICT;
        this.fNodeCnn = street.properties.F_NODE_CNN;
        this.jurisdicti = street.properties.JURISDICTI;
        this.layer = street.properties.LAYER;
        this.lfFadd = street.properties.LF_FADD;
        this.lfToadd = street.properties.LF_TOADD;
        this.nhood = street.properties.NHOOD;
        this.rtFadd = street.properties.RT_FADD;
        this.rtToadd = street.properties.RT_TOADD;
        this.street = street.properties.STREET;
        this.streetname = street.properties.STREETNAME;
        this.streetGc = street.properties.STREET_GC;
        this.stType = street.properties.ST_TYPE;
        this.tNodeCnn = street.properties.T_NODE_CNN;
        this.zipCode = street.properties.ZIP_CODE;

        this.setPath(street.geometry.coordinates);
        this.neighborhood = Store.get('neighborhood', this.nhood);
        if (this.neighborhood) {
            this.neighborhood.streets.push(this);
        }
    }

    Street.prototype.setPath = function (coordinates) {
        var lats = [];
        var lons = [];
        var dists = [];
        var lastPoint;

        this.path = coordinates.map(function (cord) {
            var path = {point: new Point(cord[1], cord[0], true)};

            lats.push(path.point.lat);
            lons.push(path.point.lon);
            if (lastPoint) {
                dists.push(lastPoint.distance(path.point));
            }
            lastPoint = path.point;

            return path;
        });

        this.minPoint = new Point(d3.min(lats), d3.min(lons));
        this.maxPoint = new Point(d3.max(lats), d3.max(lons));
        this.maxDist = d3.max(dists);
    };

    return Street;
}]);

angular.module('BUSzinga').factory('Neighborhood', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Neighborhood(neighborhood) {
        this.name = neighborhood.properties.neighborho;

        if (neighborhood.geometry.type === 'MultiPolygon') {
            this.setMultiPolygonEdges(neighborhood.geometry.coordinates);
        } else {
            this.setPolygonEdges(neighborhood.geometry.coordinates[0]);
        }

        this.streets = [];

        Store.register('neighborhood', this.name, this);
    }

    Neighborhood.prototype.setPolygonEdges = function (coordinates) {
        this.edges = [coordinates.map(function (p) {
            return {point: new Point(p[1], p[0]) };
        })];
    };

    Neighborhood.prototype.setMultiPolygonEdges = function (coordinates) {
        var edges = [];
        angular.forEach(coordinates, function (c) {
            edges = edges.concat(c.map(function (d) {
                return d.map(function (p) {
                    return {point: new Point(p[1], p[0]) };
                });
            }));
        });

        this.edges = edges;
    };

    return Neighborhood;
}]);