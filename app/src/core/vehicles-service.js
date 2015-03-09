angular.module('BUSzinga').factory('VehiclesService', [
    '$q', '$http', 'Nextbus', 'Vehicle',
    function ($q, $http, bus, Vehicle) {
        'use strict';
        var vehicles, promise;
        // temp Override busLocation
        bus.getVehicleLocations = function () {
            return $http({ url: 'data/tmp/vehicles.xml' })
                .then(function (resp) {
                    return new X2JS().xml_str2json(resp.data).body.vehicle;
                });
        };

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