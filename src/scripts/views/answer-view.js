/* Global module */
'use strict';

var m = require('mithril'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var View = function(ctrl, answer){

    var animIn = function(el, isInitialized, context) {
        if (isInitialized && answer.toggled()) {
            el.classList.toggle('selected');
            Velocity(el, 'callout.pulse', { duration : 400 });
            answer.toggled(false);
        } else if(!isInitialized){
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.toggle.bind(this, answer));
        }
    };

    return m("li.opaque", {
        config : animIn,
        style : { backgroundImage : "url(" + answer.image() + ")" }
    }, [
        m("h4.name", answer.name())
    ]);
};

module.exports = View;