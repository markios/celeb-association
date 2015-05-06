/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var animIn = function(el, isInitialized, context) {
        if(!timer.isActive()){
            // Velocity(el, { });
        }
    };

    return m(".timer", {
        config : animIn
    });
};

module.exports = View;