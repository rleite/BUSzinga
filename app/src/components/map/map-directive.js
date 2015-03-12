angular.module('BUSzinga')
    .directive('rlMap', ['$window', 'DrawToolkit', function ($window, DrawToolkit) {
        'use strict';
        var w = angular.element($window);

        function fnLink($scope, $elem, $attrs, mapCtrl) {
            $elem.addClass('rl-map');
            var elemDom = $elem[0];
            var width;
            var height;

            var svgElem;
            var map;
            var scaledContainer;
            var nonScaledContainer;
            var duration = 0;

            function updateDimentions() {
                width = elemDom.offsetWidth;
                height = elemDom.offsetHeight;

                svgElem
                    .attr('width', width)
                    .attr('height', height);

                mapCtrl.setWindow(width, height);
                mapCtrl.move(0, 0);
            }

            function transition(selector) {
                return selector.transition().duration(duration);
            }

            function applyScaleAndCenter(animate) {

                var scale = mapCtrl.getScale();
                var scaledRadios = Math.round(mapCtrl.drawMax * 0.5 * scale);

                var centerX = Math.round(mapCtrl.center.x * scale);
                var centerY = Math.round(mapCtrl.center.y * scale);

                var translateX = (width * 0.5) + centerX - scaledRadios;
                var translateY = (height * 0.5) + centerY - scaledRadios;

                if (animate) {
                    duration = 500;
                }

                DrawToolkit.wrapAnimation(map, transition, function (selector) {
                    selector.attr('transform', 'translate(' + translateX + ', ' + translateY + ')');
                });

                DrawToolkit.wrapAnimation(scaledContainer, transition, function (selector) {
                    selector.attr('transform', 'scale(' + scale + ')');
                });
                duration = 0;

                $scope.$broadcast('rlMap.applyScaleAndCenter');
            }

            function getScalers(limit) {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;
                var xD3Scale = d3.scale.linear()
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([0, limit]);

                var yD3Scale = d3.scale.linear()
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([limit, 0]);

                return {
                    xScale: function (d) {
                        return xD3Scale(d.point.lon);
                    },

                    yScale: function (d) {
                        return yD3Scale(d.point.lat);
                    }
                };
            }

            function drawScaled() {
                function getStreetPath(street) {
                    return street.path;
                }
                var drawToolkit = new DrawToolkit(scaledContainer, getScalers(mapCtrl.drawMax));
                drawToolkit.drawLines(mapCtrl.rulers, 'ruler');
                drawToolkit.drawPolylines(mapCtrl.streets.map(getStreetPath), 'street');
            }

            function drawNonScaled(animate) {
                var drawToolkit = new DrawToolkit(nonScaledContainer, getScalers(mapCtrl.getDrawZoom()));

                if (animate) {
                    duration = 500;
                }

                function isSelected(d) {
                    return d._active;
                }

                drawToolkit.drawCircles(mapCtrl.vehicles, 'vehicle', {
                    key: function (d) {
                        return d.id;
                    },
                    transition: transition,
                    enter: function (selector) {
                        function updatePreview(vehicle) {
                            $scope.$apply(function () {
                                mapCtrl.preview = vehicle;
                            });
                        }
                        selector
                            .on('click', function (d) {
                                mapCtrl.setZoom(4);
                                var scalers = getScalers(mapCtrl.drawMax);
                                mapCtrl.selectVehicle(d, scalers.xScale(d), scalers.yScale(d));
                                drawNonScaled(true);
                                applyScaleAndCenter(true);
                                d3.event.stopPropagation();
                            })
                            .on('mouseover', function (d) {
                                d._active = true;
                                drawNonScaled();
                                updatePreview(d);
                            })
                            .on('mouseleave', function (d) {
                                d._active = false;
                                drawNonScaled();
                                updatePreview();
                            });
                    }
                }).attr('r', function (d) {
                    return isSelected(d) ? 10 : 5;
                }).style('fill', function (d) {
                    return '#' + d.route.color;
                });
                duration = 0;
            }

            function setUpControls() {
                var lastX;
                var lastY;
                var isDown;

                $elem.on('wheel', function (event) {
                    var inc = event.wheelDeltaY > 0 ? -1 : 1;
                    mapCtrl.incrementZoom(inc);
                    mapCtrl.move(0, 0);
                    drawNonScaled();
                    applyScaleAndCenter();
                });

                $elem.on('mousedown', function (event) {
                    isDown = true;
                    lastX = event.x;
                    lastY = event.y;
                });
                $elem.on('mouseup', function () {
                    isDown = false;
                });

                $elem.on('mousemove', function (event) {
                    if (isDown) {
                        var moveX = lastX - event.x;
                        var moveY = lastY - event.y;
                        lastX = event.x;
                        lastY = event.y;

                        mapCtrl.move(-moveX, -moveY);
                        applyScaleAndCenter();
                    }
                });

            }

            function init() {
                // defined

                svgElem = d3.select(elemDom).append('svg');
                map = svgElem.append('g').attr('class', 'map-frame');
                scaledContainer = map.append('g').attr('class', 'scaled-container');
                nonScaledContainer = map.append('g').attr('class', 'non-scaled-container');
                updateDimentions();

                mapCtrl.init(drawScaled, drawNonScaled);
                applyScaleAndCenter();

                $scope.$on('rlMapControl.scaleUpdated', function () {
                    mapCtrl.move(0, 0);
                    drawNonScaled(true);
                    applyScaleAndCenter(true);
                });
                $scope.$on('rlMapControl.move', function () {
                    applyScaleAndCenter(true);
                });

                setUpControls();

                w.on('resize', function () {
                    updateDimentions();
                    // update the center position
                    applyScaleAndCenter();
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