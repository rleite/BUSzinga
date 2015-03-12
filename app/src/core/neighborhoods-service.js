angular.module('BUSzinga').factory('NeighborhoodsService', [
    '$q', 'StaticResourceService', 'Neighborhood',
    function ($q, Resource, Neighborhood) {
        'use strict';
        var neighborhoods;
        var promise;

        function init() {
            promise = promise || Resource.getNeighborhoods().then(function (neighborhoodsData) {
                neighborhoods = neighborhoodsData.map(function (neighborhood) {
                    return new Neighborhood(neighborhood);
                });

                return neighborhoods;
            })['finally'](function () {
                promise = null;
            });
            return promise;
        }

        function getNeighborhoods() {
            return (neighborhoods && $q.when(neighborhoods)) || init();
        }

        return {
            init: init,
            getNeighborhoods: getNeighborhoods,
        };
    }]);