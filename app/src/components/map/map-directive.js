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
            var mapBoard;
            var duration = 0;

            var drawToolkit;

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

                DrawToolkit.wrapAnimation(mapBoard, transition, function (selector) {
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

            function drawBackground() {
                drawToolkit.drawLines(mapCtrl.rulers, 'ruler');
                drawToolkit.drawPolylines(mapCtrl.streets.map(function getStreetPath(street) {
                    return street.path;
                }), 'street');
            }

            function reDraw(animate) {

                if (animate) {
                    duration = 500;
                }

                var routes = [];
                ((mapCtrl.route && mapCtrl.route.paths) || []).forEach(function (p) {
                    routes.push(p);
                });
                var t = mapCtrl.drawMax / mapCtrl.zoomScaler(mapCtrl.zoom);

                drawToolkit.drawPolylines(routes, 'route')
                    .style('stroke', function () {
                        return '#' + mapCtrl.route.color;
                    })
                    .style('stroke-width', function () {
                        return 4 * t;
                    });

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
                            // color
                            .style('fill', function (d) { return '#' + d.route.color; })
                            .on('click', function (d) {
                                d._active = false;
                                mapCtrl.setZoom(4);
                                var scalers = getScalers(mapCtrl.drawMax);
                                mapCtrl.selectVehicle(d, scalers.xScale(d), scalers.yScale(d));
                                reDraw(true);
                                applyScaleAndCenter(true);
                                d3.event.stopPropagation();
                            })
                            .on('mouseover', function (d) {
                                d._active = true;
                                reDraw();
                                updatePreview(d);
                                d3.event.stopPropagation();
                            })
                            .on('mouseleave', function (d) {
                                d._active = false;
                                reDraw();
                                updatePreview();
                                d3.event.stopPropagation();
                            });
                    }
                }).attr('r', function (d) {
                    return (d._active ? 10 : 5) * t;
                }).style('stroke-width', function () {
                    return 1 * t;
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
                    reDraw();
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
                mapBoard = map.append('g').attr('class', 'scaled-container');
                drawToolkit = new DrawToolkit(mapBoard, getScalers(mapCtrl.drawMax));

                updateDimentions();


                mapCtrl.init(drawBackground, reDraw);
                applyScaleAndCenter();

                $scope.$on('rlMapControl.scaleUpdated', function () {
                    mapCtrl.move(0, 0);
                    reDraw(true);
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