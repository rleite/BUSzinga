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

            function scaleAnimation(selector) {
                return selector.transition()
                    .duration(500);
            }

            function applyScaleAndCenter(animate) {

                var scale = mapCtrl.getScale();
                var scaledRadios = Math.round(mapCtrl.drawMax * 0.5 * scale);

                var centerX = Math.round(mapCtrl.center.x * scale);
                var centerY = Math.round(mapCtrl.center.y * scale);

                var translateX = (width * 0.5) + centerX - scaledRadios;
                var translateY = (height * 0.5) + centerY - scaledRadios;

                // DrawToolkit.wrapAnimation(map, animate && scaleAnimation)
                //     .attr('transform', 'translate(' + translateX + ', ' + translateY + ')');

                // DrawToolkit.wrapAnimation(mapBoard, animate && scaleAnimation)
                //     .attr('transform', 'scale(' + scale + ')');

                $scope.$broadcast('rlMap.applyScaleAndCenter');
            }

            function getScalers(limit) {
                var minPoint = mapCtrl.minPoint;
                var maxPoint = mapCtrl.maxPoint;
                var halfLat = (maxPoint.lat - minPoint.lat) / 2;
                var halfLon = (maxPoint.lon - minPoint.lon) / 2;

                var scale = 0.5;
                var projection = d3.geo.mercator()
                    .center([halfLon, halfLat])
                    .scale((limit + 1) / 2 / Math.PI)
                    .translate([limit * 0.5, limit * 0.5]);


                var xD3Scale = d3.scale.linear()
                    .domain([minPoint.lon, maxPoint.lon])
                    .range([0, limit]);

                var yD3Scale = d3.scale.linear()
                    .domain([minPoint.lat, maxPoint.lat])
                    .range([limit, 0]);

                return {
                    xScale: function (d) {
                        return projection([d.point.lon, d.point.lat])[0];
                    },

                    yScale: function (d) {
                        return projection([d.point.lon, d.point.lat])[1];
                    }
                };
            }

            function drawBackground() {
                var neighborhoodColorScale = d3.scale.linear()
                    .domain([0, mapCtrl.neighborhoods.length - 1])
                    .range(['#FFFFFF', '#E8E8E8']);
                var neighborhoods = mapCtrl.neighborhoods.map(function (neighborhood) {
                    return neighborhood.edges;
                }).reduce(function (ra, rb) {
                    return ra.concat(rb);
                });

                if (mapCtrl.rulers) {
                    drawToolkit.drawLines(mapCtrl.rulers, 'ruler');
                }

                if (mapCtrl.groups) {
                    drawToolkit.drawLines(mapCtrl.groups, 'group');
                }

                drawToolkit.drawPolygons(neighborhoods, 'neighborhood').style('fill', function (d, i) {
                    return neighborhoodColorScale(i);
                });

                drawToolkit.drawPolylines(mapCtrl.streets.map(function getStreetPath(street) {
                    return street.path;
                }), 'street');
            }

            function reDraw(animateScale) {

                var drawRacio = 1;

                // vehicles
                var vehiclesSelector = drawToolkit.drawCircles(mapCtrl.vehicles, 'vehicle', {
                    key: function (d) {
                        return d.id;
                    },
                    animation: function (selector) {

                        return selector
                            .each(function (d) {
                                d.animation = d.animation || {};
                            })
                            .filter(function (d) {
                                return !d.animation.moving;
                            })
                            .each(function (d) {
                                d.animation.moving = true;
                            })
                            .transition()
                            .ease('linear')
                            .duration(2000)
                            .each('end', function (d) {
                                d.animation.moving = false;
                            });
                    },
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
                                reDraw(500);
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
                });

                DrawToolkit.wrapAnimation(vehiclesSelector, animateScale && scaleAnimation)
                    .attr('r', function (d) {
                        return (d._active ? 10 : 5) * drawRacio;
                    }).style('stroke-width', function () {
                        return drawRacio * 2;
                    });

                console.log('REDER');
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
                    reDraw(500);
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