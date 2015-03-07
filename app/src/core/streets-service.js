angular.module('BUSzinga').factory('StreetsService', ['$http', '$q', 'Street', function ($http, $q, Street) {
    'use strict';
    var streets;
    var promise;

    function requestStreets() {
        return $http({
            url: 'data/sfmaps/streets.json'
        }).then(function (resp) {
            return resp.data.features;
        });
    }

    function init() {
        promise = promise || requestStreets().then(function (data) {
            streets = data.map(function (street) {
                return new Street(street);
            });
            return streets;
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