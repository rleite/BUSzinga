angular.module('BUSzinga').factory('Point', ['Store', function (Store) {
    'use strict';

    function Point(lat, lon, setMaxMin) {
        this.lat = Number(lat);
        this.lon = Number(lon);
        if (setMaxMin) {
            this.setMaxMin();
        }
    }

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
                    return new Point(point._lat, point._lon);
                });
            });

            Store.register('route', this.tag, this);
        }
        return Route;
    }]);

angular.module('BUSzinga').factory('Vehicle', ['Point', 'Store', function (Point, Store) {
    'use strict';
    function Vehicle(vehicle) {
        this.id = vehicle._id;
        this.dirTag = vehicle._dirTag;
        this.heading = vehicle._heading;
        this.predictable = vehicle._predictable;
        this.secsSinceReport = vehicle._secsSinceReport;
        this.speedKmHr = vehicle._speedKmHr;

        this.route = Store.get('route', vehicle._routeTag);

        this.point = new Point(vehicle._lat, vehicle._lon);
    }
    return Vehicle;
}]);

angular.module('BUSzinga').factory('Street', ['Point', function (Point) {
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

        this.path = street.geometry.coordinates.map(function (cord) {
            return new Point(cord[0], cord[1], true);
        });
    }
    return Street;
}]);