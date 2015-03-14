angular.module('BUSzinga').factory('StaticResourceService', ['$http', function ($http) {
    'use strict';

    function request(url) {
        return $http({
            url: url
        }).then(function (resp) {
            return resp.data.features;
        });
    }

    function getStreets() {
        return request('data/sfmaps/streets.json');
    }

    function getNeighborhoods() {
        return request('data/sfmaps/neighborhoods.json');
    }

    function getFreeways() {
        return request('data/sfmaps/freeways.json');
    }

    return {
        getStreets: getStreets,
        getNeighborhoods: getNeighborhoods,
        getFreeways: getFreeways
    };
}]);