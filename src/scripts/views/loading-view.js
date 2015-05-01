'use strict';
/* Global module */

var m = require('mithril'),
    Velocity = require('velocity-animate');

var animIn = function(el, isInitialized, context) {
    if (!isInitialized) {
        Velocity(el, { translateX : '+=100%' }, { delay : 200, duration : 300, easing : 'ease' });
    }
};

var Loading = function(ctrl){
    return m('#loading-page', [
        m('.message-holder', {
            config : animIn
        },[
            m('h3', 'Loading'),
            m('.progress', { style: { width: ctrl.VM.progress() + '%', bottom: '-' + ((100 - ctrl.VM.progress()) / 5) + 'px' } } )
        ])
    ]);
};

module.exports = Loading;