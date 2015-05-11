/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var renderScoreboardIn = function(){
        var result = document.getElementsByClassName('results')[0],
            scoresArea = document.getElementsByClassName('scores')[0],
            scoreTitle = scoresArea.children[0],
            moveOn = document.getElementsByClassName('move-on')[0],
            scores = scoresArea.children[1];

        var sequence = [
            { e : result.children, p : 'transition.expandOut', o : { delay : 5000 } },
            { e : scoreTitle, p : 'transition.fadeIn' },
            { e : scores.children, p : 'transition.slideLeftBigIn', o : { stagger : 200 } },
            { e : moveOn, p : 'transition.fadeIn' }
        ];
        Velocity.RunSequence(sequence);
    };

    var renderReplay = function(){
        var a = document.getElementsByClassName('btn');
        Velocity(a, 'fadeIn', { stagger : 200, complete : renderScoreboardIn.bind(this) });
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
            m('.scores', [
                m('h3.opaque', 'Your Scores'),
                m('ol.my-scores', [
                    ctrl.VM.scoreBoard().map(function(s, i) {
                        var className = '';
                        className +=  (i === 0) ? 'first' : '';
                        className +=  s.isCurrent ? ' current' : '';

                        return m('li.opaque', [
                            m('.score-item', { class : className }, [
                                s.score + ' points ',
                                m('span', s.friendlyTime)
                            ])
                        ]);
                    })
                ])
            ]),
            m('p.move-on.opaque', ['You scored ', m('span', ctrl.VM.score() + 'pts'), ', ' + ctrl.VM.endMessage()]),
            m('a.btn.replay.opaque[href="#/game"]', 'Try Again'),
            m('a.btn.level2.opaque', 'Level 2')
        ])
    ]);
};

module.exports = View;