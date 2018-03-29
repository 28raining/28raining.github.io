/**
* Copyright 2012-2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var d3 = require('d3');
var Lib = require('../../lib');
var Drawing = require('../../components/drawing');
var boxPlot = require('../box/plot');
var linePoints = require('../scatter/line_points');
var helpers = require('./helpers');

module.exports = function plot(gd, plotinfo, cd) {
    var fullLayout = gd._fullLayout;
    var xa = plotinfo.xaxis;
    var ya = plotinfo.yaxis;

    function makePath(pts) {
        var segments = linePoints(pts, {
            xaxis: xa,
            yaxis: ya,
            connectGaps: true,
            baseTolerance: 0.75,
            shape: 'spline',
            simplify: true
        });
        return Drawing.smoothopen(segments[0], 1);
    }

    var traces = plotinfo.plot.select('.violinlayer')
        .selectAll('g.trace.violins')
            .data(cd)
      .enter().append('g')
        .attr('class', 'trace violins');

    traces.each(function(d) {
        var cd0 = d[0];
        var t = cd0.t;
        var trace = cd0.trace;
        var sel = cd0.node3 = d3.select(this);
        var numViolins = fullLayout._numViolins;
        var group = (fullLayout.violinmode === 'group' && numViolins > 1);
        // violin max half width
        var bdPos = t.bdPos = t.dPos * (1 - fullLayout.violingap) * (1 - fullLayout.violingroupgap) / (group ? numViolins : 1);
        // violin center offset
        var bPos = t.bPos = group ? 2 * t.dPos * (-0.5 + (t.num + 0.5) / numViolins) * (1 - fullLayout.violingap) : 0;

        if(trace.visible !== true || t.empty) {
            d3.select(this).remove();
            return;
        }

        var valAxis = plotinfo[t.valLetter + 'axis'];
        var posAxis = plotinfo[t.posLetter + 'axis'];
        var hasBothSides = trace.side === 'both';
        var hasPositiveSide = hasBothSides || trace.side === 'positive';
        var hasNegativeSide = hasBothSides || trace.side === 'negative';
        var hasBox = trace.box && trace.box.visible;
        var hasMeanLine = trace.meanline && trace.meanline.visible;
        var groupStats = fullLayout._violinScaleGroupStats[trace.scalegroup];

        sel.selectAll('path.violin')
            .data(Lib.identity)
            .enter().append('path')
            .style('vector-effect', 'non-scaling-stroke')
            .attr('class', 'violin')
            .each(function(d) {
                var pathSel = d3.select(this);
                var density = d.density;
                var len = density.length;
                var posCenter = d.pos + bPos;
                var posCenterPx = posAxis.c2p(posCenter);
                var scale;

                switch(trace.scalemode) {
                    case 'width':
                        scale = groupStats.maxWidth / bdPos;
                        break;
                    case 'count':
                        scale = (groupStats.maxWidth / bdPos) * (groupStats.maxCount / d.pts.length);
                        break;
                }

                var pathPos, pathNeg, path;
                var i, k, pts, pt;

                if(hasPositiveSide) {
                    pts = new Array(len);
                    for(i = 0; i < len; i++) {
                        pt = pts[i] = {};
                        pt[t.posLetter] = posCenter + (density[i].v / scale);
                        pt[t.valLetter] = density[i].t;
                    }
                    pathPos = makePath(pts);
                }

                if(hasNegativeSide) {
                    pts = new Array(len);
                    for(k = 0, i = len - 1; k < len; k++, i--) {
                        pt = pts[k] = {};
                        pt[t.posLetter] = posCenter - (density[i].v / scale);
                        pt[t.valLetter] = density[i].t;
                    }
                    pathNeg = makePath(pts);
                }

                if(hasBothSides) {
                    path = pathPos + 'L' + pathNeg.substr(1) + 'Z';
                }
                else {
                    var startPt = [posCenterPx, valAxis.c2p(density[0].t)];
                    var endPt = [posCenterPx, valAxis.c2p(density[len - 1].t)];

                    if(trace.orientation === 'h') {
                        startPt.reverse();
                        endPt.reverse();
                    }

                    if(hasPositiveSide) {
                        path = 'M' + startPt + 'L' + pathPos.substr(1) + 'L' + endPt;
                    } else {
                        path = 'M' + endPt + 'L' + pathNeg.substr(1) + 'L' + startPt;
                    }
                }
                pathSel.attr('d', path);

                // save a few things used in getPositionOnKdePath, getKdeValue
                // on hover and for meanline draw block below
                d.posCenterPx = posCenterPx;
                d.posDensityScale = scale * bdPos;
                d.path = pathSel.node();
                d.pathLength = d.path.getTotalLength() / (hasBothSides ? 2 : 1);
            });

        if(hasBox) {
            var boxWidth = trace.box.width;
            var boxLineWidth = trace.box.line.width;
            var bdPosScaled;
            var bPosPxOffset;

            if(hasBothSides) {
                bdPosScaled = bdPos * boxWidth;
                bPosPxOffset = 0;
            } else if(hasPositiveSide) {
                bdPosScaled = [0, bdPos * boxWidth / 2];
                bPosPxOffset = -boxLineWidth;
            } else {
                bdPosScaled = [bdPos * boxWidth / 2, 0];
                bPosPxOffset = boxLineWidth;
            }

            // do not draw whiskers on inner boxes
            trace.whiskerwidth = 0;

            boxPlot.plotBoxAndWhiskers(sel, {pos: posAxis, val: valAxis}, trace, {
                bPos: bPos,
                bdPos: bdPosScaled,
                bPosPxOffset: bPosPxOffset
            });

            // if both box and meanline are visible, show mean line inside box
            if(hasMeanLine) {
                boxPlot.plotBoxMean(sel, {pos: posAxis, val: valAxis}, trace, {
                    bPos: bPos,
                    bdPos: bdPosScaled,
                    bPosPxOffset: bPosPxOffset
                });
            }
        }
        else {
            if(hasMeanLine) {
                sel.selectAll('path.mean')
                    .data(Lib.identity)
                    .enter().append('path')
                    .attr('class', 'mean')
                    .style({
                        fill: 'none',
                        'vector-effect': 'non-scaling-stroke'
                    })
                    .each(function(d) {
                        var v = valAxis.c2p(d.mean, true);
                        var p = helpers.getPositionOnKdePath(d, trace, v);

                        d3.select(this).attr('d',
                            trace.orientation === 'h' ?
                                'M' + v + ',' + p[0] + 'V' + p[1] :
                                'M' + p[0] + ',' + v + 'H' + p[1]
                        );
                    });
            }
        }

        if(trace.points) {
            boxPlot.plotPoints(sel, {x: xa, y: ya}, trace, t);
        }
    });
};
