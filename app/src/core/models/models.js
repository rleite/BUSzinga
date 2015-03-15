angular.module('BUSzinga').factory('Point', function () {
    'use strict';

    function Point(lon, lat) {
        this.lat = Number(lat);
        this.lon = Number(lon);
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

    Point.prototype.clone = function () {
        return new Point(this.lon, this.lat);
    };

    // static
    Point.fromArray = function (array) {
        return new Point(array[0], array[1]);
    };

    return Point;
});

angular.module('BUSzinga').factory('Stop', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Stop(stop) {
        this.tag = stop._tag;
        this.title = stop._title;
        this.stopId = stop._stopId;

        this.point = new Point(stop._lon, stop._lat);

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

            this.minPoint = new Point(route._lonMin, route._latMin);
            this.maxPoint = new Point(route._lonMax, route._latMax);

            this.stops = toolkit.toArray(route.stop).map(function (stop) {
                return new Stop(stop);
            });

            this.directions = toolkit.toArray(route.direction).map(function (direction) {
                return new Direction(direction);
            });

            this.paths = toolkit.toArray(route.path).map(function (path) {
                return toolkit.toArray(path.point).map(function (point) {
                    return {point: new Point(point._lon, point._lat)};
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

        this.point = new Point(vehicle._lon, vehicle._lat);
    }
    return Vehicle;
}]);

angular.module('BUSzinga').factory('Street', [
    'Point', 'Store', 'PointGraph',
    function (Point, Store, PointGraph) {
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

            this.groups = [];

            this.setPath(street.geometry.coordinates);
            this.neighborhood = Store.get('neighborhood', this.nhood);
        }

        Street.prototype.setPath = function (coordinates) {
            var self = this;
            var lats = [];
            var lons = [];
            var dists = [];
            var lastItem;

            this.path = coordinates.map(function (cord) {
                var item = {
                    point: Point.fromArray(cord),
                    node: undefined
                };
                var dist;

                item.node = PointGraph.get(item.point);
                item.node.addStreet(self);

                lats.push(item.point.lat);
                lons.push(item.point.lon);

                if (lastItem) {
                    dist = lastItem.point.distance(item.point);

                    item.node.addNeighbors(lastItem.node, dist);
                    lastItem.node.addNeighbors(item.node, dist);

                    dists.push(lastItem.point.distance(item.point));
                }
                lastItem = item;

                return item;
            });

            this.minPoint = new Point(d3.min(lons), d3.min(lats));
            this.maxPoint = new Point(d3.max(lons), d3.max(lats));
            this.maxDist = d3.max(dists);

            this.setMaxMinPoints();
        };


        Street.prototype.setMaxMinPoints = function () {
            var minPoint = Store.get('streetPoint', 'min') ||
                    Store.register('streetPoint', 'min', this.minPoint.clone());
            var maxPoint = Store.get('streetPoint', 'max') ||
                    Store.register('streetPoint', 'max', this.maxPoint.clone());

            // update min
            minPoint.lat = this.minPoint.lat < minPoint.lat ? this.minPoint.lat : minPoint.lat;
            minPoint.lon = this.minPoint.lon < minPoint.lon ? this.minPoint.lon : minPoint.lon;
            // update max
            maxPoint.lat = this.maxPoint.lat > maxPoint.lat ? this.maxPoint.lat : maxPoint.lat;
            maxPoint.lon = this.maxPoint.lon > maxPoint.lon ? this.maxPoint.lon : maxPoint.lon;
        };

        return Street;
    }]);

angular.module('BUSzinga').factory('Neighborhood', ['Point', 'Store', function (Point, Store) {
    'use strict';

    function wrapPoint(p) {
        return {point: Point.fromArray(p)};
    }

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
        this.edges = [coordinates.map(wrapPoint)];
    };

    Neighborhood.prototype.setMultiPolygonEdges = function (coordinates) {
        var edges = [];
        angular.forEach(coordinates, function (c) {
            edges = edges.concat(c.map(function (d) {
                return d.map(wrapPoint);
            }));
        });

        this.edges = edges;
    };

    return Neighborhood;
}]);

angular.module('BUSzinga').factory('StreetGroup', ['Point', function (Point) {
    'use strict';
    function StreetGroup(minLon, minLat, maxLon, maxLat) {
        this.minPoint = new Point(minLon, minLat);
        this.maxPoint = new Point(maxLon, maxLat);
        this.streets = [];
    }

    StreetGroup.prototype.isInside = function (point) {
        var betweenLon = point.lon >= this.minPoint.lon && point.lon <= this.maxPoint.lon;
        var betweenLat = point.lat >= this.minPoint.lat && point.lat <= this.maxPoint.lat;
        return betweenLat && betweenLon;
    };

    StreetGroup.prototype.addStreet = function (street) {
        this.streets.push(street);
        street.groups.push(this);
    };

    return StreetGroup;
}]);

angular.module('BUSzinga').factory('GraphNode', function () {
    'use strict';
    function GraphNode(point) {
        this.point = point;

        this.neighbors = [];
        this.distance = [];

        this.streets = [];
    }

    GraphNode.prototype.addNeighbors = function (node, dist) {
        this.neighbors.push(node);
        this.distance.push(dist);
    };

    GraphNode.prototype.addStreet = function (street) {
        if (this.streets.indexOf(street) === -1) {
            this.streets.push(street);
        }
    };

    return GraphNode;
});