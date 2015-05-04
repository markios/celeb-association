/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'intro';
            Velocity(el.children[0], { opacity : 1, left : 0 }, { duration : 500, delay : 300});
            Velocity(el.children[1], { opacity : 1, left : 0 }, { duration : 500, delay : 500});
            Velocity(el.children[2], { opacity : 1 }, { duration : 500, delay : 1000});
            Velocity(el.children[3], { opacity : 1, rotateZ : '-25', right : -50 }, { duration : 500, delay : 1500, easing : [ 250, 15 ] });
        } else {
            // Velocity(el.children, "reverse");
            Velocity(el.children, "reverse").then(ctrl.startGame);
        }
    };

    return m('#intro-page', [
        m('.intro-holder', {
            config : animIn
        },[
            m('h2.opaque.out-left-short', ctrl.VM.title()),
            m('.description.opaque.out-left-short', ctrl.VM.description()),
            m('a.begin.opaque', { onclick: ctrl.onBegin }, 'begin'),
            m('.brand.opaque.out-right-far', { style : { backgroundImage : 'url({0})'.replace('{0}', ctrl.VM.brand()) } })
        ])
    ]);
};

module.exports = Loading;