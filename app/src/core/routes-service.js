angular.module('BUSzinga').factory('RoutesService', [
    '$q', 'Nextbus', 'Route', 'StreetsService',
    function ($q, bus, Route, StreetsService) {
        'use strict';
        var routes, promise;

        function init() {
            promise = promise || $q.all([
                bus.getRouteConfig(),
                StreetsService.getStreets()
            ]).then(function (data) {
                routes = [];
                angular.forEach(data[0], function (routeData) {
                    routes.push(new Route(routeData));

                    promise = null;
                });
                return routes;
            })['finally'](function () {
                promise = null;
            });
            return promise;
        }

        function getRoutes() {
            return (routes && $q.when(routes)) || init();
        }

        return {
            init: init,
            getRoutes: getRoutes
        };
    }]);