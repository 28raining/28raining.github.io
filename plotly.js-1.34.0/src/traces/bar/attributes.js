/**
* Copyright 2012-2018, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var scatterAttrs = require('../scatter/attributes');
var colorAttributes = require('../../components/colorscale/color_attributes');
var errorBarAttrs = require('../../components/errorbars/attributes');
var colorbarAttrs = require('../../components/colorbar/attributes');
var fontAttrs = require('../../plots/font_attributes');

var extendFlat = require('../../lib/extend').extendFlat;

var textFontAttrs = fontAttrs({
    editType: 'calc',
    arrayOk: true,
    description: ''
});

var scatterMarkerAttrs = scatterAttrs.marker;
var scatterMarkerLineAttrs = scatterMarkerAttrs.line;

var markerLineWidth = extendFlat({},
    scatterMarkerLineAttrs.width, { dflt: 0 });

var markerLine = extendFlat({
    width: markerLineWidth,
    editType: 'calc'
}, colorAttributes('marker.line'));

var marker = extendFlat({
    line: markerLine,
    editType: 'calc'
}, colorAttributes('marker'), {
    showscale: scatterMarkerAttrs.showscale,
    colorbar: colorbarAttrs,
    opacity: {
        valType: 'number',
        arrayOk: true,
        dflt: 1,
        min: 0,
        max: 1,
        role: 'style',
        editType: 'style',
        description: 'Sets the opacity of the bars.'
    }
});

module.exports = {
    x: scatterAttrs.x,
    x0: scatterAttrs.x0,
    dx: scatterAttrs.dx,
    y: scatterAttrs.y,
    y0: scatterAttrs.y0,
    dy: scatterAttrs.dy,

    text: scatterAttrs.text,
    hovertext: scatterAttrs.hovertext,

    textposition: {
        valType: 'enumerated',
        role: 'info',
        values: ['inside', 'outside', 'auto', 'none'],
        dflt: 'none',
        arrayOk: true,
        editType: 'calc',
        description: [
            'Specifies the location of the `text`.',
            '*inside* positions `text` inside, next to the bar end',
            '(rotated and scaled if needed).',
            '*outside* positions `text` outside, next to the bar end',
            '(scaled if needed).',
            '*auto* positions `text` inside or outside',
            'so that `text` size is maximized.'
        ].join(' ')
    },

    textfont: extendFlat({}, textFontAttrs, {
        description: 'Sets the font used for `text`.'
    }),

    insidetextfont: extendFlat({}, textFontAttrs, {
        description: 'Sets the font used for `text` lying inside the bar.'
    }),

    outsidetextfont: extendFlat({}, textFontAttrs, {
        description: 'Sets the font used for `text` lying outside the bar.'
    }),

    constraintext: {
        valType: 'enumerated',
        values: ['inside', 'outside', 'both', 'none'],
        role: 'info',
        dflt: 'both',
        editType: 'calc',
        description: [
            'Constrain the size of text inside or outside a bar to be no',
            'larger than the bar itself.'
        ].join(' ')
    },

    orientation: {
        valType: 'enumerated',
        role: 'info',
        values: ['v', 'h'],
        editType: 'calc+clearAxisTypes',
        description: [
            'Sets the orientation of the bars.',
            'With *v* (*h*), the value of the each bar spans',
            'along the vertical (horizontal).'
        ].join(' ')
    },

    base: {
        valType: 'any',
        dflt: null,
        arrayOk: true,
        role: 'info',
        editType: 'calc',
        description: [
            'Sets where the bar base is drawn (in position axis units).',
            'In *stack* or *relative* barmode,',
            'traces that set *base* will be excluded',
            'and drawn in *overlay* mode instead.'
        ].join(' ')
    },

    offset: {
        valType: 'number',
        dflt: null,
        arrayOk: true,
        role: 'info',
        editType: 'calc',
        description: [
            'Shifts the position where the bar is drawn',
            '(in position axis units).',
            'In *group* barmode,',
            'traces that set *offset* will be excluded',
            'and drawn in *overlay* mode instead.'
        ].join(' ')
    },

    width: {
        valType: 'number',
        dflt: null,
        min: 0,
        arrayOk: true,
        role: 'info',
        editType: 'calc',
        description: [
            'Sets the bar width (in position axis units).'
        ].join(' ')
    },

    marker: marker,

    selected: {
        marker: {
            opacity: scatterAttrs.selected.marker.opacity,
            color: scatterAttrs.selected.marker.color,
            editType: 'style'
        },
        textfont: scatterAttrs.selected.textfont,
        editType: 'style'
    },
    unselected: {
        marker: {
            opacity: scatterAttrs.unselected.marker.opacity,
            color: scatterAttrs.unselected.marker.color,
            editType: 'style'
        },
        textfont: scatterAttrs.unselected.textfont,
        editType: 'style'
    },

    r: scatterAttrs.r,
    t: scatterAttrs.t,

    error_y: errorBarAttrs,
    error_x: errorBarAttrs,

    _deprecated: {
        bardir: {
            valType: 'enumerated',
            role: 'info',
            editType: 'calc',
            values: ['v', 'h'],
            description: 'Renamed to `orientation`.'
        }
    }
};
