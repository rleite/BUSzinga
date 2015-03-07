angular.module('BUSzinga')
    .directive('rlMap', ['$window', function ($window) {
        'use strict';
        var w = angular.element($window);

        function fnLink($scope, $elem, $attrs, mapCtrl) {
            $elem.addClass('rl-map');
            var xScale = d3.scale.linear();
            var yScale = d3.scale.linear();
            var elemDom = $elem[0];
            var width;
            var height;
            var resizeTimeoutId;

            var scaleValueElem;
            var scaleValueHeight;

            var svgElem;
            var map;

            function updateDimentions() {
                width = elemDom.offsetWidth;
                height = elemDom.offsetHeight;

                svgElem
                    .attr('width', width)
                    .attr('height', height);
            }

            function updateScales() {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;

                xScale
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([(width / 2)  + 10 - mapCtrl.scale, (width / 2) + mapCtrl.scale - 10]);

                yScale
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([(height / 2)  + 10 - mapCtrl.scale, (height / 2) + mapCtrl.scale - 10]);
            }

            function drawLines(lines, style) {
                var linesSelect = map.selectAll('line.' + style)
                    .data(lines);

                linesSelect.enter()
                    .append('line')
                    .attr('class', style);

                linesSelect.attr('x1', function (line) { return xScale(line.point1.lon); })
                    .attr('y1', function (line) { return height - yScale(line.point1.lat); })
                    .attr('x2', function (line) { return xScale(line.point2.lon); })
                    .attr('y2', function (line) { return height - yScale(line.point2.lat); });
            }

            function drawMap() {
                updateDimentions();
                updateScales();

                drawLines(mapCtrl.limits, 'limits');
                drawLines(mapCtrl.streets, 'street');
            }

            function delayedDrawMap() {
                if (resizeTimeoutId) {
                    clearTimeout(resizeTimeoutId);
                }
                resizeTimeoutId = setTimeout(drawMap, 500);
            }

            function updateScaleValueHeight() {
                var margin = scaleValueHeight - Math.round(mapCtrl.getScaleRate() * scaleValueHeight);
                scaleValueElem.css({
                    'margin-top': margin + 'px'
                });
            }

            function init() {
                // defined 
                scaleValueElem = angular.element(elemDom.querySelector('.scale-value'));
                scaleValueHeight = scaleValueElem[0].offsetHeight;
                updateScaleValueHeight();

                svgElem = d3.select(elemDom).append('svg');
                map = svgElem.append('g');
                updateDimentions();

                mapCtrl.init().then(function () {
                    drawMap();
                    w.bind('resize', updateDimentions);

                    $elem.bind('wheel', function (event) {
                        mapCtrl.incrementScale(Math.round(event.wheelDeltaY * 0.5));
                        updateScaleValueHeight();
                        delayedDrawMap();
                    });

                });
            }

            init();
        }

        return {
            templateUrl: 'src/components/map/map.html',
            controller: 'rlMap',
            controllerAs: 'rlMap',
            bindToController: true,
            link: fnLink
        };
    }]);