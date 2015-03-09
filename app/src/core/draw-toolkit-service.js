angular.module('BUSzinga').factory('DrawToolkit', function () {
    'use strict';

    function DrawToolkit(board, xScale, yScale) {
        this.board = board;
        this.xScale = xScale;
        this.yScale = yScale;
    }

    DrawToolkit.prototype.get = function (type, style, data) {
        var linesSelect = this.board.selectAll(type + '.' + style)
            .data(data);

        linesSelect.enter()
            .append(type)
            .attr('class', style);

        return linesSelect;
    };

    DrawToolkit.prototype.drawCircles = function (circles, style) {
        var self = this;
        return self.get('circle', style, circles)
            .attr('cx', function (d) {
                return self.xScale(d);
            })
            .attr('cy', function (d) {
                return self.yScale(d);
            });
    };

    DrawToolkit.prototype.drawLines = function (lines, style) {
        var self = this;

        return self.get('line', style, lines)
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
    };

    return DrawToolkit;
});