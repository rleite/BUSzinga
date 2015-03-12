angular.module('BUSzinga')
    .constant('NEXTBUS.CONF', {
        url: 'http://webservices.nextbus.com/service/publicXMLFeed'
    })
    .factory('Nextbus', ['$http', 'NEXTBUS.CONF', function ($http, conf) {
        'use strict';

        function parseResponse(resp) {
            return new X2JS().xml_str2json(resp.data).body;
        }

        function makeRequest(params) {
            params = params || {};
            params.a = params.a || 'sf-muni';

            return $http({
                url: conf.url,
                params: params
            }).then(parseResponse);
        }

        function getRouteConfig() {
            // var makeRequest = function () {
            //     return $http({ url: 'data/tmp/routes.xml' }).then(parseResponse);
            // };
            return makeRequest({
                command: 'routeConfig'
            }).then(function (data) {
                return data.route;
            });
        }

        function getAgencyList() {
            return makeRequest({command: 'agencyList'}).then(function (data) {
                return data.agency;
            });
        }

        function getVehicleLocations() {
            // var makeRequest = function () {
            //     return $http({ url: 'data/tmp/vehicles.xml' }).then(parseResponse);
            // };
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