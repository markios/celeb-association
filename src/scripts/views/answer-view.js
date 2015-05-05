/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, answer){

    var animIn = function(el, isInitialized, context) {
        if (isInitialized && answer.toggled()) {
            Velocity(el, 'callout.pulse', { duration : 400 });
            answer.toggled(false);
        }
    };

    return m("li.opaque", { config : animIn, onclick : ctrl.toggle.bind(this, answer), style : { backgroundImage : "url(" + answer.image() + ")" } }, [
        m("h4.name", answer.name())
    ]);
};

module.exports = View;