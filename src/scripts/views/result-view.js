/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var animIn = function(el, isInitialized, context) {

        if(!isInitialized) {
            document.body.className = 'result';
        }

    };

    return m('#result-page', [
        m('.result-holder', {
            config : animIn
        },[
            m('.result', [
                m('h3.result.opaque', ctrl.VM.score())
            ])
        ])
    ]);
};

module.exports = View;