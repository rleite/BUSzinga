angular.module('BUSzinga').factory('DrawToolkit', function () {
    'use strict';

    function DrawToolkit(board, scales) {
        this.board = board;
        this.xScale = scales.xScale;
        this.yScale = scales.yScale;
    }

    function pointsPosition(selector) {
        var self = this;
        selector
            .attr('points', function (d) {
                return d.map(function (p) {
                    return self.xScale(p) + ',' + self.yScale(p) + ' ';
                });
            });
    }

    function defaultEnter(selector, name, style) {
        return selector.append(name).attr('class', style);
    }

    var types = {

        circle: {
            fnName: 'drawCircles',
            setPosition: function (selector) {
                var self = this;
                selector
                    .attr('cx', function (d) {
                        return self.xScale(d);
                    })
                    .attr('cy', function (d) {
                        return self.yScale(d);
                    });
            }
        },

        polygon: {
            fnName: 'drawPolygons',
            setPosition: pointsPosition
        },

        polyline: {
            fnName: 'drawPolylines',
            setPosition: pointsPosition
        },

        line: {
            fnName: 'drawLines',
            setPosition: function (selector) {
                var self = this;
                selector
                    .attr('x1', function (d) {
                        return self.xScale(d[0]);
                    })
                    .attr('y1', function (d) {
                        return self.yScale(d[0]);
                    })
                    .attr('x2', function (d) {
                        return self.xScale(d[1]);
                    })
                    .attr('y2', function (d) {
                        return self.yScale(d[1]);
                    });
            }
        }
    };

    DrawToolkit.wrapAnimation = function (selector, animation) {
        return animation ? animation(selector) : selector;
    };

    angular.forEach(types, function (type, name) {
        type.enter = type.enter || defaultEnter;
        DrawToolkit.prototype[type.fnName] = function (dataset, style, options) {
            var self = this;
            options = options || {};
            options.enter = options.enter || angular.noop;

            function remove(selector) {
                selector.exit().remove();
            }

            function enter(selector) {
                type.enter(selector.enter(), name, style)
                    .call(type.setPosition.bind(self))
                    .call(options.enter);
            }

            function position(selector) {
                DrawToolkit.wrapAnimation(selector, options.animation)
                    .call(type.setPosition.bind(self));
            }

            var selector = this.board
                .selectAll('.' + style)
                .data(dataset, options.key)
                .call(enter)
                .call(remove)
                .call(position);

            return selector;
        };
    });

    return DrawToolkit;
});