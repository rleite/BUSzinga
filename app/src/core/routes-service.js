angular.module('BUSzinga').factory('RoutesService', [
    '$q', 'Nextbus', 'Route',
    function ($q, bus, Route) {
        'use strict';
        var routes, promise;

        function init() {
            promise = promise || bus.getRouteConfig().then(function (data) {
                routes = [];
                angular.forEach(data, function (routeData) {
                    routes.push(new Route(routeData));

                    promise = null;
                });
                return routes;
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