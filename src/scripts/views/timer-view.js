/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var animIn = function(el, isInitialized, context) {
        if(!timer) return;
        if(!timer.isActive()){
            Velocity(el, { width : '100%' }, { duration : timer.time(), easing : 'linear' }).then(function(){
                ctrl.onTime();
            });
            timer.isActive(true);
        }
    };

    return m(".timer", {
        config : animIn
    });
};

module.exports = View;