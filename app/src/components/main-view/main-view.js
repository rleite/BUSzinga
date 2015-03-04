angular.module('metro1000Eyes')
    // CONTROLLER
    .controller('MainView', ['Nextbus', function (bus) {
        'use strict';
        var self = this;
        self.vehicles = [];

        bus.getVehicleLocations().then(function (vehicles) {
            self.vehicles = vehicles;
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