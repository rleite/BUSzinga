angular.module('BUSzinga')
    .controller('RouteSelector', ['$scope', 'RoutesService', function ($scope, Routes) {
        'use strict';
        var self = this;
        var selectedTags = [];

        self.routes = [];
        self.routesSelected = [];

        Routes.getRoutes().then(function (routes) {
            self.routes = routes;
            return routes;
        });

        function remove(i) {
            self.routesSelected.splice(i, 1);
            selectedTags.splice(i, 1);
            $scope.$emit('rlRouteSelector.changeRoute', self.routesSelected);
        }

        function change() {
            if (self.selectedTag && selectedTags.indexOf(self.selectedTag) === -1) {
                var routeSelected = self.routes.filter(function (route) {
                    return route.tag === self.selectedTag;
                })[0];

                selectedTags.push(self.selectedTag);
                self.routesSelected.push(routeSelected);

                $scope.$emit('rlRouteSelector.changeRoute', self.routesSelected);
                self.selectedTag = null;
            }
        }

        self.change = change;
        self.remove = remove;
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