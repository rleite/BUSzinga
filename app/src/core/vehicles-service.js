angular.module('BUSzinga').factory('VehiclesService', ['$q', 'Nextbus', 'Vehicle', function ($q, bus, Vehicle) {
    'use strict';
    var vehicles, promise;

    function refresh() {
        promise = promise || bus.getVehicleLocations().then(function (data) {
            vehicles = data.map(function (vehicle) {
                return new Vehicle(vehicle);
            });

            promise = null;
            return vehicles;
        });
        return promise;
    }

    function getVehicles() {
        return (vehicles && $q.when(vehicles)) || refresh();
    }

    return {
        refresh: refresh,
        getVehicles: getVehicles
    };
}]);