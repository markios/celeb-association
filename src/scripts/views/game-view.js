/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'game';
            Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
                setTimeout(function(){
                    ctrl.VM.startGame();
                }, 300);
            });
        } else if(!ctrl.VM.gameOver()){
            var answers = document.getElementsByClassName('answers-area')[0];
            answers.style.opacity = 1;
            answers.style.display = 'block';
            var ul = answers.children[0];
            Velocity(ul.children, 'transition.bounceIn', { stagger : '200ms' });
        }
    };

    return m('#game-page', [
        m('.game-holder', {
            config : animIn
        },[
            m('header.game-header.out-top-full', [
                m('.timer'),
                m('h3.current-question', ctrl.VM.question().text())
            ]),
            m('.answers-area', [
                m("ul", [
                    ctrl.VM.question().answers().map(function(answer, index) {
                        return m("li.opaque", { style : { backgroundImage : "url(" + answer.image() + ")" } }, [
                            m("h4.name", answer.name())
                        ])
                    })
                ])
            ])
        ])
    ]);
};

module.exports = View;