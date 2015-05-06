angular.module('BUSzinga').factory('VehiclesService', [
    '$q', 'Nextbus', 'Vehicle', 'Point', 'RoutesService', 'StreetsService', 'Store',
    function ($q, bus, Vehicle, Point, Routes, Streets, Store) {
        'use strict';
        var vehicles, promise;

        function selectGroup(vehicle) {
            var i;
            var groups = Store.get('streetGrpoup', 'all');
            for (i = 0; i < groups.length; i++) {
                if (groups[i].isInside(vehicle.point)) {
                    return groups[i];
                }
            }
        }

        function streetVehicleInterpolation() {
            angular.forEach(vehicles, function (vehicle) {
                var dist;
                var target;
                var streets;
                var street;

                function getPoint(street, j) {
                    var point1 = street.path[j].point;
                    var point2 = street.path[j + 1].point;
                    var t = vehicle.point.lineSegmentParameter(point1, point2);
                    t = t < 0 ? 0 : (t > 1 ? 1 : t);
                    var pointArray = d3.interpolate(point1.toArray(), point2.toArray())(t);
                    return Point.fromArray(pointArray);
                }

                var group = selectGroup(vehicle);

                if (group && group.streets.length) {

                    streets = group.streets;

                    // getGroup
                    street = streets[0];

                    var minPoint = getPoint(street, 0);
                    var minDist = vehicle.point.distance(minPoint);

                    var i = 1;
                    var j = 2;
                    while (i < streets.length) {
                        street = streets[i];
                        while (j < (street.path.length - 1)) {

                            target = getPoint(street, j);
                            dist = vehicle.point.distance(target);

                            if (dist < minDist) {
                                minDist = dist;
                                minPoint = target;
                            }

                            j++;
                        }
                        j = 0;
                        i++;
                    }

                    vehicle.point = minPoint;
                }
            });
        }

        function filterByRoute(vehicles, routes) {
            if (!routes || !routes.length) {
                return vehicles;
            }

            return vehicles.filter(function (vehicle) {
                return !!(routes.filter(function (route) {
                    return route.tag === vehicle.route.tag;
                })[0]);
            });
        }

        function refresh(routes) {
            promise = promise || $q.all([
                bus.getVehicleLocations(), Routes.getRoutes(), Streets.getStreets()
            ]).then(function (data) {
                var vehiclesData = data[0];
                vehicles = vehiclesData.map(function (vehicle) {
                    return new Vehicle(vehicle);
                });
                
                // streetVehicleInterpolation();

                return vehicles;
            }).then(function (vehicles) {
                return filterByRoute(vehicles, routes);
            })['finally'](function () {
                promise = null;
            });
            return promise;
        }

        function getVehicles(routes) {
            return ((vehicles && $q.when(vehicles)) || refresh())
                .then(function (vehicles) {
                    return filterByRoute(vehicles, routes);
                });
        }

        return {
            refresh: refresh,
            getVehicles: getVehicles
        };
    }]);