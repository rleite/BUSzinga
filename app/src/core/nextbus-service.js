angular.module('metro1000Eyes')
    .constant('NEXTBUS.CONF', {
        url: 'http://webservices.nextbus.com/service/publicXMLFeed'
    })
    .factory('Nextbus', ['$http', 'NEXTBUS.CONF', function ($http, conf) {
        'use strict';

        function makeRequest(params) {
            params = params || {};
            params.t = params.t || Date.now();
            params.a = params.a || 'sf-muni';

            return $http({
                url: conf.url,
                params: params
            }).then(function (resp) {
                return new X2JS().xml_str2json(resp.data).body;
            });
        }

        function getRouteConfig() {
            return makeRequest({
                command: 'routeConfig'
            });
        }

        function getAgencyList() {
            return makeRequest({command: 'agencyList'}).then(function (data) {
                return data.agency;
            });
        }

        function getVehicleLocations() {
            return makeRequest({
                command: 'vehicleLocations'
            }).then(function (data) {
                return data.vehicle;
            });
        }

        return {
            getVehicleLocations: getVehicleLocations,
            getAgencyList: getAgencyList,
            getRouteConfig: getRouteConfig
        };
    }]);