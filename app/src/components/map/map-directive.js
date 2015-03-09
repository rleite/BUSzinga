angular.module('BUSzinga')
    .directive('rlMap', ['$window', 'DrawToolkit', function ($window, DrawToolkit) {
        'use strict';
        var w = angular.element($window);

        function fnLink($scope, $elem, $attrs, mapCtrl) {
            $elem.addClass('rl-map');
            var elemDom = $elem[0];
            var width;
            var height;

            var scaleValueElem;
            var scaleValueHeight;

            var svgElem;
            var map;
            var scaledContainer;
            var nonScaledContainer;

            function updateDimentions() {
                width = elemDom.offsetWidth;
                height = elemDom.offsetHeight;

                svgElem
                    .attr('width', width)
                    .attr('height', height);

            }

            function updateScaleValueHeight() {
                var margin = scaleValueHeight - Math.round(mapCtrl.getScale() * scaleValueHeight);
                scaleValueElem.css({
                    'margin-top': margin + 'px'
                });
            }

            function updateViewPort() {
                updateScaleValueHeight();

                var scale = mapCtrl.getScale();
                var scaledRadios = Math.round(mapCtrl.drawMax * 0.5 * scale);

                var centerX = Math.round(mapCtrl.center.x * scale);
                var centerY = Math.round(mapCtrl.center.y * scale);

                var translateX = (width * 0.5) + centerX - scaledRadios;
                var translateY = (height * 0.5) + centerY - scaledRadios;

                scaledContainer.attr('transform', 'scale(' + scale + ')');
                map.attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
            }

            function getScalers(limit) {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;
                var xD3Scale = d3.scale.linear()
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([0, limit]);

                var yD3Scale = d3.scale.linear()
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([0, limit]);

                return {
                    xScale: function (d) {
                        return xD3Scale(d.point.lon);
                    },

                    yScale: function (d) {
                        return limit - yD3Scale(d.point.lat);
                    }
                };
            }

            function drawScaled() {
                updateDimentions();
                var drawToolkit = new DrawToolkit(scaledContainer, getScalers(mapCtrl.drawMax));
                drawToolkit.drawLines(mapCtrl.rulers, 'ruler');
                drawToolkit.drawLines(mapCtrl.streets, 'street');
            }

            function drawNonScaled() {
                updateDimentions();
                var drawToolkit = new DrawToolkit(nonScaledContainer, getScalers(mapCtrl.zoom));

                drawToolkit
                    .drawCircles(mapCtrl.vehicles, 'vehicle')
                    .attr('r', function () {
                        return 3;
                    });
            }

            function setUpControls() {
                var lastX;
                var lastY;
                var isDown;

                $elem.bind('wheel', function (event) {
                    mapCtrl.incrementScale(Math.round(event.wheelDeltaY * 0.6));
                    mapCtrl.move(0, 0, width, height);
                    updateViewPort();
                    drawNonScaled();
                });

                $elem.bind('mousedown', function (event) {
                    isDown = true;
                    lastX = event.x;
                    lastY = event.y;
                });
                $elem.bind('mouseup', function () {
                    isDown = false;
                });

                $elem.bind('mousemove', function (event) {
                    if (isDown) {
                        var moveX = lastX - event.x;
                        var moveY = lastY - event.y;
                        lastX = event.x;
                        lastY = event.y;

                        mapCtrl.move(-moveX, -moveY, width, height);
                        updateViewPort();
                    }
                });

            }

            function init() {
                // defined 
                scaleValueElem = angular.element(elemDom.querySelector('.scale-value'));
                scaleValueHeight = scaleValueElem[0].offsetHeight;

                svgElem = d3.select(elemDom).append('svg');
                map = svgElem.append('g').attr('class', 'map-frame');
                scaledContainer = map.append('g').attr('class', 'scaled-container');
                nonScaledContainer = map.append('g').attr('class', 'non-scaled-container');
                updateDimentions();

                mapCtrl.init()
                    .then(function () {
                        drawScaled();
                        updateViewPort();
                        w.bind('resize', function () {
                            updateDimentions();
                            mapCtrl.move(0, 0, width, height);
                            updateViewPort();
                        });

                        setUpControls();
                    })
                    .then(mapCtrl.getVehicles)
                    .then(drawNonScaled);
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