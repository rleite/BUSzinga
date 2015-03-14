angular.module('BUSzinga').factory('StreetsService', [
    '$q', 'StaticResourceService', 'Store', 'Street', 'StreetGroup',
    function ($q, Resource, Store, Street, StreetGroup) {
        'use strict';
        var streets;
        var promise;

        function streetGroups() {
            var numGroups = 6;
            var minPoint = Store.get('streetPoint', 'min');
            var maxPoint = Store.get('streetPoint', 'max');

            var groupLonSize = (maxPoint.lon - minPoint.lon) / numGroups;
            var groupLatSize = (maxPoint.lat - minPoint.lat) / numGroups;

            function createGroup(i, j) {
                return new StreetGroup(
                    // min
                    minPoint.lon + (groupLonSize * i),
                    minPoint.lat + (groupLatSize * j),
                    // max
                    minPoint.lon + (groupLonSize * (i + 1)),
                    minPoint.lat + (groupLatSize * (j + 1))
                );
            }

            var i, j;
            var groups = [];
            for (i = 0; i < numGroups; i++) {
                for (j = 0; j < numGroups; j++) {
                    groups.push(createGroup(i, j));
                }
            }

            angular.forEach(streets, function (street) {
                angular.forEach(groups, function (group) {
                    if (group.isInside(street.minPoint) || group.isInside(street.maxPoint)) {
                        group.streets.push(street);
                    }
                });
            });
            Store.register('streetGrpoup', 'all', groups);
        }

        function init() {
            promise = promise || Resource.getStreets().then(function (streetsData) {

                streets = streetsData.map(function (street) {
                    return new Street(street);
                }).sort(function (street1, street2) {
                    return street1.maxPoint.lon - street2.maxPoint.lon;
                });

                streetGroups();

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