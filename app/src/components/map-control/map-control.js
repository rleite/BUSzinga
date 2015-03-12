angular.module('BUSzinga')
    .directive('rlMapControl', ['MAP.CONF', function (config) {
        'use strict';
        function linkFn($scope, $elem, $attrs, rlMap) {
            $elem.addClass('rl-map-control');
            var moveValue = 100;

            $scope.move = function (x, y) {
                rlMap.move(x * moveValue, y * moveValue);
                $scope.$emit('rlMapControl.move');
            };

            $scope.scale = function (inc) {
                rlMap.incrementZoom(inc);
                $scope.$emit('rlMapControl.scaleUpdated');
            };


            function buildScaleIndicator() {
                var indicatorElem = $elem[0].querySelector('.map-scale-indicator');

                var height = indicatorElem.offsetHeight;
                var width = indicatorElem.offsetWidth;

                var controlBoard = d3.select(indicatorElem)
                    .append('svg')
                    .attr('height', height)
                    .attr('width', width);

                var zoomRation = (1 / config.maxZoom);
                var minRulerHeight = height * zoomRation;
                var zoomValueSize = 5;

                var zoomRulers = d3.range(0, 1, zoomRation);

                var scale = d3.scale.linear()
                    .range([minRulerHeight, height])
                    .domain([0, 1]);

                controlBoard
                    .append('rect')
                    .attr('class', 'scale-container')
                    .attr('cx', 0)
                    .attr('cy', 0)
                    .attr('rx', width * 0.5)
                    .attr('ry', width * 0.5)
                    .attr('width', width)
                    .attr('height', height);

                controlBoard
                    .selectAll('line')
                    .data(zoomRulers)
                    .enter()
                    .append('line')
                    .attr('class', 'scale-ruler')
                    .attr('x1', width * 0.2)
                    .attr('y1', function (d) {
                        return scale(d);
                    })
                    .attr('x2', width * 0.8)
                    .attr('y2', scale);

                controlBoard
                    .append('rect')
                    .attr('class', 'scale-value')
                    .attr('width', width * 0.6)
                    .attr('x', width * 0.2)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('height', zoomValueSize);

                function setZoomValuePosition() {
                    controlBoard.select('.scale-value')
                        .attr('y', function () {
                            return scale(rlMap.zoom / config.maxZoom) - (zoomValueSize * 0.5);
                        });
                }

                setZoomValuePosition();

                function updateScaleValueHeight() {
                    setZoomValuePosition();
                }

                $scope.$on('rlMap.applyScaleAndCenter', updateScaleValueHeight);
            }

            buildScaleIndicator();
        }
        return {
            templateUrl: 'src/components/map-control/map-control.html',
            require: '^rlMap',
            link: linkFn
        };
    }]);