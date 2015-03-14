angular.module('BUSzinga').factory('VehiclesService', [
    '$q', 'Nextbus', 'Vehicle', 'Point', 'RoutesService', 'StreetsService',
    function ($q, bus, Vehicle, Point, Routes, Streets) {
        'use strict';
        var vehicles, promise;

        // function streetVehicleInterpolation(streets) {
        //     streets = streets.slice(0, 10);
        //     console.log(streets);

        //     function getPoint(vehicle, street, j) {
        //         var point1 = street.path[j].point;
        //         var point2 = street.path[j + 1].point;
        //         var t = vehicle.point.lineSegmentParameter(point1, point2);
        //         t = t < 0 ? 0 : (t > 1 ? 1 : t);
        //         var pointArray = d3.interpolate(point1.toArray(), point2.toArray())(t);
        //         return Point.fromArray(pointArray);
        //     }

        //     function devideAndConquer(i, len) {
        //         if (len <= 3) {
        //             angular.forEach(streets.slice(i, len), function () {
        //             });
        //             return;
        //         }

        //         var mid = len / 2;
        //         devideAndConquer(i, Math.floor(mid));
        //         devideAndConquer(i + Math.floor(mid), Math.ceil(mid));
        //     }


        //     devideAndConquer(vehicles[0], streets.length);

        //     angular.forEach([], function (vehicle) {
        //         var street = streets[0];
        //         var dist;
        //         var target;

        //         var minPoint = getPoint(street, 0);
        //         var minDist = vehicle.point.distance(minPoint);

        //         var i = 1;
        //         var j = 2;
        //         while (i < streets.length) {
        //             street = streets[i];
        //             while (j < (street.path.length - 1)) {

        //                 target = getPoint(street, j);
        //                 dist = vehicle.point.distance(target);

        //                 if (dist < minDist) {
        //                     minDist = dist;
        //                     minPoint = target;
        //                 }

        //                 j++;
        //             }
        //             j = 0;
        //             i++;
        //         }

        //         vehicle.point = minPoint;
        //     });

        //     return vehicles;
        // }

        function filterByRoute(vehicles, route) {
            var filterdVehicles;
            if (route) {
                filterdVehicles = [];
                angular.forEach(vehicles, function (vehicle) {
                    if (vehicle.route.tag === route) {
                        filterdVehicles.push(vehicle);
                    }
                });
                return filterdVehicles;
            }
            return vehicles;
        }

        function refresh(route) {
            promise = promise || $q.all([
                Routes.getRoutes(), bus.getVehicleLocations(), Streets.getStreets()
            ]).then(function (data) {
                var vehiclesData = data[1];
                vehicles = vehiclesData.map(function (vehicle) {
                    return new Vehicle(vehicle);
                });
                // streetVehicleInterpolation(data[2]);
                return vehicles;
            }).then(function (vehicles) {
                return filterByRoute(vehicles, route);
            })['finally'](function () {
                promise = null;
            });
            return promise;
        }

        function getVehicles(route) {
            return ((vehicles && $q.when(vehicles)) || refresh())
                .then(function (vehicles) {
                    return filterByRoute(vehicles, route);
                });
        }

        return {
            refresh: refresh,
            getVehicles: getVehicles
        };
    }]);