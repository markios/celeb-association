/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){


    var renderReplay = function(){
        var a = document.getElementsByClassName('btn');
        Velocity(a, 'fadeIn', { stagger : 200 });
    };

    var animIn = function(el, isInitialized, context) {
        if(!isInitialized) {
            document.body.className = 'result';
            var result = document.getElementsByClassName('results')[0];
            var sequence = [
                { e : result.children[0], p : 'transition.whirlIn' },
                { e : result.children[1], p : 'transition.expandIn' },
                { e : result.children[2], p : 'transition.expandIn', o : { complete : renderReplay.bind(this) } }
            ];
            Velocity.RunSequence(sequence);
        }
    };

    return m('#result-page', [
        m('.result-holder', {
            config : animIn
        },[
            m('.results', [
                m('.result-image.opaque', { style : { backgroundImage : 'url(' + ctrl.VM.resultImage() + ')' } }),
                m('h1.result.opaque', ctrl.VM.score() + '/' + ctrl.VM.highScore()),
                m('p.opaque', ctrl.VM.message())
            ]),
            m('.scores.opaque', [
                m('ol', [
                    ctrl.VM.scoreBoard().map(function(s) {
                        return m('li', s.score + ' points');
                    })
                ])
            ]),
            m('a.btn.replay.opaque[href="#/game"]', 'Try Again'),
            m('a.btn.level2.opaque', 'Level 2')
        ])
    ]);
};

module.exports = View;