angular.module('BUSzinga').factory('StreetsService', [
    '$q', 'StaticResourceService', 'NeighborhoodsService', 'Street',
    function ($q, Resource, Neighborhoods, Street) {
        'use strict';
        var streets;
        var promise;

        function init() {
            promise = promise || $q.all([
                Resource.getStreets(),
                Neighborhoods.getNeighborhoods()
            ]).then(function (data) {
                var streetsData = data[0];
                streets = streetsData.map(function (street) {
                    return new Street(street);
                });

                streets.sort(function (street1, street2) {
                    return street1.minPoint.lon - street2.minPoint.lon;
                });

                return streets;
            })['finally'](function () {
                promise = null;
            });
            return promise;
        }

        function getStreets() {
            return (streets && $q.when(streets)) || init();
        }

        return {
            init: init,
            getStreets: getStreets,
        };
    }]);