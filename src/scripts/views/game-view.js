/* Global module */
'use strict';

var m = require('mithril'),
    answerView = require('./answer-view'),
    Velocity = require('velocity-animate');

var View = function(ctrl){
    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            document.body.className = 'game';
            Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
                ctrl.VM.startGame();
            });
        } else if(!ctrl.VM.gameOver() && !ctrl.VM.questionShown()){
            var answers = document.getElementsByClassName('answers-area')[0];
            answers.style.opacity = 1;
            answers.style.display = 'block';
            var ul = answers.children[0];
            Velocity(ul.children, 'transition.bounceIn', { stagger : '200ms' });
            window.w = true;
            ctrl.VM.questionShown(true);
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
                        return answerView(ctrl, answer);
                    })
                ])
            ])
        ])
    ]);
};

module.exports = View;