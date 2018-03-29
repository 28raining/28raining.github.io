/**
* Copyright 2012-2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var Lib = require('../../lib');
var constants = require('./constants');

// look for either subplot or xaxis and yaxis attributes
exports.getSubplot = function getSubplot(trace) {
    return trace.subplot || (trace.xaxis + trace.yaxis) || trace.geo;
};

// convenience functions for mapping all relevant axes
exports.flat = function flat(subplots, v) {
    var out = new Array(subplots.length);
    for(var i = 0; i < subplots.length; i++) {
        out[i] = v;
    }
    return out;
};

exports.p2c = function p2c(axArray, v) {
    var out = new Array(axArray.length);
    for(var i = 0; i < axArray.length; i++) {
        out[i] = axArray[i].p2c(v);
    }
    return out;
};

exports.getDistanceFunction = function getDistanceFunction(mode, dx, dy, dxy) {
    if(mode === 'closest') return dxy || exports.quadrature(dx, dy);
    return mode === 'x' ? dx : dy;
};

exports.getClosest = function getClosest(cd, distfn, pointData) {
    // do we already have a point number? (array mode only)
    if(pointData.index !== false) {
        if(pointData.index >= 0 && pointData.index < cd.length) {
            pointData.distance = 0;
        }
        else pointData.index = false;
    }
    else {
        // apply the distance function to each data point
        // this is the longest loop... if this bogs down, we may need
        // to create pre-sorted data (by x or y), not sure how to
        // do this for 'closest'
        for(var i = 0; i < cd.length; i++) {
            var newDistance = distfn(cd[i]);
            if(newDistance <= pointData.distance) {
                pointData.index = i;
                pointData.distance = newDistance;
            }
        }
    }
    return pointData;
};

// for bar charts and others with finite-size objects: you must be inside
// it to see its hover info, so distance is infinite outside.
// But make distance inside be at least 1/4 MAXDIST, and a little bigger
// for bigger bars, to prioritize scatter and smaller bars over big bars
//
// note that for closest mode, two inbox's will get added in quadrature
// args are (signed) difference from the two opposite edges
// count one edge as in, so that over continuous ranges you never get a gap
exports.inbox = function inbox(v0, v1) {
    if(v0 * v1 < 0 || v0 === 0) {
        return constants.MAXDIST * (0.6 - 0.3 / Math.max(3, Math.abs(v0 - v1)));
    }
    return Infinity;
};

exports.quadrature = function quadrature(dx, dy) {
    return function(di) {
        var x = dx(di),
            y = dy(di);
        return Math.sqrt(x * x + y * y);
    };
};

/** Fill event data point object for hover and selection.
 *  Invokes _module.eventData if present.
 *
 * N.B. note that point 'index' corresponds to input data array index
 *  whereas 'number' is its post-transform version.
 *
 * If the hovered/selected pt corresponds to an multiple input points
 * (e.g. for histogram and transformed traces), 'pointNumbers` and 'pointIndices'
 * are include in the event data.
 *
 * @param {object} pt
 * @param {object} trace
 * @param {object} cd
 * @return {object}
 */
exports.makeEventData = function makeEventData(pt, trace, cd) {
    // hover uses 'index', select uses 'pointNumber'
    var pointNumber = 'index' in pt ? pt.index : pt.pointNumber;

    var out = {
        data: trace._input,
        fullData: trace,
        curveNumber: trace.index,
        pointNumber: pointNumber
    };

    if(trace._indexToPoints) {
        var pointIndices = trace._indexToPoints[pointNumber];

        if(pointIndices.length === 1) {
            out.pointIndex = pointIndices[0];
        } else {
            out.pointIndices = pointIndices;
        }
    } else {
        out.pointIndex = pointNumber;
    }

    if(trace._module.eventData) {
        out = trace._module.eventData(out, pt, trace, cd, pointNumber);
    } else {
        if('xVal' in pt) out.x = pt.xVal;
        else if('x' in pt) out.x = pt.x;

        if('yVal' in pt) out.y = pt.yVal;
        else if('y' in pt) out.y = pt.y;

        if(pt.xa) out.xaxis = pt.xa;
        if(pt.ya) out.yaxis = pt.ya;
        if(pt.zLabelVal !== undefined) out.z = pt.zLabelVal;
    }

    exports.appendArrayPointValue(out, trace, pointNumber);

    return out;
};

/** Appends values inside array attributes corresponding to given point number
 *
 * @param {object} pointData : point data object (gets mutated here)
 * @param {object} trace : full trace object
 * @param {number|Array(number)} pointNumber : point number. May be a length-2 array
 *     [row, col] to dig into 2D arrays
 */
exports.appendArrayPointValue = function(pointData, trace, pointNumber) {
    var arrayAttrs = trace._arrayAttrs;

    if(!arrayAttrs) {
        return;
    }

    for(var i = 0; i < arrayAttrs.length; i++) {
        var astr = arrayAttrs[i];
        var key = getPointKey(astr);

        if(pointData[key] === undefined) {
            var val = Lib.nestedProperty(trace, astr).get();
            var pointVal = getPointData(val, pointNumber);

            if(pointVal !== undefined) pointData[key] = pointVal;
        }
    }
};

/**
 * Appends values inside array attributes corresponding to given point number array
 * For use when pointData references a plot entity that arose (or potentially arose)
 * from multiple points in the input data
 *
 * @param {object} pointData : point data object (gets mutated here)
 * @param {object} trace : full trace object
 * @param {Array(number)|Array(Array(number))} pointNumbers : Array of point numbers.
 *     Each entry in the array may itself be a length-2 array [row, col] to dig into 2D arrays
 */
exports.appendArrayMultiPointValues = function(pointData, trace, pointNumbers) {
    var arrayAttrs = trace._arrayAttrs;

    if(!arrayAttrs) {
        return;
    }

    for(var i = 0; i < arrayAttrs.length; i++) {
        var astr = arrayAttrs[i];
        var key = getPointKey(astr);

        if(pointData[key] === undefined) {
            var val = Lib.nestedProperty(trace, astr).get();
            var keyVal = new Array(pointNumbers.length);

            for(var j = 0; j < pointNumbers.length; j++) {
                keyVal[j] = getPointData(val, pointNumbers[j]);
            }
            pointData[key] = keyVal;
        }
    }
};

var pointKeyMap = {
    ids: 'id',
    locations: 'location',
    labels: 'label',
    values: 'value',
    'marker.colors': 'color'
};

function getPointKey(astr) {
    return pointKeyMap[astr] || astr;
}

function getPointData(val, pointNumber) {
    if(Array.isArray(pointNumber)) {
        if(Array.isArray(val) && Array.isArray(val[pointNumber[0]])) {
            return val[pointNumber[0]][pointNumber[1]];
        }
    } else {
        return val[pointNumber];
    }
}
