angular.module('BUSzinga')
    .controller('rlMap', [
        '$q', 'StreetsService', 'RoutesService', 'Store',
        function ($q, streets, routes, Store) {
            'use strict';
            var self = this;

            function init() {
                return $q.all([
                    streets.getStreets()
                    // routes.getRoutes().then(function (routes) {
                    //     self.routes = routes;
                    // })
                ]).then(function (data) {
                    self.streets = data[0];
                    self.minPoint = Store.get('pointEdges', 'min');
                    self.maxPoint = Store.get('pointEdges', 'max');
                });
            }


            self.init = init;
        }])

    .directive('rlMap', ['$window', function ($window) {
        'use strict';
        var w = angular.element($window);

        function fnLink($scope, $elem, $attrs, mapCtrl) {
            $elem.addClass('rl-map');
            var xScale, yScale;
            var elemDom = $elem[0];
            var width = elemDom.offsetWidth;
            var height = 650;
            var minScale = height < width ? height : width;
            minScale = minScale / 2;
            var map = d3.select(elemDom)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g');

            // function drawRoute() {
            //     var edges = mapCtrl.getRouteedges()
            //     var minPoint = mapCtrl.getMinPoint();
            //     var maxPoint = mapCtrl.getMaxPoint();

            //     var stopPoints = [];
            //     mapCtrl.routes.forEach(function (route) {
            //         var stops = (route.stops || []).map(function (stop) {
            //             return stop.point;
            //         });

            //         stopPoints = stopPoints.concat(stops);
            //     });

            //     map.selectAll('circle.stop')
            //         .data(stopPoints)
            //         .enter()
            //         .append('circle')
            //         .attr('class', 'stop')
            //         .attr('cx', function (point) {
            //             return xScale(point.lon);
            //         })
            //         .attr('cy', function (point) {
            //             return height - yScale(point.lat);
            //         })
            //         .attr('r', function () {
            //             return 2;
            //         });
            // }

            function drawLine(point1, point2, style1, style2) {
                // var line = map.select('line' + style1 + '.' + style2);
                // if (!line.enp) {
                //     line = ;
                // }

                map.append('line')
                    .attr('class', style1)
                    // .attr('class', style2)
                    .attr('x1', function () { return xScale(point1.lon); })
                    .attr('y1', function () { return height - yScale(point1.lat); })
                    .attr('x2', function () { return xScale(point2.lon); })
                    .attr('y2', function () { return height - yScale(point2.lat); });
            }

            function drawStreets() {
                angular.forEach(mapCtrl.streets, function drawStreetPath(street) {
                    var i;
                    var path = street.path;
                    var len = path.length;

                    for (i = 1; i < len; i++) {
                        drawLine(path[i - 1], path[i], 'street', 'street-' + street.streetname.replace(/ /g, '-'));
                    }
                });
            }

            function initMap() {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;
                xScale = d3.scale.linear()
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([(width / 2)  + 10 - minScale, (width / 2) + minScale - 10]);
                yScale = d3.scale.linear()
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([(height / 2)  + 10 - minScale, (height / 2) + minScale - 10]);
                drawStreets();
            }

            mapCtrl.init().then(initMap);

            // w.bind('resize', initMap);
        }

        return {
            controller: 'rlMap',
            controllerAs: 'rlMap',
            link: fnLink
        };
    }]);