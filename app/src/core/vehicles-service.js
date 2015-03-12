angular.module('BUSzinga').factory('VehiclesService', [
    '$q', 'Nextbus', 'Vehicle', 'RoutesService',
    function ($q, bus, Vehicle, Routes) {
        'use strict';
        var vehicles, promise;

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
            promise = promise || $q.all([ Routes.getRoutes(), bus.getVehicleLocations()])
                .then(function (data) {
                    vehicles = data[1].map(function (vehicle) {
                        return new Vehicle(vehicle);
                    });
                    promise = null;
                    return vehicles;
                })
                .then(function (vehicles) {
                    return filterByRoute(vehicles, route);
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