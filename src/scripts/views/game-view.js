/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'game';
            Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing :  [ 250, 0 ] });
        }
    };

    return m('#game-page', [
        m('.game-holder', {
            config : animIn
        },[
            m('header.game-header.out-top-full', [
                m('.timer'),
                m('h3.current-question', ctrl.VM.question())
            ]),
            m('.game-area')
        ])
    ]);
};

module.exports = View;