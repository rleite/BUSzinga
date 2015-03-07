angular.module('BUSzinga').factory('RoutesService', [
    '$q', 'Nextbus', 'Route', 'Point',
    function ($q, bus, Route, Point) {
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

        function getMinPoint(routes) {
            var minLat = d3.min(routes, function (route) {
                return route.minPoint.lat;
            });
            var minLon = d3.min(routes, function (route) {
                return route.minPoint.lon;
            });
            return new Point(minLat, minLon);
        }

        function getMaxPoint(routes) {
            var maxLat = d3.max(routes, function (route) {
                return route.maxPoint.lat;
            });
            var maxLon = d3.max(routes, function (route) {
                return route.maxPoint.lon;
            });
            return new Point(maxLat, maxLon);
        }

        return {
            init: init,
            getRoutes: getRoutes,

            getMinPoint: getMinPoint,
            getMaxPoint: getMaxPoint
        };
    }]);