angular.module('BUSzinga')
    .controller('RouteSelector', ['$scope', 'RoutesService', function ($scope, Routes) {
        'use strict';
        var self = this;
        self.routes = [];
        Routes.getRoutes().then(function (routes) {
            self.routes = routes;
            return routes;
        });

        function change() {
            $scope.$emit('rlRouteSelector.changeRoute', self.route);
        }

        self.change = change;
    }])
    .directive('rlRouteSelector', function () {
        'use strict';

        function linkFn($scope, $elem) {
            $elem.addClass('rl-route-selector');
        }

        return {
            controller: 'RouteSelector',
            controllerAs: 'routeSelector',
            templateUrl: 'src/components/route-selector/route-selector.html',
            link: linkFn
        };
    });