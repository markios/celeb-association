/* Global module */
'use strict';

var m = require('mithril'),
    _ = require('lodash'),
    answerView = require('./answer-view'),
    timerView = require('./timer-view'),
    Velocity = require('velocity-animate');


/*
    Helpers
*/

var _getEl = function(marker){
    var el = document.querySelectorAll(marker);
    return el.length > 1 ? el : el[0];
};

var _runSequence = function(seq){
    Velocity.RunSequence(seq);
};

var _getAnimationFor = function(name, overides){
    var anim = {
        "questionNumberUp"   : { e : _getEl('.question-number'), p : { left : '50px', top : '20px', fontSize : '0.9rem' } },
        "questionNumberDown" : { e : _getEl('.question-number'), p : 'reverse' },
        "questionShow"       : { e : _getEl('.current-question'),  p : 'transition.slideUpIn' },
        "questionHide"       : { e : _getEl('.current-question'),  p : 'transition.slideUpOut' },
        "limitShow"          : { e : _getEl('.limit'), p : 'transition.bounceIn' },
        "limitHide"          : { e : _getEl('.limit'), p : 'transition.bounceOut' },
        "imageQuestionShow"  : { e : _getEl('.question-mask > .image-holder'), p : 'transition.shrinkIn' },
        "imageQuestionHide"  : { e : _getEl('.question-mask > .image-holder'), p : 'transition.shrinkOut' },
        "answersShow"        : { e : _getEl('.answer'), p : 'transition.bounceIn', o : { stagger : 200 } },
        "answersHide"        : { e : _getEl('.answer'), p : 'transition.bounceOut', o : { duration : 500 } },
        "falseAnswersFade"   : { e : _getEl('.js_falsy'), p : { opacity : 0.3 }, o : { duration : 500 } },
        "trueAnswersBuzz"    : { e : _getEl('.js_truthy'), p : 'callout.pulse', o : { duration : 300, stagger : 200 } },
    };

    var target = anim[name];
    if(overides ) {
        target.o = target.o || {};
        _.extend(target.o, overides);
    } 
    return target;
};

var _renderStandard = function(ctrl, el){
    var sequence = [
        _getAnimationFor('answersShow'),
        _getAnimationFor('questionNumberUp'),
        _getAnimationFor('questionShow'),
        _getAnimationFor('limitShow', { complete : ctrl.startQuestion.bind(ctrl) })
    ];
    if(ctrl.VM.currentQuestion() > 0) sequence.unshift(_getAnimationFor('questionNumberDown'));
    _runSequence(sequence);
};

var _renderImageQuestion = function(ctrl, el){
    var sequence = null;
    if(!ctrl.VM.question().imageShown()){
        sequence = [
          _getAnimationFor('questionNumberUp', { delay : 1000 }),
          _getAnimationFor('questionShow'),
          _getAnimationFor('imageQuestionShow'),
          _getAnimationFor('imageQuestionHide', { delay : 3000 }),
          _getAnimationFor('questionHide', { complete : ctrl.onImageShown.bind(ctrl) })
        ];
        if(ctrl.VM.currentQuestion() > 0) sequence.unshift(_getAnimationFor('questionNumberDown'));
    } else {
        sequence = [
          _getAnimationFor('questionShow'),
          _getAnimationFor('answersShow'),
          _getAnimationFor('limitShow', { complete : ctrl.startQuestion.bind(ctrl) })
        ];
    }
    _runSequence(sequence);
};

/*
    Render Entry Members
*/

var renderGamePage = function(ctrl, el){
    document.body.className = 'game';
    Velocity(_getEl('.game-header'), { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
        ctrl.ready();
    });
};


var renderOut = function(ctrl, el){
    Velocity(el.children[0], 'reverse').then(ctrl.endGame.bind(ctrl));
};


var renderAnswersOut = function(ctrl, el){
    // Velocity
    _runSequence([
        _getAnimationFor('falseAnswersFade'),
        _getAnimationFor('trueAnswersBuzz'),
        _getAnimationFor('answersHide', { delay : 1500 }),
        _getAnimationFor('questionHide', { duration : 500 }),
        _getAnimationFor('limitHide', { duration : 200 , complete : ctrl.afterEndQuestion.bind(ctrl) })
    ]);
};

var renderQuestionForType = function(ctrl, el){
    // Show the questions
    _getEl('.game-header').classList.add('begin');

    // get answers and remove weird init style
    var answers = _getEl('.question-mask');
    answers.style.opacity = 1;
    answers.style.display = 'block';

    switch(ctrl.VM.question().type()){
        case "standard" :
            _renderStandard(ctrl, el);
        break;
        case "image" :
            _renderImageQuestion(ctrl, el);
        break;
    }
};

var View = function(ctrl){
    var animIn = function(el, isInitialized, context) {
        // Decide what to do 
        if (!isInitialized) {
            renderGamePage(ctrl, el);
        }
        // end of question
        else if(ctrl.VM.endQuestion()){
            renderAnswersOut(ctrl, el);
        }
        // show the question
        else if(!ctrl.VM.gameOver() && !ctrl.VM.questionShown()){
            renderQuestionForType(ctrl, el);
        }
        // End of game 
        else if(ctrl.VM.gameOver()) {
            renderOut(ctrl, el);
        }
    };

    return m('#game-page', [
        m('.game-holder', {
            config : animIn
        },[
            m('header.game-header.out-top-full', [
                timerView(ctrl, ctrl.VM.timer()),
                m('h3.intro', 'Get ready'),
                m('h3.question-number', "question " + (+ctrl.VM.currentQuestion() + 1)),
                m('h3.current-question.opaque', ctrl.VM.question().questionElement()),
                m('h4.limit.opaque', ['Choose ', m('span', ctrl.VM.question().limit())])
            ]),
            m('.question-mask', [
                m('.image-holder.opaque', { style : { backgroundImage : 'url(' + (ctrl.VM.question().type() === 'image' ? ctrl.VM.question().sceneImage() : '') + ')' } } )
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