angular.module('BUSzinga')
    // CONTROLLER
    .controller('MainView', ['VehiclesService', 'RoutesService', function (vehicles, routes) {
        'use strict';
        var self = this;

        routes.getRoutes().then(function (routes) {
            vehicles.getVehicles().then(function (vehicles) {
                self.vehicles = vehicles.slice(0, 5);
                self.routes = routes.slice(0, 5);
                self.ready = true;
            });
        });
    }])

    // Directive
    .directive('rlMainView', function () {
        'use strict';
        return {
            templateUrl: 'src/components/main-view/main-view.html',
            controller: 'MainView',
            controllerAs: 'mainView'
        };
    });