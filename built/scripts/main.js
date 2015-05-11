(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var App = require('./libs/app.js');

window.widgetVersion = "v0.0.0";

var initApp = function(params){
	var instance = new App();
};

document.addEventListener("DOMContentLoaded", function(event){
   //do work
   initApp();
});

},{"./libs/app.js":7}],2:[function(require,module,exports){
/**********************
   Velocity UI Pack
**********************/

/* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

;(function (factory) {
    /* CommonJS module. */
    if (typeof require === "function" && typeof exports === "object" ) {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define([ "velocity" ], factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /*************
        Checks
    *************/

    if (!global.Velocity || !global.Velocity.Utilities) {
        window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        return;
    } else {
        var Velocity = global.Velocity,
            $ = Velocity.Utilities;
    }

    var velocityVersion = Velocity.version,
        requiredVersion = { major: 1, minor: 1, patch: 0 };

    function greaterSemver (primary, secondary) {
        var versionInts = [];

        if (!primary || !secondary) { return false; }

        $.each([ primary, secondary ], function(i, versionObject) {
            var versionIntsComponents = [];

            $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                    value = "0" + value;
                }
                versionIntsComponents.push(value);
            });

            versionInts.push(versionIntsComponents.join(""))
        });

        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }

    if (greaterSemver(requiredVersion, velocityVersion)){
        var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
    }

    /************************
       Effect Registration
    ************************/

    /* Note: RegisterUI is a legacy name. */
    Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
        /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
        function animateParentHeight (elements, direction, totalDuration, stagger) {
            var totalHeightDelta = 0,
                parentNode;

            /* Sum the total height (including padding and margin) of all targeted elements. */
            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                if (stagger) {
                    /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                    totalDuration += i * stagger;
                }

                parentNode = element.parentNode;

                $.each([ "height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                    totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
            });

            /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
            Velocity.animate(
                parentNode,
                { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta },
                { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) }
            );
        }

        /* Register a custom redirect for each effect. */
        Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
            var finalElement = (elementsIndex === elementsSize - 1);

            if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
            } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
            }

            /* Iterate through each effect's call array. */
            for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                    propertyMap = call[0],
                    redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                    durationPercentage = call[1],
                    callOptions = call[2] || {},
                    opts = {};

                /* Assign the whitelisted per-call options. */
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;

                /* Special processing for the first effect call. */
                if (callIndex === 0) {
                    /* If a delay was passed into the redirect, combine it with the first call's delay. */
                    opts.delay += (parseFloat(redirectOptions.delay) || 0);

                    if (elementsIndex === 0) {
                        opts.begin = function() {
                            /* Only trigger a begin callback on the first effect call with the first element in the set. */
                            redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                            var direction = effectName.match(/(In|Out)$/);

                            /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                               and the first RAF tick. */
                            if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                                $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                });
                            }

                            /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                            if (redirectOptions.animateParentHeight && direction) {
                                animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                            }
                        }
                    }

                    /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                    if (redirectOptions.display !== null) {
                        if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                            opts.display = redirectOptions.display;
                        } else if (/In$/.test(effectName)) {
                            /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                            var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                            opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                        }
                    }

                    if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                /* Special processing for the last effect call. */
                if (callIndex === properties.calls.length - 1) {
                    /* Append promise resolving onto the user's redirect callback. */
                    function injectFinalCallbacks () {
                        if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                Velocity.CSS.setPropertyValue(element, "display", "none");
                            });
                        }

                        redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                        if (promiseData) {
                            promiseData.resolver(elements || element);
                        }
                    }

                    opts.complete = function() {
                        if (properties.reset) {
                            for (var resetProperty in properties.reset) {
                                var resetValue = properties.reset[resetProperty];

                                /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                   immediately and DOM querying is avoided (via forcefeeding). */
                                /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                    properties.reset[resetProperty] = [ properties.reset[resetProperty], properties.reset[resetProperty] ];
                                }
                            }

                            /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                            var resetOptions = { duration: 0, queue: false };

                            /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                            if (finalElement) {
                                resetOptions.complete = injectFinalCallbacks;
                            }

                            Velocity.animate(element, properties.reset, resetOptions);
                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                        } else if (finalElement) {
                            injectFinalCallbacks();
                        }
                    };

                    if (redirectOptions.visibility === "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                Velocity.animate(element, propertyMap, opts);
            }
        };

        /* Return the Velocity object so that RegisterUI calls can be chained. */
        return Velocity;
    };

    /*********************
       Packaged Effects
    *********************/

    /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
    /* Support: <=IE8: Callouts will have no effect, and transitions will simply fade in/out. IE9/Android 2.3: Most effects are fully supported, the rest fade in/out. All other browsers: full support. */
    Velocity.RegisterEffect.packagedEffects =
        {
            /* Animate.css */
            "callout.bounce": {
                defaultDuration: 550,
                calls: [
                    [ { translateY: -30 }, 0.25 ],
                    [ { translateY: 0 }, 0.125 ],
                    [ { translateY: -15 }, 0.125 ],
                    [ { translateY: 0 }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.shake": {
                defaultDuration: 800,
                calls: [
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 0 }, 0.125 ]
                ]
            },
            /* Animate.css */
            "callout.flash": {
                defaultDuration: 1100,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuad", 1 ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 0, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.pulse": {
                defaultDuration: 825,
                calls: [
                    [ { scaleX: 1.1, scaleY: 1.1 }, 0.50, { easing: "easeInExpo" } ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "callout.swing": {
                defaultDuration: 950,
                calls: [
                    [ { rotateZ: 15 }, 0.20 ],
                    [ { rotateZ: -10 }, 0.20 ],
                    [ { rotateZ: 5 }, 0.20 ],
                    [ { rotateZ: -5 }, 0.20 ],
                    [ { rotateZ: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "callout.tada": {
                defaultDuration: 1000,
                calls: [
                    [ { scaleX: 0.9, scaleY: 0.9, rotateZ: -3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: 3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: -3 }, 0.10 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ { scaleX: 1, scaleY: 1, rotateZ: 0 }, 0.20 ]
                ]
            },
            "transition.fadeIn": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 1, 0 ] } ]
                ]
            },
            "transition.fadeOut": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 0, 1 ] } ]
                ]
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateY: [ 0, -55 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateY: 55 } ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateX: [ 0, -45 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateX: 25 } ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateY: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateY: 10 }, 0.25 ],
                    [ { opacity: 1, rotateY: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateY: -10 }, 0.50 ],
                    [ { opacity: 0, rotateY: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateX: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateX: 10 }, 0.25 ],
                    [ { opacity: 1, rotateX: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateX: -15 }, 0.50 ],
                    [ { opacity: 0, rotateX: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Magic.css */
            "transition.swoopIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "100%", "50%" ], transformOriginY: [ "100%", "100%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], translateX: [ 0, -700 ], translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            "transition.swoopOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "100%" ], transformOriginY: [ "100%", "100%" ], scaleX: 0, scaleY: 0, translateX: -700, translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%", scaleX: 1, scaleY: 1, translateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], rotateY: [ 0, 160 ] }, 1, { easing: "easeInOutSine" } ]
                ]
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuint", 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0, scaleY: 0, rotateY: 160 }, 1, { easing: "swing" } ]
                ],
                reset: { scaleX: 1, scaleY: 1, rotateY: 0 }
            },
            "transition.shrinkIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 1.5 ], scaleY: [ 1, 1.5 ], translateZ: 0 } ]
                ]
            },
            "transition.shrinkOut": {
                defaultDuration: 600,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 1.3, scaleY: 1.3, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            "transition.expandIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.625 ], scaleY: [ 1, 0.625 ], translateZ: 0 } ]
                ]
            },
            "transition.expandOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0.5, scaleY: 0.5, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], scaleX: [ 1.05, 0.3 ], scaleY: [ 1.05, 0.3 ] }, 0.40 ],
                    [ { scaleX: 0.9, scaleY: 0.9, translateZ: 0 }, 0.20 ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "transition.bounceOut": {
                defaultDuration: 800,
                calls: [
                    [ { scaleX: 0.95, scaleY: 0.95 }, 0.35 ],
                    [ { scaleX: 1.1, scaleY: 1.1, translateZ: 0 }, 0.35 ],
                    [ { opacity: [ 0, 1 ], scaleX: 0.3, scaleY: 0.3 }, 0.30 ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ -30, 1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: 10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceUpOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: 20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: -1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 30, -1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: -10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceDownOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: -20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: 1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceLeftIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 30, -1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: -10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceLeftOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: 30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: -1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            /* Animate.css */
            "transition.bounceRightIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ -30, 1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: 10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceRightOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: -30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: 1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            /* Magic.css */
            "transition.perspectiveUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveUpOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            }
        };

    /* Register the packaged effects. */
    for (var effectName in Velocity.RegisterEffect.packagedEffects) {
        Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
    }

    /*********************
       Sequence Running
    **********************/

    /* Note: Sequence calls must use Velocity's single-object arguments syntax. */
    Velocity.RunSequence = function (originalSequence) {
        var sequence = $.extend(true, [], originalSequence);

        if (sequence.length > 1) {
            $.each(sequence.reverse(), function(i, currentCall) {
                var nextCall = sequence[i + 1];

                if (nextCall) {
                    /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                       in the previous call's begin callback. Otherwise, chained calls are normally triggered
                       in the previous call's complete callback. */
                    var currentCallOptions = currentCall.o || currentCall.options,
                        nextCallOptions = nextCall.o || nextCall.options;

                    var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
                        callbackOriginal = nextCallOptions && nextCallOptions[timing],
                        options = {};

                    options[timing] = function() {
                        var nextCallElements = nextCall.e || nextCall.elements;
                        var elements = nextCallElements.nodeType ? [ nextCallElements ] : nextCallElements;

                        callbackOriginal && callbackOriginal.call(elements, elements);
                        Velocity(currentCall);
                    }

                    if (nextCall.o) {
                        nextCall.o = $.extend({}, nextCallOptions, options);
                    } else {
                        nextCall.options = $.extend({}, nextCallOptions, options);
                    }
                }
            });

            sequence.reverse();
        }

        Velocity(sequence[0]);
    };
}((window.jQuery || window.Zepto || window), window, document);
}));
},{}],3:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	gameViewModel = require('./../models/game-vm');

var GameController = function(){
	this.VM = new gameViewModel();
	this.VM.init();
};

/*
	Public Members
*/

GameController.prototype.ready = function(){
	setTimeout(function(){
		this.VM.startGame();
		m.redraw();
	}.bind(this), 1000);
};

GameController.prototype.toggle = function(ans){
	if(this.VM.locked()) return;

	var answerIsSelected = ans.selected();
	if(this.VM.question().guessLimitReached() && !answerIsSelected){
		ans.toggleRejected(true);
	} else {
		ans.selected(!ans.selected());
		ans.toggled(true);
		// count the guesses again
		this.VM.question().countGuess();
	}
	m.redraw();
};

GameController.prototype.onTime = function(){
    this.VM.locked(true);
    this.VM.endQuestion(true);
    m.redraw();
};

GameController.prototype.afterEndQuestion = function(){
    this.VM.stopQuestion();
    m.redraw();
    this.VM.nextQuestion();
    m.redraw();
};

GameController.prototype.startQuestion = function(){
    this.VM.startQuestion();
    m.redraw();
};

GameController.prototype.endGame = function(){
	this.VM.updateScore();
	m.route("/result");
};

module.exports = GameController;
},{"./../models/game-vm":10,"mithril":"mithril"}],4:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	introViewModel = require('./../models/intro-vm');

var IntroController = function(){
	this.VM = new introViewModel();
	this.VM.init();
};

/*
	Public Members
*/
IntroController.prototype.onBegin = function(){
	m.redraw();
};

IntroController.prototype.startGame = function(){
	m.route("/game");
};

module.exports = IntroController;
},{"./../models/intro-vm":11,"mithril":"mithril"}],5:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	loadingViewModel = require('./../models/loading-vm');

var LoadingController = function(){
	this.VM = new loadingViewModel();
	this.VM.init();
};

/*
	Public Members
*/
LoadingController.prototype.onloaded = function(){
	m.route("/intro");
};

module.exports = LoadingController;
},{"./../models/loading-vm":12,"mithril":"mithril"}],6:[function(require,module,exports){
/* global m */
'use strict';

var m = require('mithril'),
	resultViewModel = require('./../models/result-vm');

var ResultController = function(){
	this.VM = new resultViewModel();
	this.VM.init();
};

/*
	Public Members
*/


module.exports = ResultController;
},{"./../models/result-vm":13,"mithril":"mithril"}],7:[function(require,module,exports){
'use strict';

var m = require('mithril'),
	Velocity = require('velocity-animate'),
	v = require('velocity-animate/velocity.ui'),
	gameController = require('../controllers/game-controller'),
	gameView = require('../views/game-view'),
	resultController = require('../controllers/result-controller'),
	resultView = require('../views/result-view'),
	introController = require('../controllers/intro-controller'),
	introView = require('../views/intro-view'),
	loadingController = require('../controllers/loading-controller'),
	loadingView = require('../views/loading-view');

var application = function(){
	//initialize the application
	var app = {
		loading : { controller: loadingController, view: loadingView },
		intro   : { controller: introController,   view: introView },
		game	: { controller: gameController, view: gameView },
		result  : { controller: resultController, view: resultView },
	}

	m.route.mode = "hash";

	m.route(document.body, "/", {
	    ""		 : app.loading,
	    "/intro" : app.intro,
	    "/game"  : app.game,
	    "/result": app.result
	});
};

module.exports = application;
},{"../controllers/game-controller":3,"../controllers/intro-controller":4,"../controllers/loading-controller":5,"../controllers/result-controller":6,"../views/game-view":15,"../views/intro-view":16,"../views/loading-view":17,"../views/result-view":18,"mithril":"mithril","velocity-animate":"velocity-animate","velocity-animate/velocity.ui":2}],8:[function(require,module,exports){
'use strict';
/* Global module */

var _ = require('lodash'),
	m = require('mithril');


var _numberedString = function(target){
	var index = 0;
	return target.replace(/_(.*?)_/g, function (match, text, number) {
        var res = '{' + index + '}';
        index++
        return res;  
  	});
};

module.exports = {

	relativeTime : function(previous){
		var msPerMinute = 60 * 1000;
	    var msPerHour = msPerMinute * 60;
	    var msPerDay = msPerHour * 24;
	    var msPerMonth = msPerDay * 30;
	    var msPerYear = msPerDay * 365;

	    var elapsed = Date.now() - previous;

	    if (elapsed < msPerMinute) {
	         return Math.round(elapsed/1000) + ' seconds ago';
	    }
	    else if (elapsed < msPerHour) {
	         return Math.round(elapsed/msPerMinute) + ' minutes ago';
	    }
	    else if (elapsed < msPerDay ) {
	         return Math.round(elapsed/msPerHour ) + ' hours ago';
	    }
	    else if (elapsed < msPerMonth) {
	        return Math.round(elapsed/msPerDay) + ' days ago';   
	    }
	    else if (elapsed < msPerYear) {
	        return Math.round(elapsed/msPerMonth) + ' months ago';   
	    }
	    else {
	        return Math.round(elapsed/msPerYear ) + ' years ago';   
	    }
	},

	/*
		Replaces string with "_bold_ normal" text to mithril Array
	*/
	shorthandToMithrilArray : function(target){

		if(target.length === 0) return [];

		var keywordMembers = target.match(/_(.*?)_/g),
			numberDelimiteredString = _numberedString(target),
			targetArray = _.without(numberDelimiteredString.split(/{(\d+)}/), "");

		
		for (var i = 0, j = targetArray.length; i < j; i++) {
			var t = +targetArray[i];
			if(t >= 0) targetArray[i] = m('span', keywordMembers[t].replace(/_/g, ''));    this.guesses = m.prop(0);

		};

		return targetArray;

	}

};
},{"lodash":"lodash","mithril":"mithril"}],9:[function(require,module,exports){
'use strict';
/* Global module */
var m = require('mithril'),
	_ = require('lodash');

var CONST_KEY = 'show-star-beta';

/*
	You would obtain this by xhr
*/
var data = {
	title : "Show Star",
	description : "Can you match the actor to the show in time?",
	timer : 5,
	assets : [
		 { name : 'brand', image : 'http://img-a.zeebox.com/images/z/a5bf62ac-3e5f-46fa-9b59-59c09bc03d3e.png' },
		 { name : 'positive', image : 'http://img-a.zeebox.com/images/z/289e953b-a8b9-4e8b-89d5-1769e1fb168b.png' },
		 { name : 'moderate', image : 'http://img-a.zeebox.com/images/z/fffc4fe7-2e12-43c2-852c-d60c7d4fb5a2.png' },
		 { name : 'negative', image : 'http://img-a.zeebox.com/images/z/75fb3091-574c-4863-bf21-0ea1825c4853.png' },
		 { name : 'trophy', image : 'http://img-a.zeebox.com/images/z/9ecda2e2-6d09-48dd-a166-32ec232bdb8b.png' }
	],
	questions :[{
		question : "_Choose 3_ of the following appeared in the 90's sitcom _Friends_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/0e831e8c-8d60-43ea-ab7d-9bbfd4ffb3ad.png', name : 'Donald Glover', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/92e0b45b-404f-4417-8b06-88e1079baed7.png', name : 'Wayne Knight', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5d9c9fc8-606e-484a-b4fd-eb0e0bdc4497.png', name : 'Demi Moore', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/64b80a30-57a6-4928-a805-70bc38641018.png', name : 'Jessica Westfeldt', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/4bc0776e-1cf8-4b12-881b-f7154343dbe4.png', name : 'Jennifer Aniston', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : false }
		]
	},
	{
		question : "Going back a little further, _Choose 3_ who starred in the cult classic _Seinfeld_?",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/21d9a055-b1c6-4d4d-a4b6-51319fc65165.png', name : 'David Schwimmer', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b33cb262-e175-44f4-a58e-42523391fb5d.png', name : 'Matt Le Blanc', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/e77b6617-f543-46cb-b435-37b6b1a442d7.png', name : 'Courtney Cox-Arquette', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/92e0b45b-404f-4417-8b06-88e1079baed7.png', name : 'Wayne Knight', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : true }
		]
	},
	{
		question : "Now _Scrubs_ give me _3_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : 'Chevy Chase', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/ca511030-f77e-46df-a1a9-10586284a38b.png', name : 'Lisa Kudrow', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/ff99cefe-3c00-4785-bd5b-e4a76c66c91b.png', name : 'Sarah Chalke', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/93350291-30e2-4403-afbd-97309b354f59.png', name : 'TJ Miller', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/f0aa487c-4b2e-4735-b963-c745ee1f7125.png', name : 'Zach Woods', correct : false }
		]
	},
	{
		question : "Which of the following _3 Actors_ appeared in _Community_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/1b10f366-15a1-4c38-9ad6-42942a05c20a.png', name : 'Ryan Seacrest', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/63c31d8d-2554-4230-a006-1df7766060a7.png', name : 'Chevy Chase', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : 'Yvette Nicole Brown', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jeong', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/5296bcd0-6f6a-41c9-be27-b7a1e0bea458.png', name : 'Joel McHale', correct : true }
		]
	},
	{
		question : "Getting a little more modern, _Choose 5_ from HBO's _Silicon Valley_",
		answers  : [
			{ image : 'http://img-a.zeebox.com/images/z/f0aa487c-4b2e-4735-b963-c745ee1f7125.png', name : 'Zach Woods', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/989bbe49-753e-4234-885d-1929314a371e.png', name : 'Frank Abagnale jr', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/a6b28be6-d0f9-4de0-909f-50b021a6288a.png', name : 'Martin Starr', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/2948182b-fa75-43ff-961f-59e63605ae38.png', name : 'Kumail Nanjiani', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/cf3f7e17-b850-4a12-8da6-8cd5aad4a5ba.png', name : 'Alomoa Wright', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/fc2630dc-b37e-4203-99c5-0c8370af11ab.png', name : 'Ken Jeong', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/c7663601-3352-4c11-aad6-475d09684011.png', name : 'Zack Braff', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/93350291-30e2-4403-afbd-97309b354f59.png', name : 'TJ Miller', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/03376004-ed1c-4061-a541-80b18e66a45d.png', name : 'Thomas Middleditch', correct : true }
		]
	}
	],
	resultMessages : {
		20  : "Oh oh….think you need to spend some time on the couch this weekend, honing in on your TV skills!",
		40  : "Pretty good, although the pressure must have got the best of you…Try again!",
		60  : "Great effort! You’re nearly amazing…nearly….why don’t you ask the Home Of Comedy TV Room for some help? Click here or try your luck again and play again!",
		80  : "Amazing Stuff - you are at the top of the leaderboard! Near perfect! Be perfect…Play again!",
		100 : "Genius…..you know your TV. Let’s see how you go on Level 2"
	}
};


var _getMaxScore = function(){
	var score = 0;
	_.each(data.questions, function(q){
		score += _.filter(q.answers, { correct : true }).length;
	});
	return score;
};

var _hasLocalStorage = function(){
	var mod = 'xx';
	try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch(e) {
        return false;
    }
};

var _tryParse = function(target){
	var result = [];
	try {
		return JSON.parse(target) || result;
	} catch(e) {
		return result;
	}
};

var _getPreviousScores = function(){
	if(!_hasLocalStorage()) return [];
	return _tryParse(localStorage.getItem(CONST_KEY));
};

/*
	Constructor
*/
var GameModel = function(){
	this.score 		= m.prop(0);
	this.highScore  = m.prop(_getMaxScore());
	this.questions	= m.prop(data.questions);
	this.assets     = m.prop(data.assets);
	this.title		= m.prop(data.title);
	this.resultMessages = m.prop(data.resultMessages);
	this.description = m.prop(data.description);
	this.timer = m.prop(data.timer || 5);
	this.previousScores = m.prop(_getPreviousScores());
};

/*
	Public Members
*/

GameModel.prototype.saveScore = function(score){
	
	this.score(score);

	// Update previous scores setting the latest score as only one of that score
	var previousScores = this.previousScores(),
		newScore = { date : Date.now(), score : score };
	previousScores = _.without(previousScores, _.findWhere(previousScores, { score : score }));
	previousScores.push(newScore);
	this.previousScores(previousScores);

	// save in local storage where available
	if(! _hasLocalStorage()) return;
	localStorage.setItem(CONST_KEY, JSON.stringify(this.previousScores()));
};



module.exports = new GameModel();




},{"lodash":"lodash","mithril":"mithril"}],10:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    _ = require('lodash'),
    utils = require('./../libs/utils'),
    GameModel = require('./../models/game-model');

var Answer = function(d){
    this.image = m.prop(d.image);
    this.name = m.prop(d.name);
    this.selected = m.prop(false);
    this.correct = m.prop(d.correct);
    
    // view markers
    this.toggled = m.prop(false);
    this.toggleRejected = m.prop(false);
};

Answer.prototype.getScore = function(){
    var score = 0;
    if(this.selected() && this.correct()) score = 1;
    return score;
};

var Question = function(d){
    this.text = m.prop(d.question);
    this.questionElement = m.prop(utils.shorthandToMithrilArray(d.question));
    this.answers = m.prop(_.map(d.answers, function(a){
        return new Answer(a);
    }));
    this.guesses = m.prop(0);
    this.limit = m.prop(_.filter(d.answers, { correct : true }).length);
};

Question.prototype.guessLimitReached = function(){
    return this.guesses() === this.limit();
};

Question.prototype.countGuess = function(){
    this.guesses(_.filter(this.answers(), function(ans){
        return ans.selected();
    }).length);
};

var Timer = function(time){
    this.isActive = m.prop(false);
    this.time = m.prop(time * 1000);
};
    
/*
    Constructor
*/

var GameVM = function(){};


/*
    Private Members
*/

var _clearQuestion = function(){
    return new Question({ question : "", answers : [] });
};

// You can get negative scores!!
var _updateScore = function(){
    var currentScore = this.currentScore(),
        score = 0;

    _.each(this.question().answers(), function(ans){
        score += ans.getScore();
    });

    this.currentScore(currentScore + score);
};

var _setCurrentQuestion = function(){
    var q = new Question(this.questions()[this.currentQuestion()]);
    this.question(q);
};

var _nextQuestion = function(){
    var current = this.currentQuestion() + 1,
        isEnd = current === this.totalQuestions();

    this.gameOver(isEnd);
    if(! isEnd) {
        this.questionShown(false);
        this.currentQuestion(current);
        _setCurrentQuestion.call(this);
    }
};



/*
    Public Members
*/
GameVM.prototype.init = function(){
    var questions = GameModel.questions();
    this.currentQuestion = m.prop(0);
    this.currentScore = m.prop(0);
    this.timer = m.prop(null);
    this.questions = m.prop(questions);
    this.totalQuestions = m.prop(questions.length);
    this.gameOver = m.prop(false);
    this.question = m.prop(_clearQuestion());
    
    // View Queues 
    this.locked = m.prop(true);
    this.questionShown = m.prop(false);
    this.endQuestion = m.prop(false);
};

GameVM.prototype.startGame = function(){
    _setCurrentQuestion.call(this);
};

GameVM.prototype.stopQuestion = function(){
    this.endQuestion(false);
    _updateScore.call(this);
    this.question(_clearQuestion());
};

GameVM.prototype.nextQuestion = function(){
    _nextQuestion.call(this);
};

GameVM.prototype.updateScore = function(){
    GameModel.saveScore(this.currentScore());
};

GameVM.prototype.startQuestion = function(){
    this.timer(new Timer(GameModel.timer()));
    this.locked(false);
};

module.exports = GameVM;
},{"./../libs/utils":8,"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],11:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
    GameModel = require('./../models/game-model');

var IntroVM = function(){};

/*
    Public Members
*/
IntroVM.prototype.init = function(){
    this.title = m.prop(GameModel.title());
    this.description = m.prop(GameModel.description());
    this.begin = m.prop(false);
    this.brand = m.prop(_.findWhere(GameModel.assets(), { name : 'brand' }).image);
    this.begin = m.prop(false);
};

module.exports = IntroVM;
},{"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],12:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
    _  = require('lodash'),
    GameModel = require('./../models/game-model');

var LoadingVM = function(){};

/*
    Preload images
*/
var _preload = function(){
    var targets = this.targets(),
        targetCount = targets.length;

    var __onLoad = function(){
        var loaded = this.targetsLoaded() + 1;
        this.targetsLoaded(loaded);
        this.progress(Math.round((loaded / targetCount) * 100));
        this.loaded(this.progress() === 100);
        m.redraw();
    };

    for (var i = targetCount - 1; i >= 0; i--) {
        var image = new Image();
        image.onload = __onLoad.bind(this);
        image.src = targets[i];
    }
};

/*
    Public Members
*/
LoadingVM.prototype.init = function(){
    var questions = GameModel.questions(),
        assets = GameModel.assets(),
        entities = [];

    _.each(questions, function(q){
        entities = _.union(entities, _.pluck(q.answers, 'image'));
    });
    entities = _.union(entities, _.pluck(assets, 'image'));

    this.loaded = m.prop(false);
    this.progress = m.prop(0);
    this.targets = m.prop(entities);
    this.targetsLoaded = m.prop(0);
    _preload.call(this);
};

module.exports = LoadingVM;
},{"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],13:[function(require,module,exports){
'use strict';
/* Global module */

var m = require('mithril'),
	_ = require('lodash'),
	utils = require('./../libs/utils'),
    GameModel = require('./../models/game-model');

var ResultVM = function(){};

/*
	Private Memebers
*/

var _calcMessage = function(){
	var messages = this.resultMessages(),
		percentage = Math.round((this.score() / this.highScore()) * 100),
		result = messages[20];

	for(var res in messages) {
		if(percentage >= res) result = messages[res];
		else break;
	}

	return result;
};

var _calcTopFive = function(previousScores, currentScore){

	// get friendly Time
	_.each(previousScores, function(score){
		score.friendlyTime = utils.relativeTime(score.date);
		score.isCurrent = +score.score === +currentScore;
	});

	if(previousScores.length <= 1) return previousScores;

    previousScores = _.sortBy(previousScores, function(s){
        return -s.score;
    });
    
    return previousScores.slice(0,5);
};

var _getPerformanceAdj = function(){
	var target = '',
		index = _.findIndex(this.scoreBoard(), function(score){
		return score.isCurrent;
	});

	switch(index){
		case 0:
			target = 'trophy';
			break;
		case 1:
		case 2:
			target = 'positive';
			break;
		case 3:
		case 4:
			target = 'moderate';
			break;
		default:
			target = 'negative';
	}

	return target;
};

var _getResultImage = function(){
	return _.findWhere(this.assets(), { name : this.performanceAdj() }).image;
};

/*
    Public Members
*/
ResultVM.prototype.init = function(){
    this.score = m.prop(GameModel.score());
    this.highScore = m.prop(GameModel.highScore());
    this.resultMessages = m.prop(GameModel.resultMessages());
    this.assets = m.prop(GameModel.assets());
    
    // Derivative Data
	this.scoreBoard = m.prop(_calcTopFive(GameModel.previousScores(), this.score()));
    this.message = m.prop(_calcMessage.call(this));
    this.performanceAdj = m.prop(_getPerformanceAdj.call(this));
    this.resultImage = m.prop(_getResultImage.call(this));
};

module.exports = ResultVM;
},{"./../libs/utils":8,"./../models/game-model":9,"lodash":"lodash","mithril":"mithril"}],14:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var View = function(ctrl, answer){

    var animIn = function(el, isInitialized, context) {
        if (answer.toggled()) {
            Velocity(el, 'callout.pulse', { duration : 400 }).then(function(){
                el.classList.toggle('selected');
            });
            answer.toggled(false);
        } 
        else if(answer.toggleRejected()){
            Velocity(el, 'callout.shake', { duration : 400 });
            answer.toggleRejected(false);
        }
        else if(!isInitialized){
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.toggle.bind(ctrl, answer));
        }
    };

    return m("li.answer.opaque", {
        config : animIn,
        class : !answer.correct() ? 'js_falsy' : '',
        style : { backgroundImage : "url(" + answer.image() + ")" }
    }, [
        m("h4.name", answer.name())
    ]);
};

module.exports = View;
},{"hammerjs":"hammerjs","mithril":"mithril","velocity-animate":"velocity-animate"}],15:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    answerView = require('./answer-view'),
    timerView = require('./timer-view'),
    Velocity = require('velocity-animate');


var renderGamePage = function(ctrl, el){
    document.body.className = 'game';
    Velocity(el.children[0], { translateY : '+=170px' }, { duration : 500, delay : 300, easing : [ 250, 0 ] }).then(function(){
        ctrl.ready();
    });
};

var renderOut = function(ctrl, el){
    Velocity(el.children[0], 'reverse').then(ctrl.endGame.bind(ctrl));
};

var renderQuestionUp = function(ctrl, el){
    var target = document.getElementsByClassName('question-number'),
    limit = document.getElementsByClassName('limit'),
    question = document.getElementsByClassName('current-question');

    var sequence = [
        { e : target, p : { left : '50px', top : '20px', fontSize : '0.9rem' } },
        { e : question,  p : 'transition.slideUpIn' },
        { e : limit, p : 'transition.bounceIn', o : { complete : ctrl.startQuestion.bind(ctrl) } }
    ];

    Velocity.RunSequence(sequence);
};

var renderAnswersOut = function(ctrl, el){
    // Velocity
    var targets = document.getElementsByClassName('answer'),
        falseAnswers = document.getElementsByClassName('js_falsy'),
        limit = document.getElementsByClassName('limit'),
        questionNumber = document.getElementsByClassName('question-number'),
        question = document.getElementsByClassName('current-question');

    var sequence = [
        { e : falseAnswers, p : { opacity : 0.3 }, o : { duration : 500 } },
        { e : targets, p : 'transition.bounceOut', o : { duration : 500, delay : 1500 } },
        { e : question, p : 'transition.slideUpOut', o : { duration : 500 } },
        { e : limit, p : 'fadeOut', o : { duration : 200 , complete : ctrl.afterEndQuestion.bind(ctrl) } }
    ];

    Velocity.RunSequence(sequence);
};

var renderStartQuestion = function(ctrl, el){
    // Show the questions
    el.children[0].classList.add('begin');

    // get answers and remove weird init style
    var answers = document.getElementsByClassName('answers-area')[0];
    answers.style.opacity = 1;
    answers.style.display = 'block';
    
    // Show the answers
    var ul = answers.children[0],
        questionNumber = document.getElementsByClassName('question-number'),
        sequence = [
            { e : ul.children, p : 'transition.bounceIn', o : { stagger : '200ms', complete : renderQuestionUp.bind(this, ctrl, el) } }
        ];

    if(ctrl.VM.currentQuestion() > 0) sequence.unshift({ e : questionNumber, p : 'reverse' });
    Velocity.RunSequence(sequence);
    ctrl.VM.questionShown(true);
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
            renderStartQuestion(ctrl, el);
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
},{"./answer-view":14,"./timer-view":19,"mithril":"mithril","velocity-animate":"velocity-animate"}],16:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    _ = require('lodash'),
    Hammer = require('hammerjs'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        var sequence = [
            { e : el.children[0], p : 'transition.slideUpIn', o : { duration : 300, delay : 300, opacity : 0 } },
            { e : el.children[1], p : 'transition.slideUpIn', o : { duration : 300 } },
            { e : el.children[2], p : 'transition.bounceIn',  o : { duration : 300 } },
            { e : el.children[3], p : { opacity : 1, rotateZ : '-25', right : -50 }, o : { duration : 500, easing : [ 250, 15 ] } }
        ];

        if (!isInitialized) {
            document.body.className = 'intro';
            Velocity.RunSequence(sequence);
        } else {
            Velocity(el.children, 'transition.fadeOut', { stagger : '100ms' }).then(ctrl.startGame);
        }
    };

    var events = function(el, isInitialized){
        if(!isInitialized) {
            var hammertime = new Hammer(el);
            hammertime.on('tap', ctrl.onBegin);
        }
    };

    return m('#intro-page', [
        m('.intro-holder', {
            config : animIn
        },[
            m('h2.opaque', ctrl.VM.title()),
            m('.description.opaque', ctrl.VM.description()),
            m('a.begin.opaque', { config: events }, 'begin'),
            m('.brand.opaque.out-right-far', { style : { backgroundImage : 'url({0})'.replace('{0}', ctrl.VM.brand()) } })
        ])
    ]);
};

module.exports = Loading;
},{"hammerjs":"hammerjs","lodash":"lodash","mithril":"mithril","velocity-animate":"velocity-animate"}],17:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var Loading = function(ctrl){

    var animIn = function(el, isInitialized, context) {
        if (!isInitialized) {
            Velocity(el, { translateX : '+=100%' }, { delay : 200, duration : 300, easing : 'ease' });
        } else {
            if(ctrl.VM.loaded()) Velocity(el, "reverse").then(ctrl.onloaded);
        }
    };

    return m('#loading-page', [
        m('.message-holder.out-left-full', {
            config : animIn
        },[
            m('h3', 'Loading ' + ctrl.VM.progress() + '%')
        ])
    ]);
};

module.exports = Loading;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],18:[function(require,module,exports){
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
            { e : result.children, p : 'transition.expandOut', o : { delay : 1500 } },
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
            m('p.move-on.opaque', 'You scored ' + ctrl.VM.score() + 'pts, Get above 10 pts to move onto Level 2. Well you would if there was a level 2, but there could be....'),
            m('a.btn.replay.opaque[href="#/game"]', 'Try Again'),
            m('a.btn.level2.opaque', 'Level 2')
        ])
    ]);
};

module.exports = View;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}],19:[function(require,module,exports){
/* Global module */
'use strict';

var m = require('mithril'),
    Velocity = require('velocity-animate');

var View = function(ctrl, timer){

    var animIn = function(el, isInitialized, context) {
        if(!timer) return;
        if(!timer.isActive()){
            Velocity(el, { width : '100%' }, { duration : timer.time(), easing : 'linear' }).then(function(){
                ctrl.onTime();
                Velocity(el, { width : 0 },  { duration : 200 });
            });
            timer.isActive(true);
        }
    };

    return m(".timer", {
        config : animIn
    });
};

module.exports = View;
},{"mithril":"mithril","velocity-animate":"velocity-animate"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvcmVzdWx0LWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9saWJzL2FwcC5qcyIsInNyYy9zY3JpcHRzL2xpYnMvdXRpbHMuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvcmVzdWx0LXZtLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvYW5zd2VyLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9nYW1lLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9pbnRyby12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbG9hZGluZy12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvcmVzdWx0LXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSByZXF1aXJlKCcuL2xpYnMvYXBwLmpzJyk7XG5cbndpbmRvdy53aWRnZXRWZXJzaW9uID0gXCJ2MC4wLjBcIjtcblxudmFyIGluaXRBcHAgPSBmdW5jdGlvbihwYXJhbXMpe1xuXHR2YXIgaW5zdGFuY2UgPSBuZXcgQXBwKCk7XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbihldmVudCl7XG4gICAvL2RvIHdvcmtcbiAgIGluaXRBcHAoKTtcbn0pO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKipcbiAgIFZlbG9jaXR5IFVJIFBhY2tcbioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qIFZlbG9jaXR5SlMub3JnIFVJIFBhY2sgKDUuMC40KS4gKEMpIDIwMTQgSnVsaWFuIFNoYXBpcm8uIE1JVCBAbGljZW5zZTogZW4ud2lraXBlZGlhLm9yZy93aWtpL01JVF9MaWNlbnNlLiBQb3J0aW9ucyBjb3B5cmlnaHQgRGFuaWVsIEVkZW4sIENocmlzdGlhbiBQdWNjaS4gKi9cblxuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIC8qIENvbW1vbkpTIG1vZHVsZS4gKi9cbiAgICBpZiAodHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgLyogQU1EIG1vZHVsZS4gKi9cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbIFwidmVsb2NpdHlcIiBdLCBmYWN0b3J5KTtcbiAgICAvKiBCcm93c2VyIGdsb2JhbHMuICovXG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeSgpO1xuICAgIH1cbn0oZnVuY3Rpb24oKSB7XG5yZXR1cm4gZnVuY3Rpb24gKGdsb2JhbCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvKioqKioqKioqKioqKlxuICAgICAgICBDaGVja3NcbiAgICAqKioqKioqKioqKioqL1xuXG4gICAgaWYgKCFnbG9iYWwuVmVsb2NpdHkgfHwgIWdsb2JhbC5WZWxvY2l0eS5VdGlsaXRpZXMpIHtcbiAgICAgICAgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2coXCJWZWxvY2l0eSBVSSBQYWNrOiBWZWxvY2l0eSBtdXN0IGJlIGxvYWRlZCBmaXJzdC4gQWJvcnRpbmcuXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIFZlbG9jaXR5ID0gZ2xvYmFsLlZlbG9jaXR5LFxuICAgICAgICAgICAgJCA9IFZlbG9jaXR5LlV0aWxpdGllcztcbiAgICB9XG5cbiAgICB2YXIgdmVsb2NpdHlWZXJzaW9uID0gVmVsb2NpdHkudmVyc2lvbixcbiAgICAgICAgcmVxdWlyZWRWZXJzaW9uID0geyBtYWpvcjogMSwgbWlub3I6IDEsIHBhdGNoOiAwIH07XG5cbiAgICBmdW5jdGlvbiBncmVhdGVyU2VtdmVyIChwcmltYXJ5LCBzZWNvbmRhcnkpIHtcbiAgICAgICAgdmFyIHZlcnNpb25JbnRzID0gW107XG5cbiAgICAgICAgaWYgKCFwcmltYXJ5IHx8ICFzZWNvbmRhcnkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgJC5lYWNoKFsgcHJpbWFyeSwgc2Vjb25kYXJ5IF0sIGZ1bmN0aW9uKGksIHZlcnNpb25PYmplY3QpIHtcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uSW50c0NvbXBvbmVudHMgPSBbXTtcblxuICAgICAgICAgICAgJC5lYWNoKHZlcnNpb25PYmplY3QsIGZ1bmN0aW9uKGNvbXBvbmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAodmFsdWUudG9TdHJpbmcoKS5sZW5ndGggPCA1KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gXCIwXCIgKyB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmVyc2lvbkludHNDb21wb25lbnRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZlcnNpb25JbnRzLnB1c2godmVyc2lvbkludHNDb21wb25lbnRzLmpvaW4oXCJcIikpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAocGFyc2VGbG9hdCh2ZXJzaW9uSW50c1swXSkgPiBwYXJzZUZsb2F0KHZlcnNpb25JbnRzWzFdKSk7XG4gICAgfVxuXG4gICAgaWYgKGdyZWF0ZXJTZW12ZXIocmVxdWlyZWRWZXJzaW9uLCB2ZWxvY2l0eVZlcnNpb24pKXtcbiAgICAgICAgdmFyIGFib3J0RXJyb3IgPSBcIlZlbG9jaXR5IFVJIFBhY2s6IFlvdSBuZWVkIHRvIHVwZGF0ZSBWZWxvY2l0eSAoanF1ZXJ5LnZlbG9jaXR5LmpzKSB0byBhIG5ld2VyIHZlcnNpb24uIFZpc2l0IGh0dHA6Ly9naXRodWIuY29tL2p1bGlhbnNoYXBpcm8vdmVsb2NpdHkuXCI7XG4gICAgICAgIGFsZXJ0KGFib3J0RXJyb3IpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYWJvcnRFcnJvcik7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIEVmZmVjdCBSZWdpc3RyYXRpb25cbiAgICAqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBOb3RlOiBSZWdpc3RlclVJIGlzIGEgbGVnYWN5IG5hbWUuICovXG4gICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QgPSBWZWxvY2l0eS5SZWdpc3RlclVJID0gZnVuY3Rpb24gKGVmZmVjdE5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgLyogQW5pbWF0ZSB0aGUgZXhwYW5zaW9uL2NvbnRyYWN0aW9uIG9mIHRoZSBlbGVtZW50cycgcGFyZW50J3MgaGVpZ2h0IGZvciBJbi9PdXQgZWZmZWN0cy4gKi9cbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0ZVBhcmVudEhlaWdodCAoZWxlbWVudHMsIGRpcmVjdGlvbiwgdG90YWxEdXJhdGlvbiwgc3RhZ2dlcikge1xuICAgICAgICAgICAgdmFyIHRvdGFsSGVpZ2h0RGVsdGEgPSAwLFxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgIC8qIFN1bSB0aGUgdG90YWwgaGVpZ2h0IChpbmNsdWRpbmcgcGFkZGluZyBhbmQgbWFyZ2luKSBvZiBhbGwgdGFyZ2V0ZWQgZWxlbWVudHMuICovXG4gICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIEluY3JlYXNlIHRoZSB0b3RhbER1cmF0aW9uIGJ5IHRoZSBzdWNjZXNzaXZlIGRlbGF5IGFtb3VudHMgcHJvZHVjZWQgYnkgdGhlIHN0YWdnZXIgb3B0aW9uLiAqL1xuICAgICAgICAgICAgICAgICAgICB0b3RhbER1cmF0aW9uICs9IGkgKiBzdGFnZ2VyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE5vZGUgPSBlbGVtZW50LnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICAkLmVhY2goWyBcImhlaWdodFwiLCBcInBhZGRpbmdUb3BcIiwgXCJwYWRkaW5nQm90dG9tXCIsIFwibWFyZ2luVG9wXCIsIFwibWFyZ2luQm90dG9tXCJdLCBmdW5jdGlvbihpLCBwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEhlaWdodERlbHRhICs9IHBhcnNlRmxvYXQoVmVsb2NpdHkuQ1NTLmdldFByb3BlcnR5VmFsdWUoZWxlbWVudCwgcHJvcGVydHkpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKiBBbmltYXRlIHRoZSBwYXJlbnQgZWxlbWVudCdzIGhlaWdodCBhZGp1c3RtZW50ICh3aXRoIGEgdmFyeWluZyBkdXJhdGlvbiBtdWx0aXBsaWVyIGZvciBhZXN0aGV0aWMgYmVuZWZpdHMpLiAqL1xuICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlLFxuICAgICAgICAgICAgICAgIHsgaGVpZ2h0OiAoZGlyZWN0aW9uID09PSBcIkluXCIgPyBcIitcIiA6IFwiLVwiKSArIFwiPVwiICsgdG90YWxIZWlnaHREZWx0YSB9LFxuICAgICAgICAgICAgICAgIHsgcXVldWU6IGZhbHNlLCBlYXNpbmc6IFwiZWFzZS1pbi1vdXRcIiwgZHVyYXRpb246IHRvdGFsRHVyYXRpb24gKiAoZGlyZWN0aW9uID09PSBcIkluXCIgPyAwLjYgOiAxKSB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogUmVnaXN0ZXIgYSBjdXN0b20gcmVkaXJlY3QgZm9yIGVhY2ggZWZmZWN0LiAqL1xuICAgICAgICBWZWxvY2l0eS5SZWRpcmVjdHNbZWZmZWN0TmFtZV0gPSBmdW5jdGlvbiAoZWxlbWVudCwgcmVkaXJlY3RPcHRpb25zLCBlbGVtZW50c0luZGV4LCBlbGVtZW50c1NpemUsIGVsZW1lbnRzLCBwcm9taXNlRGF0YSkge1xuICAgICAgICAgICAgdmFyIGZpbmFsRWxlbWVudCA9IChlbGVtZW50c0luZGV4ID09PSBlbGVtZW50c1NpemUgLSAxKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPSBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbi5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID0gcGFyc2VGbG9hdChwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIGVmZmVjdCdzIGNhbGwgYXJyYXkuICovXG4gICAgICAgICAgICBmb3IgKHZhciBjYWxsSW5kZXggPSAwOyBjYWxsSW5kZXggPCBwcm9wZXJ0aWVzLmNhbGxzLmxlbmd0aDsgY2FsbEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FsbCA9IHByb3BlcnRpZXMuY2FsbHNbY2FsbEluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlNYXAgPSBjYWxsWzBdLFxuICAgICAgICAgICAgICAgICAgICByZWRpcmVjdER1cmF0aW9uID0gKHJlZGlyZWN0T3B0aW9ucy5kdXJhdGlvbiB8fCBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiB8fCAxMDAwKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb25QZXJjZW50YWdlID0gY2FsbFsxXSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbE9wdGlvbnMgPSBjYWxsWzJdIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICBvcHRzID0ge307XG5cbiAgICAgICAgICAgICAgICAvKiBBc3NpZ24gdGhlIHdoaXRlbGlzdGVkIHBlci1jYWxsIG9wdGlvbnMuICovXG4gICAgICAgICAgICAgICAgb3B0cy5kdXJhdGlvbiA9IHJlZGlyZWN0RHVyYXRpb24gKiAoZHVyYXRpb25QZXJjZW50YWdlIHx8IDEpO1xuICAgICAgICAgICAgICAgIG9wdHMucXVldWUgPSByZWRpcmVjdE9wdGlvbnMucXVldWUgfHwgXCJcIjtcbiAgICAgICAgICAgICAgICBvcHRzLmVhc2luZyA9IGNhbGxPcHRpb25zLmVhc2luZyB8fCBcImVhc2VcIjtcbiAgICAgICAgICAgICAgICBvcHRzLmRlbGF5ID0gcGFyc2VGbG9hdChjYWxsT3B0aW9ucy5kZWxheSkgfHwgMDtcbiAgICAgICAgICAgICAgICBvcHRzLl9jYWNoZVZhbHVlcyA9IGNhbGxPcHRpb25zLl9jYWNoZVZhbHVlcyB8fCB0cnVlO1xuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBwcm9jZXNzaW5nIGZvciB0aGUgZmlyc3QgZWZmZWN0IGNhbGwuICovXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvKiBJZiBhIGRlbGF5IHdhcyBwYXNzZWQgaW50byB0aGUgcmVkaXJlY3QsIGNvbWJpbmUgaXQgd2l0aCB0aGUgZmlyc3QgY2FsbCdzIGRlbGF5LiAqL1xuICAgICAgICAgICAgICAgICAgICBvcHRzLmRlbGF5ICs9IChwYXJzZUZsb2F0KHJlZGlyZWN0T3B0aW9ucy5kZWxheSkgfHwgMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnRzSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuYmVnaW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgYSBiZWdpbiBjYWxsYmFjayBvbiB0aGUgZmlyc3QgZWZmZWN0IGNhbGwgd2l0aCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgc2V0LiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0T3B0aW9ucy5iZWdpbiAmJiByZWRpcmVjdE9wdGlvbnMuYmVnaW4uY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGVmZmVjdE5hbWUubWF0Y2goLyhJbnxPdXQpJC8pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogTWFrZSBcImluXCIgdHJhbnNpdGlvbmluZyBlbGVtZW50cyBpbnZpc2libGUgaW1tZWRpYXRlbHkgc28gdGhhdCB0aGVyZSdzIG5vIEZPVUMgYmV0d2VlbiBub3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmQgdGhlIGZpcnN0IFJBRiB0aWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgoZGlyZWN0aW9uICYmIGRpcmVjdGlvblswXSA9PT0gXCJJblwiKSAmJiBwcm9wZXJ0eU1hcC5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LkNTUy5zZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIFwib3BhY2l0eVwiLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIGFuaW1hdGVQYXJlbnRIZWlnaHQoKSBpZiB3ZSdyZSB1c2luZyBhbiBJbi9PdXQgdHJhbnNpdGlvbi4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmFuaW1hdGVQYXJlbnRIZWlnaHQgJiYgZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVQYXJlbnRIZWlnaHQoZWxlbWVudHMsIGRpcmVjdGlvblswXSwgcmVkaXJlY3REdXJhdGlvbiArIG9wdHMuZGVsYXksIHJlZGlyZWN0T3B0aW9ucy5zdGFnZ2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKiBJZiB0aGUgdXNlciBpc24ndCBvdmVycmlkaW5nIHRoZSBkaXNwbGF5IG9wdGlvbiwgZGVmYXVsdCB0byBcImF1dG9cIiBmb3IgXCJJblwiLXN1ZmZpeGVkIHRyYW5zaXRpb25zLiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gdW5kZWZpbmVkICYmIHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSBcIm5vbmVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuZGlzcGxheSA9IHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgvSW4kLy50ZXN0KGVmZmVjdE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogSW5saW5lIGVsZW1lbnRzIGNhbm5vdCBiZSBzdWJqZWN0ZWQgdG8gdHJhbnNmb3Jtcywgc28gd2Ugc3dpdGNoIHRoZW0gdG8gaW5saW5lLWJsb2NrLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWZhdWx0RGlzcGxheSA9IFZlbG9jaXR5LkNTUy5WYWx1ZXMuZ2V0RGlzcGxheVR5cGUoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5kaXNwbGF5ID0gKGRlZmF1bHREaXNwbGF5ID09PSBcImlubGluZVwiKSA/IFwiaW5saW5lLWJsb2NrXCIgOiBkZWZhdWx0RGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSAmJiByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eSAhPT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy52aXNpYmlsaXR5ID0gcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKiBTcGVjaWFsIHByb2Nlc3NpbmcgZm9yIHRoZSBsYXN0IGVmZmVjdCBjYWxsLiAqL1xuICAgICAgICAgICAgICAgIGlmIChjYWxsSW5kZXggPT09IHByb3BlcnRpZXMuY2FsbHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvKiBBcHBlbmQgcHJvbWlzZSByZXNvbHZpbmcgb250byB0aGUgdXNlcidzIHJlZGlyZWN0IGNhbGxiYWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBpbmplY3RGaW5hbENhbGxiYWNrcyAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ID09PSB1bmRlZmluZWQgfHwgcmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgPT09IFwibm9uZVwiKSAmJiAvT3V0JC8udGVzdChlZmZlY3ROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5LkNTUy5zZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0T3B0aW9ucy5jb21wbGV0ZSAmJiByZWRpcmVjdE9wdGlvbnMuY29tcGxldGUuY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlRGF0YS5yZXNvbHZlcihlbGVtZW50cyB8fCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9wdHMuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgcmVzZXRQcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzLnJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNldFZhbHVlID0gcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBGb3JtYXQgZWFjaCBub24tYXJyYXkgdmFsdWUgaW4gdGhlIHJlc2V0IHByb3BlcnR5IG1hcCB0byBbIHZhbHVlLCB2YWx1ZSBdIHNvIHRoYXQgY2hhbmdlcyBhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbW1lZGlhdGVseSBhbmQgRE9NIHF1ZXJ5aW5nIGlzIGF2b2lkZWQgKHZpYSBmb3JjZWZlZWRpbmcpLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBOb3RlOiBEb24ndCBmb3JjZWZlZWQgaG9va3MsIG90aGVyd2lzZSB0aGVpciBob29rIHJvb3RzIHdpbGwgYmUgZGVmYXVsdGVkIHRvIHRoZWlyIG51bGwgdmFsdWVzLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVmVsb2NpdHkuQ1NTLkhvb2tzLnJlZ2lzdGVyZWRbcmVzZXRQcm9wZXJ0eV0gPT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIHJlc2V0VmFsdWUgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHJlc2V0VmFsdWUgPT09IFwibnVtYmVyXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldID0gWyBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldLCBwcm9wZXJ0aWVzLnJlc2V0W3Jlc2V0UHJvcGVydHldIF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTbyB0aGF0IHRoZSByZXNldCB2YWx1ZXMgYXJlIGFwcGxpZWQgaW5zdGFudGx5IHVwb24gdGhlIG5leHQgckFGIHRpY2ssIHVzZSBhIHplcm8gZHVyYXRpb24gYW5kIHBhcmFsbGVsIHF1ZXVlaW5nLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXNldE9wdGlvbnMgPSB7IGR1cmF0aW9uOiAwLCBxdWV1ZTogZmFsc2UgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIFNpbmNlIHRoZSByZXNldCBvcHRpb24gdXNlcyB1cCB0aGUgY29tcGxldGUgY2FsbGJhY2ssIHdlIHRyaWdnZXIgdGhlIHVzZXIncyBjb21wbGV0ZSBjYWxsYmFjayBhdCB0aGUgZW5kIG9mIG91cnMuICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNldE9wdGlvbnMuY29tcGxldGUgPSBpbmplY3RGaW5hbENhbGxiYWNrcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5hbmltYXRlKGVsZW1lbnQsIHByb3BlcnRpZXMucmVzZXQsIHJlc2V0T3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBPbmx5IHRyaWdnZXIgdGhlIHVzZXIncyBjb21wbGV0ZSBjYWxsYmFjayBvbiB0aGUgbGFzdCBlZmZlY3QgY2FsbCB3aXRoIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIHNldC4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmluYWxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0RmluYWxDYWxsYmFja3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgPT09IFwiaGlkZGVuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMudmlzaWJpbGl0eSA9IHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShlbGVtZW50LCBwcm9wZXJ0eU1hcCwgb3B0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLyogUmV0dXJuIHRoZSBWZWxvY2l0eSBvYmplY3Qgc28gdGhhdCBSZWdpc3RlclVJIGNhbGxzIGNhbiBiZSBjaGFpbmVkLiAqL1xuICAgICAgICByZXR1cm4gVmVsb2NpdHk7XG4gICAgfTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBQYWNrYWdlZCBFZmZlY3RzXG4gICAgKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogRXh0ZXJuYWxpemUgdGhlIHBhY2thZ2VkRWZmZWN0cyBkYXRhIHNvIHRoYXQgdGhleSBjYW4gb3B0aW9uYWxseSBiZSBtb2RpZmllZCBhbmQgcmUtcmVnaXN0ZXJlZC4gKi9cbiAgICAvKiBTdXBwb3J0OiA8PUlFODogQ2FsbG91dHMgd2lsbCBoYXZlIG5vIGVmZmVjdCwgYW5kIHRyYW5zaXRpb25zIHdpbGwgc2ltcGx5IGZhZGUgaW4vb3V0LiBJRTkvQW5kcm9pZCAyLjM6IE1vc3QgZWZmZWN0cyBhcmUgZnVsbHkgc3VwcG9ydGVkLCB0aGUgcmVzdCBmYWRlIGluL291dC4gQWxsIG90aGVyIGJyb3dzZXJzOiBmdWxsIHN1cHBvcnQuICovXG4gICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzID1cbiAgICAgICAge1xuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5ib3VuY2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMzAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTE1IH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnNoYWtlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTExIH0sIDAuMTI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMTI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5mbGFzaFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVhZFwiLCAxIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQucHVsc2VcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODI1LFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEgfSwgMC41MCwgeyBlYXNpbmc6IFwiZWFzZUluRXhwb1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnN3aW5nXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogMTUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogLTUgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgcm90YXRlWjogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC50YWRhXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45LCBzY2FsZVk6IDAuOSwgcm90YXRlWjogLTMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCByb3RhdGVaOiAzIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgcm90YXRlWjogLTMgfSwgMC4xMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIFwicmV2ZXJzZVwiLCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHJvdGF0ZVo6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mYWRlSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZhZGVPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDcwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVk6IFsgMCwgLTU1IF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVZOiA1NSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBZSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWDogWyAwLCAtNDUgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBZT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVg6IDI1IH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VYSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuNzI1LCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVk6IFsgLTEwLCA5MCBdIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAuODAsIHJvdGF0ZVk6IDEwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDEsIHJvdGF0ZVk6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVhPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuOSwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVZOiAtMTAgfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMCwgcm90YXRlWTogOTAgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVlJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC43MjUsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWDogWyAtMTAsIDkwIF0gfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMC44MCwgcm90YXRlWDogMTAgfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMSwgcm90YXRlWDogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMC45LCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVg6IC0xNSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLCByb3RhdGVYOiA5MCB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zd29vcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgc2NhbGVYOiBbIDEsIDAgXSwgc2NhbGVZOiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtNzAwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zd29vcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHNjYWxlWDogMCwgc2NhbGVZOiAwLCB0cmFuc2xhdGVYOiAtNzAwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zLiAoRmFkZXMgYW5kIHNjYWxlcyBvbmx5LikgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi53aGlybEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiBbIDEsIDAgXSwgc2NhbGVZOiBbIDEsIDAgXSwgcm90YXRlWTogWyAwLCAxNjAgXSB9LCAxLCB7IGVhc2luZzogXCJlYXNlSW5PdXRTaW5lXCIgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zLiAoRmFkZXMgYW5kIHNjYWxlcyBvbmx5LikgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi53aGlybE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5PdXRRdWludFwiLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAwLCBzY2FsZVk6IDAsIHJvdGF0ZVk6IDE2MCB9LCAxLCB7IGVhc2luZzogXCJzd2luZ1wiIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zaHJpbmtJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAxLjUgXSwgc2NhbGVZOiBbIDEsIDEuNSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2hyaW5rT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDYwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgc2NhbGVYOiAxLjMsIHNjYWxlWTogMS4zLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5leHBhbmRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAwLjYyNSBdLCBzY2FsZVk6IFsgMSwgMC42MjUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmV4cGFuZE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMC41LCBzY2FsZVk6IDAuNSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHNjYWxlWDogWyAxLjA1LCAwLjMgXSwgc2NhbGVZOiBbIDEuMDUsIDAuMyBdIH0sIDAuNDAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMC45LCBzY2FsZVk6IDAuOSwgdHJhbnNsYXRlWjogMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOTUsIHNjYWxlWTogMC45NSB9LCAwLjM1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHRyYW5zbGF0ZVo6IDAgfSwgMC4zNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHNjYWxlWDogMC4zLCBzY2FsZVk6IDAuMyB9LCAwLjMwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAtMzAsIDEwMDAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMjAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVZOiAtMTAwMCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMzAsIC0xMDAwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMTAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjIwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0yMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVk6IDEwMDAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDMwLCAtMTI1MCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDMwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWDogLTEyNTAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVJpZ2h0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAtMzAsIDEyNTAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAtMzAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVYOiAxMjUwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIDIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IC0yMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDAsIC0yMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVk6IDIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC0yMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwNTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAtMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIDIwIF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwNTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAyMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwQmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCA3NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAtNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duQmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAtNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiA3NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVYOiBbIDAsIC03NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0QmlnT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zbGF0ZVg6IC03NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVJpZ2h0QmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCA3NSBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiA3NSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlVXBJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgcm90YXRlWDogWyAwLCAtMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlVXBPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHJvdGF0ZVg6IC0xODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlRG93bkluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWDogWyAwLCAxODAgXSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVEb3duT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWDogMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogWyAwLCAtMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogLTE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IFsgMCwgMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlUmlnaHRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIDAsIDAgXSwgcm90YXRlWTogMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLyogUmVnaXN0ZXIgdGhlIHBhY2thZ2VkIGVmZmVjdHMuICovXG4gICAgZm9yICh2YXIgZWZmZWN0TmFtZSBpbiBWZWxvY2l0eS5SZWdpc3RlckVmZmVjdC5wYWNrYWdlZEVmZmVjdHMpIHtcbiAgICAgICAgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QoZWZmZWN0TmFtZSwgVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzW2VmZmVjdE5hbWVdKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgU2VxdWVuY2UgUnVubmluZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICAvKiBOb3RlOiBTZXF1ZW5jZSBjYWxscyBtdXN0IHVzZSBWZWxvY2l0eSdzIHNpbmdsZS1vYmplY3QgYXJndW1lbnRzIHN5bnRheC4gKi9cbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZSA9IGZ1bmN0aW9uIChvcmlnaW5hbFNlcXVlbmNlKSB7XG4gICAgICAgIHZhciBzZXF1ZW5jZSA9ICQuZXh0ZW5kKHRydWUsIFtdLCBvcmlnaW5hbFNlcXVlbmNlKTtcblxuICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgJC5lYWNoKHNlcXVlbmNlLnJldmVyc2UoKSwgZnVuY3Rpb24oaSwgY3VycmVudENhbGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dENhbGwgPSBzZXF1ZW5jZVtpICsgMV07XG5cbiAgICAgICAgICAgICAgICBpZiAobmV4dENhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogUGFyYWxsZWwgc2VxdWVuY2UgY2FsbHMgKGluZGljYXRlZCB2aWEgc2VxdWVuY2VRdWV1ZTpmYWxzZSkgYXJlIHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgcHJldmlvdXMgY2FsbCdzIGJlZ2luIGNhbGxiYWNrLiBPdGhlcndpc2UsIGNoYWluZWQgY2FsbHMgYXJlIG5vcm1hbGx5IHRyaWdnZXJlZFxuICAgICAgICAgICAgICAgICAgICAgICBpbiB0aGUgcHJldmlvdXMgY2FsbCdzIGNvbXBsZXRlIGNhbGxiYWNrLiAqL1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3VycmVudENhbGxPcHRpb25zID0gY3VycmVudENhbGwubyB8fCBjdXJyZW50Q2FsbC5vcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGxPcHRpb25zID0gbmV4dENhbGwubyB8fCBuZXh0Q2FsbC5vcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1pbmcgPSAoY3VycmVudENhbGxPcHRpb25zICYmIGN1cnJlbnRDYWxsT3B0aW9ucy5zZXF1ZW5jZVF1ZXVlID09PSBmYWxzZSkgPyBcImJlZ2luXCIgOiBcImNvbXBsZXRlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFja09yaWdpbmFsID0gbmV4dENhbGxPcHRpb25zICYmIG5leHRDYWxsT3B0aW9uc1t0aW1pbmddLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbdGltaW5nXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRDYWxsRWxlbWVudHMgPSBuZXh0Q2FsbC5lIHx8IG5leHRDYWxsLmVsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gbmV4dENhbGxFbGVtZW50cy5ub2RlVHlwZSA/IFsgbmV4dENhbGxFbGVtZW50cyBdIDogbmV4dENhbGxFbGVtZW50cztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tPcmlnaW5hbCAmJiBjYWxsYmFja09yaWdpbmFsLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFZlbG9jaXR5KGN1cnJlbnRDYWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Q2FsbC5vKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbC5vID0gJC5leHRlbmQoe30sIG5leHRDYWxsT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Q2FsbC5vcHRpb25zID0gJC5leHRlbmQoe30sIG5leHRDYWxsT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VxdWVuY2UucmV2ZXJzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgVmVsb2NpdHkoc2VxdWVuY2VbMF0pO1xuICAgIH07XG59KCh3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byB8fCB3aW5kb3cpLCB3aW5kb3csIGRvY3VtZW50KTtcbn0pKTsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0Z2FtZVZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtdm0nKTtcblxudmFyIEdhbWVDb250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBnYW1lVmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5yZWFkeSA9IGZ1bmN0aW9uKCl7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHR0aGlzLlZNLnN0YXJ0R2FtZSgpO1xuXHRcdG0ucmVkcmF3KCk7XG5cdH0uYmluZCh0aGlzKSwgMTAwMCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24oYW5zKXtcblx0aWYodGhpcy5WTS5sb2NrZWQoKSkgcmV0dXJuO1xuXG5cdHZhciBhbnN3ZXJJc1NlbGVjdGVkID0gYW5zLnNlbGVjdGVkKCk7XG5cdGlmKHRoaXMuVk0ucXVlc3Rpb24oKS5ndWVzc0xpbWl0UmVhY2hlZCgpICYmICFhbnN3ZXJJc1NlbGVjdGVkKXtcblx0XHRhbnMudG9nZ2xlUmVqZWN0ZWQodHJ1ZSk7XG5cdH0gZWxzZSB7XG5cdFx0YW5zLnNlbGVjdGVkKCFhbnMuc2VsZWN0ZWQoKSk7XG5cdFx0YW5zLnRvZ2dsZWQodHJ1ZSk7XG5cdFx0Ly8gY291bnQgdGhlIGd1ZXNzZXMgYWdhaW5cblx0XHR0aGlzLlZNLnF1ZXN0aW9uKCkuY291bnRHdWVzcygpO1xuXHR9XG5cdG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUub25UaW1lID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLlZNLmxvY2tlZCh0cnVlKTtcbiAgICB0aGlzLlZNLmVuZFF1ZXN0aW9uKHRydWUpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuYWZ0ZXJFbmRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5zdG9wUXVlc3Rpb24oKTtcbiAgICBtLnJlZHJhdygpO1xuICAgIHRoaXMuVk0ubmV4dFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5zdGFydFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLlZNLnN0YXJ0UXVlc3Rpb24oKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLmVuZEdhbWUgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNLnVwZGF0ZVNjb3JlKCk7XG5cdG0ucm91dGUoXCIvcmVzdWx0XCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lQ29udHJvbGxlcjsiLCIvKiBnbG9iYWwgbSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0aW50cm9WaWV3TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9pbnRyby12bScpO1xuXG52YXIgSW50cm9Db250cm9sbGVyID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTSA9IG5ldyBpbnRyb1ZpZXdNb2RlbCgpO1xuXHR0aGlzLlZNLmluaXQoKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuSW50cm9Db250cm9sbGVyLnByb3RvdHlwZS5vbkJlZ2luID0gZnVuY3Rpb24oKXtcblx0bS5yZWRyYXcoKTtcbn07XG5cbkludHJvQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnRHYW1lID0gZnVuY3Rpb24oKXtcblx0bS5yb3V0ZShcIi9nYW1lXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRyb0NvbnRyb2xsZXI7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdGxvYWRpbmdWaWV3TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9sb2FkaW5nLXZtJyk7XG5cbnZhciBMb2FkaW5nQ29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgbG9hZGluZ1ZpZXdNb2RlbCgpO1xuXHR0aGlzLlZNLmluaXQoKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuTG9hZGluZ0NvbnRyb2xsZXIucHJvdG90eXBlLm9ubG9hZGVkID0gZnVuY3Rpb24oKXtcblx0bS5yb3V0ZShcIi9pbnRyb1wiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ0NvbnRyb2xsZXI7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdHJlc3VsdFZpZXdNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL3Jlc3VsdC12bScpO1xuXG52YXIgUmVzdWx0Q29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgcmVzdWx0Vmlld01vZGVsKCk7XG5cdHRoaXMuVk0uaW5pdCgpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5cblxubW9kdWxlLmV4cG9ydHMgPSBSZXN1bHRDb250cm9sbGVyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpLFxuXHR2ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZS92ZWxvY2l0eS51aScpLFxuXHRnYW1lQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL2dhbWUtY29udHJvbGxlcicpLFxuXHRnYW1lVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2dhbWUtdmlldycpLFxuXHRyZXN1bHRDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vY29udHJvbGxlcnMvcmVzdWx0LWNvbnRyb2xsZXInKSxcblx0cmVzdWx0VmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL3Jlc3VsdC12aWV3JyksXG5cdGludHJvQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL2ludHJvLWNvbnRyb2xsZXInKSxcblx0aW50cm9WaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvaW50cm8tdmlldycpLFxuXHRsb2FkaW5nQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL2xvYWRpbmctY29udHJvbGxlcicpLFxuXHRsb2FkaW5nVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2xvYWRpbmctdmlldycpO1xuXG52YXIgYXBwbGljYXRpb24gPSBmdW5jdGlvbigpe1xuXHQvL2luaXRpYWxpemUgdGhlIGFwcGxpY2F0aW9uXG5cdHZhciBhcHAgPSB7XG5cdFx0bG9hZGluZyA6IHsgY29udHJvbGxlcjogbG9hZGluZ0NvbnRyb2xsZXIsIHZpZXc6IGxvYWRpbmdWaWV3IH0sXG5cdFx0aW50cm8gICA6IHsgY29udHJvbGxlcjogaW50cm9Db250cm9sbGVyLCAgIHZpZXc6IGludHJvVmlldyB9LFxuXHRcdGdhbWVcdDogeyBjb250cm9sbGVyOiBnYW1lQ29udHJvbGxlciwgdmlldzogZ2FtZVZpZXcgfSxcblx0XHRyZXN1bHQgIDogeyBjb250cm9sbGVyOiByZXN1bHRDb250cm9sbGVyLCB2aWV3OiByZXN1bHRWaWV3IH0sXG5cdH1cblxuXHRtLnJvdXRlLm1vZGUgPSBcImhhc2hcIjtcblxuXHRtLnJvdXRlKGRvY3VtZW50LmJvZHksIFwiL1wiLCB7XG5cdCAgICBcIlwiXHRcdCA6IGFwcC5sb2FkaW5nLFxuXHQgICAgXCIvaW50cm9cIiA6IGFwcC5pbnRybyxcblx0ICAgIFwiL2dhbWVcIiAgOiBhcHAuZ2FtZSxcblx0ICAgIFwiL3Jlc3VsdFwiOiBhcHAucmVzdWx0XG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBsaWNhdGlvbjsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG5cdG0gPSByZXF1aXJlKCdtaXRocmlsJyk7XG5cblxudmFyIF9udW1iZXJlZFN0cmluZyA9IGZ1bmN0aW9uKHRhcmdldCl7XG5cdHZhciBpbmRleCA9IDA7XG5cdHJldHVybiB0YXJnZXQucmVwbGFjZSgvXyguKj8pXy9nLCBmdW5jdGlvbiAobWF0Y2gsIHRleHQsIG51bWJlcikge1xuICAgICAgICB2YXIgcmVzID0gJ3snICsgaW5kZXggKyAnfSc7XG4gICAgICAgIGluZGV4KytcbiAgICAgICAgcmV0dXJuIHJlczsgIFxuICBcdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0cmVsYXRpdmVUaW1lIDogZnVuY3Rpb24ocHJldmlvdXMpe1xuXHRcdHZhciBtc1Blck1pbnV0ZSA9IDYwICogMTAwMDtcblx0ICAgIHZhciBtc1BlckhvdXIgPSBtc1Blck1pbnV0ZSAqIDYwO1xuXHQgICAgdmFyIG1zUGVyRGF5ID0gbXNQZXJIb3VyICogMjQ7XG5cdCAgICB2YXIgbXNQZXJNb250aCA9IG1zUGVyRGF5ICogMzA7XG5cdCAgICB2YXIgbXNQZXJZZWFyID0gbXNQZXJEYXkgKiAzNjU7XG5cblx0ICAgIHZhciBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHByZXZpb3VzO1xuXG5cdCAgICBpZiAoZWxhcHNlZCA8IG1zUGVyTWludXRlKSB7XG5cdCAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvMTAwMCkgKyAnIHNlY29uZHMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlckhvdXIpIHtcblx0ICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1Blck1pbnV0ZSkgKyAnIG1pbnV0ZXMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlckRheSApIHtcblx0ICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1BlckhvdXIgKSArICcgaG91cnMgYWdvJztcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1Blck1vbnRoKSB7XG5cdCAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1BlckRheSkgKyAnIGRheXMgYWdvJzsgICBcblx0ICAgIH1cblx0ICAgIGVsc2UgaWYgKGVsYXBzZWQgPCBtc1BlclllYXIpIHtcblx0ICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChlbGFwc2VkL21zUGVyTW9udGgpICsgJyBtb250aHMgYWdvJzsgICBcblx0ICAgIH1cblx0ICAgIGVsc2Uge1xuXHQgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvbXNQZXJZZWFyICkgKyAnIHllYXJzIGFnbyc7ICAgXG5cdCAgICB9XG5cdH0sXG5cblx0Lypcblx0XHRSZXBsYWNlcyBzdHJpbmcgd2l0aCBcIl9ib2xkXyBub3JtYWxcIiB0ZXh0IHRvIG1pdGhyaWwgQXJyYXlcblx0Ki9cblx0c2hvcnRoYW5kVG9NaXRocmlsQXJyYXkgOiBmdW5jdGlvbih0YXJnZXQpe1xuXG5cdFx0aWYodGFyZ2V0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xuXG5cdFx0dmFyIGtleXdvcmRNZW1iZXJzID0gdGFyZ2V0Lm1hdGNoKC9fKC4qPylfL2cpLFxuXHRcdFx0bnVtYmVyRGVsaW1pdGVyZWRTdHJpbmcgPSBfbnVtYmVyZWRTdHJpbmcodGFyZ2V0KSxcblx0XHRcdHRhcmdldEFycmF5ID0gXy53aXRob3V0KG51bWJlckRlbGltaXRlcmVkU3RyaW5nLnNwbGl0KC97KFxcZCspfS8pLCBcIlwiKTtcblxuXHRcdFxuXHRcdGZvciAodmFyIGkgPSAwLCBqID0gdGFyZ2V0QXJyYXkubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG5cdFx0XHR2YXIgdCA9ICt0YXJnZXRBcnJheVtpXTtcblx0XHRcdGlmKHQgPj0gMCkgdGFyZ2V0QXJyYXlbaV0gPSBtKCdzcGFuJywga2V5d29yZE1lbWJlcnNbdF0ucmVwbGFjZSgvXy9nLCAnJykpOyAgICB0aGlzLmd1ZXNzZXMgPSBtLnByb3AoMCk7XG5cblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRhcmdldEFycmF5O1xuXG5cdH1cblxufTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0XyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG52YXIgQ09OU1RfS0VZID0gJ3Nob3ctc3Rhci1iZXRhJztcblxuLypcblx0WW91IHdvdWxkIG9idGFpbiB0aGlzIGJ5IHhoclxuKi9cbnZhciBkYXRhID0ge1xuXHR0aXRsZSA6IFwiU2hvdyBTdGFyXCIsXG5cdGRlc2NyaXB0aW9uIDogXCJDYW4geW91IG1hdGNoIHRoZSBhY3RvciB0byB0aGUgc2hvdyBpbiB0aW1lP1wiLFxuXHR0aW1lciA6IDUsXG5cdGFzc2V0cyA6IFtcblx0XHQgeyBuYW1lIDogJ2JyYW5kJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTViZjYyYWMtM2U1Zi00NmZhLTliNTktNTljMDliYzAzZDNlLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Bvc2l0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjg5ZTk1M2ItYThiOS00ZThiLTg5ZDUtMTc2OWUxZmIxNjhiLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ21vZGVyYXRlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmZmYzRmZTctMmUxMi00M2MyLTg1MmMtZDYwYzdkNGZiNWEyLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ25lZ2F0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNzVmYjMwOTEtNTc0Yy00ODYzLWJmMjEtMGVhMTgyNWM0ODUzLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Ryb3BoeScsIGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzllY2RhMmUyLTZkMDktNDhkZC1hMTY2LTMyZWMyMzJiZGI4Yi5wbmcnIH1cblx0XSxcblx0cXVlc3Rpb25zIDpbe1xuXHRcdHF1ZXN0aW9uIDogXCJfQ2hvb3NlIDNfIG9mIHRoZSBmb2xsb3dpbmcgYXBwZWFyZWQgaW4gdGhlIDkwJ3Mgc2l0Y29tIF9GcmllbmRzX1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8wZTgzMWU4Yy04ZDYwLTQzZWEtYWI3ZC05YmJmZDRmZmIzYWQucG5nJywgbmFtZSA6ICdEb25hbGQgR2xvdmVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzkyZTBiNDViLTQwNGYtNDQxNy04YjA2LTg4ZTEwNzliYWVkNy5wbmcnLCBuYW1lIDogJ1dheW5lIEtuaWdodCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei81ZDljOWZjOC02MDZlLTQ4NGEtYjRmZC1lYjBlMGJkYzQ0OTcucG5nJywgbmFtZSA6ICdEZW1pIE1vb3JlJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjRiODBhMzAtNTdhNi00OTI4LWE4MDUtNzBiYzM4NjQxMDE4LnBuZycsIG5hbWUgOiAnSmVzc2ljYSBXZXN0ZmVsZHQnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNGJjMDc3NmUtMWNmOC00YjEyLTg4MWItZjcxNTQzNDNkYmU0LnBuZycsIG5hbWUgOiAnSmVubmlmZXIgQW5pc3RvbicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzZjkxYTYzLWU5ODctNGVhNy04MWFiLTU4NmY5MzA2MTBhZS5wbmcnLCBuYW1lIDogJ0phc29uIEFsZXhhbmRlcicsIGNvcnJlY3QgOiBmYWxzZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIkdvaW5nIGJhY2sgYSBsaXR0bGUgZnVydGhlciwgX0Nob29zZSAzXyB3aG8gc3RhcnJlZCBpbiB0aGUgY3VsdCBjbGFzc2ljIF9TZWluZmVsZF8/XCIsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzIxZDlhMDU1LWIxYzYtNGQ0ZC1hNGI2LTUxMzE5ZmM2NTE2NS5wbmcnLCBuYW1lIDogJ0RhdmlkIFNjaHdpbW1lcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iMzNjYjI2Mi1lMTc1LTQ0ZjQtYTU4ZS00MjUyMzM5MWZiNWQucG5nJywgbmFtZSA6ICdNYXR0IExlIEJsYW5jJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2U3N2I2NjE3LWY1NDMtNDZjYi1iNDM1LTM3YjZiMWE0NDJkNy5wbmcnLCBuYW1lIDogJ0NvdXJ0bmV5IENveC1BcnF1ZXR0ZScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85MmUwYjQ1Yi00MDRmLTQ0MTctOGIwNi04OGUxMDc5YmFlZDcucG5nJywgbmFtZSA6ICdXYXluZSBLbmlnaHQnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8zYTZlZWFkMy05MGNjLTQwNmMtOTllMS00OTM5MjNiM2U4ZDAucG5nJywgbmFtZSA6ICdNYXR0aGV3IFBlcnJ5JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjU5YzQ0NS04ZjNlLTQ2YmQtYWQ1Ny1jMTVhNzNjN2E2OGEucG5nJywgbmFtZSA6ICdQYXVsIFdhc2lsZXdza2knLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYjNmOTFhNjMtZTk4Ny00ZWE3LTgxYWItNTg2ZjkzMDYxMGFlLnBuZycsIG5hbWUgOiAnSmFzb24gQWxleGFuZGVyJywgY29ycmVjdCA6IHRydWUgfVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdHF1ZXN0aW9uIDogXCJOb3cgX1NjcnVic18gZ2l2ZSBtZSBfM19cIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjNjMzFkOGQtMjU1NC00MjMwLWEwMDYtMWRmNzc2NjA2MGE3LnBuZycsIG5hbWUgOiAnQ2hldnkgQ2hhc2UnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMWI1OWM0NDUtOGYzZS00NmJkLWFkNTctYzE1YTczYzdhNjhhLnBuZycsIG5hbWUgOiAnUGF1bCBXYXNpbGV3c2tpJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2NhNTExMDMwLWY3N2UtNDZkZi1hMWE5LTEwNTg2Mjg0YTM4Yi5wbmcnLCBuYW1lIDogJ0xpc2EgS3Vkcm93JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzI5NDgxODJiLWZhNzUtNDNmZi05NjFmLTU5ZTYzNjA1YWUzOC5wbmcnLCBuYW1lIDogJ0t1bWFpbCBOYW5qaWFuaScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jZjNmN2UxNy1iODUwLTRhMTItOGRhNi04Y2Q1YWFkNGE1YmEucG5nJywgbmFtZSA6ICdBbG9tb2EgV3JpZ2h0JywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmY5OWNlZmUtM2MwMC00Nzg1LWJkNWItZTRhNzZjNjZjOTFiLnBuZycsIG5hbWUgOiAnU2FyYWggQ2hhbGtlJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTMzNTAyOTEtMzBlMi00NDAzLWFmYmQtOTczMDliMzU0ZjU5LnBuZycsIG5hbWUgOiAnVEogTWlsbGVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2M3NjYzNjAxLTMzNTItNGMxMS1hYWQ2LTQ3NWQwOTY4NDAxMS5wbmcnLCBuYW1lIDogJ1phY2sgQnJhZmYnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mMGFhNDg3Yy00YjJlLTQ3MzUtYjk2My1jNzQ1ZWUxZjcxMjUucG5nJywgbmFtZSA6ICdaYWNoIFdvb2RzJywgY29ycmVjdCA6IGZhbHNlIH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRxdWVzdGlvbiA6IFwiV2hpY2ggb2YgdGhlIGZvbGxvd2luZyBfMyBBY3RvcnNfIGFwcGVhcmVkIGluIF9Db21tdW5pdHlfXCIsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzFiMTBmMzY2LTE1YTEtNGMzOC05YWQ2LTQyOTQyYTA1YzIwYS5wbmcnLCBuYW1lIDogJ1J5YW4gU2VhY3Jlc3QnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTg5YmJlNDktNzUzZS00MjM0LTg4NWQtMTkyOTMxNGEzNzFlLnBuZycsIG5hbWUgOiAnRnJhbmsgQWJhZ25hbGUganInLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjk0ODE4MmItZmE3NS00M2ZmLTk2MWYtNTllNjM2MDVhZTM4LnBuZycsIG5hbWUgOiAnS3VtYWlsIE5hbmppYW5pJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzYzYzMxZDhkLTI1NTQtNDIzMC1hMDA2LTFkZjc3NjYwNjBhNy5wbmcnLCBuYW1lIDogJ0NoZXZ5IENoYXNlJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMDM4MzNhODEtN2FhNy00YzNiLTg4NGYtMTY3Mjc3YjE5YzI0LnBuZycsIG5hbWUgOiAnWXZldHRlIE5pY29sZSBCcm93bicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9mYzI2MzBkYy1iMzdlLTQyMDMtOTljNS0wYzgzNzBhZjExYWIucG5nJywgbmFtZSA6ICdLZW4gSmVvbmcnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jNzY2MzYwMS0zMzUyLTRjMTEtYWFkNi00NzVkMDk2ODQwMTEucG5nJywgbmFtZSA6ICdaYWNrIEJyYWZmJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2NmM2Y3ZTE3LWI4NTAtNGExMi04ZGE2LThjZDVhYWQ0YTViYS5wbmcnLCBuYW1lIDogJ0Fsb21vYSBXcmlnaHQnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNTI5NmJjZDAtNmY2YS00MWM5LWJlMjctYjdhMWUwYmVhNDU4LnBuZycsIG5hbWUgOiAnSm9lbCBNY0hhbGUnLCBjb3JyZWN0IDogdHJ1ZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIkdldHRpbmcgYSBsaXR0bGUgbW9yZSBtb2Rlcm4sIF9DaG9vc2UgNV8gZnJvbSBIQk8ncyBfU2lsaWNvbiBWYWxsZXlfXCIsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2YwYWE0ODdjLTRiMmUtNDczNS1iOTYzLWM3NDVlZTFmNzEyNS5wbmcnLCBuYW1lIDogJ1phY2ggV29vZHMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85ODliYmU0OS03NTNlLTQyMzQtODg1ZC0xOTI5MzE0YTM3MWUucG5nJywgbmFtZSA6ICdGcmFuayBBYmFnbmFsZSBqcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9hNmIyOGJlNi1kMGY5LTRkZTAtOTA5Zi01MGIwMjFhNjI4OGEucG5nJywgbmFtZSA6ICdNYXJ0aW4gU3RhcnInLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8yOTQ4MTgyYi1mYTc1LTQzZmYtOTYxZi01OWU2MzYwNWFlMzgucG5nJywgbmFtZSA6ICdLdW1haWwgTmFuamlhbmknLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jZjNmN2UxNy1iODUwLTRhMTItOGRhNi04Y2Q1YWFkNGE1YmEucG5nJywgbmFtZSA6ICdBbG9tb2EgV3JpZ2h0JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2ZjMjYzMGRjLWIzN2UtNDIwMy05OWM1LTBjODM3MGFmMTFhYi5wbmcnLCBuYW1lIDogJ0tlbiBKZW9uZycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jNzY2MzYwMS0zMzUyLTRjMTEtYWFkNi00NzVkMDk2ODQwMTEucG5nJywgbmFtZSA6ICdaYWNrIEJyYWZmJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzkzMzUwMjkxLTMwZTItNDQwMy1hZmJkLTk3MzA5YjM1NGY1OS5wbmcnLCBuYW1lIDogJ1RKIE1pbGxlcicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzMzc2MDA0LWVkMWMtNDA2MS1hNTQxLTgwYjE4ZTY2YTQ1ZC5wbmcnLCBuYW1lIDogJ1Rob21hcyBNaWRkbGVkaXRjaCcsIGNvcnJlY3QgOiB0cnVlIH1cblx0XHRdXG5cdH1cblx0XSxcblx0cmVzdWx0TWVzc2FnZXMgOiB7XG5cdFx0MjAgIDogXCJPaCBvaOKApi50aGluayB5b3UgbmVlZCB0byBzcGVuZCBzb21lIHRpbWUgb24gdGhlIGNvdWNoIHRoaXMgd2Vla2VuZCwgaG9uaW5nIGluIG9uIHlvdXIgVFYgc2tpbGxzIVwiLFxuXHRcdDQwICA6IFwiUHJldHR5IGdvb2QsIGFsdGhvdWdoIHRoZSBwcmVzc3VyZSBtdXN0IGhhdmUgZ290IHRoZSBiZXN0IG9mIHlvdeKAplRyeSBhZ2FpbiFcIixcblx0XHQ2MCAgOiBcIkdyZWF0IGVmZm9ydCEgWW914oCZcmUgbmVhcmx5IGFtYXppbmfigKZuZWFybHnigKYud2h5IGRvbuKAmXQgeW91IGFzayB0aGUgSG9tZSBPZiBDb21lZHkgVFYgUm9vbSBmb3Igc29tZSBoZWxwPyBDbGljayBoZXJlIG9yIHRyeSB5b3VyIGx1Y2sgYWdhaW4gYW5kIHBsYXkgYWdhaW4hXCIsXG5cdFx0ODAgIDogXCJBbWF6aW5nIFN0dWZmIC0geW91IGFyZSBhdCB0aGUgdG9wIG9mIHRoZSBsZWFkZXJib2FyZCEgTmVhciBwZXJmZWN0ISBCZSBwZXJmZWN04oCmUGxheSBhZ2FpbiFcIixcblx0XHQxMDAgOiBcIkdlbml1c+KApi4ueW91IGtub3cgeW91ciBUVi4gTGV04oCZcyBzZWUgaG93IHlvdSBnbyBvbiBMZXZlbCAyXCJcblx0fVxufTtcblxuXG52YXIgX2dldE1heFNjb3JlID0gZnVuY3Rpb24oKXtcblx0dmFyIHNjb3JlID0gMDtcblx0Xy5lYWNoKGRhdGEucXVlc3Rpb25zLCBmdW5jdGlvbihxKXtcblx0XHRzY29yZSArPSBfLmZpbHRlcihxLmFuc3dlcnMsIHsgY29ycmVjdCA6IHRydWUgfSkubGVuZ3RoO1xuXHR9KTtcblx0cmV0dXJuIHNjb3JlO1xufTtcblxudmFyIF9oYXNMb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgbW9kID0gJ3h4Jztcblx0dHJ5IHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obW9kLCBtb2QpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShtb2QpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cbnZhciBfdHJ5UGFyc2UgPSBmdW5jdGlvbih0YXJnZXQpe1xuXHR2YXIgcmVzdWx0ID0gW107XG5cdHRyeSB7XG5cdFx0cmV0dXJuIEpTT04ucGFyc2UodGFyZ2V0KSB8fCByZXN1bHQ7XG5cdH0gY2F0Y2goZSkge1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn07XG5cbnZhciBfZ2V0UHJldmlvdXNTY29yZXMgPSBmdW5jdGlvbigpe1xuXHRpZighX2hhc0xvY2FsU3RvcmFnZSgpKSByZXR1cm4gW107XG5cdHJldHVybiBfdHJ5UGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oQ09OU1RfS0VZKSk7XG59O1xuXG4vKlxuXHRDb25zdHJ1Y3RvclxuKi9cbnZhciBHYW1lTW9kZWwgPSBmdW5jdGlvbigpe1xuXHR0aGlzLnNjb3JlIFx0XHQ9IG0ucHJvcCgwKTtcblx0dGhpcy5oaWdoU2NvcmUgID0gbS5wcm9wKF9nZXRNYXhTY29yZSgpKTtcblx0dGhpcy5xdWVzdGlvbnNcdD0gbS5wcm9wKGRhdGEucXVlc3Rpb25zKTtcblx0dGhpcy5hc3NldHMgICAgID0gbS5wcm9wKGRhdGEuYXNzZXRzKTtcblx0dGhpcy50aXRsZVx0XHQ9IG0ucHJvcChkYXRhLnRpdGxlKTtcblx0dGhpcy5yZXN1bHRNZXNzYWdlcyA9IG0ucHJvcChkYXRhLnJlc3VsdE1lc3NhZ2VzKTtcblx0dGhpcy5kZXNjcmlwdGlvbiA9IG0ucHJvcChkYXRhLmRlc2NyaXB0aW9uKTtcblx0dGhpcy50aW1lciA9IG0ucHJvcChkYXRhLnRpbWVyIHx8IDUpO1xuXHR0aGlzLnByZXZpb3VzU2NvcmVzID0gbS5wcm9wKF9nZXRQcmV2aW91c1Njb3JlcygpKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuXG5HYW1lTW9kZWwucHJvdG90eXBlLnNhdmVTY29yZSA9IGZ1bmN0aW9uKHNjb3JlKXtcblx0XG5cdHRoaXMuc2NvcmUoc2NvcmUpO1xuXG5cdC8vIFVwZGF0ZSBwcmV2aW91cyBzY29yZXMgc2V0dGluZyB0aGUgbGF0ZXN0IHNjb3JlIGFzIG9ubHkgb25lIG9mIHRoYXQgc2NvcmVcblx0dmFyIHByZXZpb3VzU2NvcmVzID0gdGhpcy5wcmV2aW91c1Njb3JlcygpLFxuXHRcdG5ld1Njb3JlID0geyBkYXRlIDogRGF0ZS5ub3coKSwgc2NvcmUgOiBzY29yZSB9O1xuXHRwcmV2aW91c1Njb3JlcyA9IF8ud2l0aG91dChwcmV2aW91c1Njb3JlcywgXy5maW5kV2hlcmUocHJldmlvdXNTY29yZXMsIHsgc2NvcmUgOiBzY29yZSB9KSk7XG5cdHByZXZpb3VzU2NvcmVzLnB1c2gobmV3U2NvcmUpO1xuXHR0aGlzLnByZXZpb3VzU2NvcmVzKHByZXZpb3VzU2NvcmVzKTtcblxuXHQvLyBzYXZlIGluIGxvY2FsIHN0b3JhZ2Ugd2hlcmUgYXZhaWxhYmxlXG5cdGlmKCEgX2hhc0xvY2FsU3RvcmFnZSgpKSByZXR1cm47XG5cdGxvY2FsU3RvcmFnZS5zZXRJdGVtKENPTlNUX0tFWSwgSlNPTi5zdHJpbmdpZnkodGhpcy5wcmV2aW91c1Njb3JlcygpKSk7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2FtZU1vZGVsKCk7XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vLi4vbGlicy91dGlscycpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEFuc3dlciA9IGZ1bmN0aW9uKGQpe1xuICAgIHRoaXMuaW1hZ2UgPSBtLnByb3AoZC5pbWFnZSk7XG4gICAgdGhpcy5uYW1lID0gbS5wcm9wKGQubmFtZSk7XG4gICAgdGhpcy5zZWxlY3RlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5jb3JyZWN0ID0gbS5wcm9wKGQuY29ycmVjdCk7XG4gICAgXG4gICAgLy8gdmlldyBtYXJrZXJzXG4gICAgdGhpcy50b2dnbGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnRvZ2dsZVJlamVjdGVkID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkFuc3dlci5wcm90b3R5cGUuZ2V0U2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBzY29yZSA9IDA7XG4gICAgaWYodGhpcy5zZWxlY3RlZCgpICYmIHRoaXMuY29ycmVjdCgpKSBzY29yZSA9IDE7XG4gICAgcmV0dXJuIHNjb3JlO1xufTtcblxudmFyIFF1ZXN0aW9uID0gZnVuY3Rpb24oZCl7XG4gICAgdGhpcy50ZXh0ID0gbS5wcm9wKGQucXVlc3Rpb24pO1xuICAgIHRoaXMucXVlc3Rpb25FbGVtZW50ID0gbS5wcm9wKHV0aWxzLnNob3J0aGFuZFRvTWl0aHJpbEFycmF5KGQucXVlc3Rpb24pKTtcbiAgICB0aGlzLmFuc3dlcnMgPSBtLnByb3AoXy5tYXAoZC5hbnN3ZXJzLCBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIG5ldyBBbnN3ZXIoYSk7XG4gICAgfSkpO1xuICAgIHRoaXMuZ3Vlc3NlcyA9IG0ucHJvcCgwKTtcbiAgICB0aGlzLmxpbWl0ID0gbS5wcm9wKF8uZmlsdGVyKGQuYW5zd2VycywgeyBjb3JyZWN0IDogdHJ1ZSB9KS5sZW5ndGgpO1xufTtcblxuUXVlc3Rpb24ucHJvdG90eXBlLmd1ZXNzTGltaXRSZWFjaGVkID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5ndWVzc2VzKCkgPT09IHRoaXMubGltaXQoKTtcbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5jb3VudEd1ZXNzID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmd1ZXNzZXMoXy5maWx0ZXIodGhpcy5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHJldHVybiBhbnMuc2VsZWN0ZWQoKTtcbiAgICB9KS5sZW5ndGgpO1xufTtcblxudmFyIFRpbWVyID0gZnVuY3Rpb24odGltZSl7XG4gICAgdGhpcy5pc0FjdGl2ZSA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy50aW1lID0gbS5wcm9wKHRpbWUgKiAxMDAwKTtcbn07XG4gICAgXG4vKlxuICAgIENvbnN0cnVjdG9yXG4qL1xuXG52YXIgR2FtZVZNID0gZnVuY3Rpb24oKXt9O1xuXG5cbi8qXG4gICAgUHJpdmF0ZSBNZW1iZXJzXG4qL1xuXG52YXIgX2NsZWFyUXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBuZXcgUXVlc3Rpb24oeyBxdWVzdGlvbiA6IFwiXCIsIGFuc3dlcnMgOiBbXSB9KTtcbn07XG5cbi8vIFlvdSBjYW4gZ2V0IG5lZ2F0aXZlIHNjb3JlcyEhXG52YXIgX3VwZGF0ZVNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgY3VycmVudFNjb3JlID0gdGhpcy5jdXJyZW50U2NvcmUoKSxcbiAgICAgICAgc2NvcmUgPSAwO1xuXG4gICAgXy5lYWNoKHRoaXMucXVlc3Rpb24oKS5hbnN3ZXJzKCksIGZ1bmN0aW9uKGFucyl7XG4gICAgICAgIHNjb3JlICs9IGFucy5nZXRTY29yZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50U2NvcmUoY3VycmVudFNjb3JlICsgc2NvcmUpO1xufTtcblxudmFyIF9zZXRDdXJyZW50UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBxID0gbmV3IFF1ZXN0aW9uKHRoaXMucXVlc3Rpb25zKClbdGhpcy5jdXJyZW50UXVlc3Rpb24oKV0pO1xuICAgIHRoaXMucXVlc3Rpb24ocSk7XG59O1xuXG52YXIgX25leHRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnRRdWVzdGlvbigpICsgMSxcbiAgICAgICAgaXNFbmQgPSBjdXJyZW50ID09PSB0aGlzLnRvdGFsUXVlc3Rpb25zKCk7XG5cbiAgICB0aGlzLmdhbWVPdmVyKGlzRW5kKTtcbiAgICBpZighIGlzRW5kKSB7XG4gICAgICAgIHRoaXMucXVlc3Rpb25TaG93bihmYWxzZSk7XG4gICAgICAgIHRoaXMuY3VycmVudFF1ZXN0aW9uKGN1cnJlbnQpO1xuICAgICAgICBfc2V0Q3VycmVudFF1ZXN0aW9uLmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuXG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5HYW1lVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCk7XG4gICAgdGhpcy5jdXJyZW50UXVlc3Rpb24gPSBtLnByb3AoMCk7XG4gICAgdGhpcy5jdXJyZW50U2NvcmUgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50aW1lciA9IG0ucHJvcChudWxsKTtcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IG0ucHJvcChxdWVzdGlvbnMpO1xuICAgIHRoaXMudG90YWxRdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zLmxlbmd0aCk7XG4gICAgdGhpcy5nYW1lT3ZlciA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5xdWVzdGlvbiA9IG0ucHJvcChfY2xlYXJRdWVzdGlvbigpKTtcbiAgICBcbiAgICAvLyBWaWV3IFF1ZXVlcyBcbiAgICB0aGlzLmxvY2tlZCA9IG0ucHJvcCh0cnVlKTtcbiAgICB0aGlzLnF1ZXN0aW9uU2hvd24gPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuZW5kUXVlc3Rpb24gPSBtLnByb3AoZmFsc2UpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydEdhbWUgPSBmdW5jdGlvbigpe1xuICAgIF9zZXRDdXJyZW50UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RvcFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uKGZhbHNlKTtcbiAgICBfdXBkYXRlU2NvcmUuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnF1ZXN0aW9uKF9jbGVhclF1ZXN0aW9uKCkpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIF9uZXh0UXVlc3Rpb24uY2FsbCh0aGlzKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUudXBkYXRlU2NvcmUgPSBmdW5jdGlvbigpe1xuICAgIEdhbWVNb2RlbC5zYXZlU2NvcmUodGhpcy5jdXJyZW50U2NvcmUoKSk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnN0YXJ0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMudGltZXIobmV3IFRpbWVyKEdhbWVNb2RlbC50aW1lcigpKSk7XG4gICAgdGhpcy5sb2NrZWQoZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcblx0XyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIEludHJvVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5JbnRyb1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpdGxlID0gbS5wcm9wKEdhbWVNb2RlbC50aXRsZSgpKTtcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKEdhbWVNb2RlbC5kZXNjcmlwdGlvbigpKTtcbiAgICB0aGlzLmJlZ2luID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmJyYW5kID0gbS5wcm9wKF8uZmluZFdoZXJlKEdhbWVNb2RlbC5hc3NldHMoKSwgeyBuYW1lIDogJ2JyYW5kJyB9KS5pbWFnZSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludHJvVk07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfICA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEdhbWVNb2RlbCA9IHJlcXVpcmUoJy4vLi4vbW9kZWxzL2dhbWUtbW9kZWwnKTtcblxudmFyIExvYWRpbmdWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcbiAgICBQcmVsb2FkIGltYWdlc1xuKi9cbnZhciBfcHJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHRhcmdldHMgPSB0aGlzLnRhcmdldHMoKSxcbiAgICAgICAgdGFyZ2V0Q291bnQgPSB0YXJnZXRzLmxlbmd0aDtcblxuICAgIHZhciBfX29uTG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBsb2FkZWQgPSB0aGlzLnRhcmdldHNMb2FkZWQoKSArIDE7XG4gICAgICAgIHRoaXMudGFyZ2V0c0xvYWRlZChsb2FkZWQpO1xuICAgICAgICB0aGlzLnByb2dyZXNzKE1hdGgucm91bmQoKGxvYWRlZCAvIHRhcmdldENvdW50KSAqIDEwMCkpO1xuICAgICAgICB0aGlzLmxvYWRlZCh0aGlzLnByb2dyZXNzKCkgPT09IDEwMCk7XG4gICAgICAgIG0ucmVkcmF3KCk7XG4gICAgfTtcblxuICAgIGZvciAodmFyIGkgPSB0YXJnZXRDb3VudCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSBfX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICBpbWFnZS5zcmMgPSB0YXJnZXRzW2ldO1xuICAgIH1cbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5Mb2FkaW5nVk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHZhciBxdWVzdGlvbnMgPSBHYW1lTW9kZWwucXVlc3Rpb25zKCksXG4gICAgICAgIGFzc2V0cyA9IEdhbWVNb2RlbC5hc3NldHMoKSxcbiAgICAgICAgZW50aXRpZXMgPSBbXTtcblxuICAgIF8uZWFjaChxdWVzdGlvbnMsIGZ1bmN0aW9uKHEpe1xuICAgICAgICBlbnRpdGllcyA9IF8udW5pb24oZW50aXRpZXMsIF8ucGx1Y2socS5hbnN3ZXJzLCAnaW1hZ2UnKSk7XG4gICAgfSk7XG4gICAgZW50aXRpZXMgPSBfLnVuaW9uKGVudGl0aWVzLCBfLnBsdWNrKGFzc2V0cywgJ2ltYWdlJykpO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMucHJvZ3Jlc3MgPSBtLnByb3AoMCk7XG4gICAgdGhpcy50YXJnZXRzID0gbS5wcm9wKGVudGl0aWVzKTtcbiAgICB0aGlzLnRhcmdldHNMb2FkZWQgPSBtLnByb3AoMCk7XG4gICAgX3ByZWxvYWQuY2FsbCh0aGlzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZ1ZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcblx0dXRpbHMgPSByZXF1aXJlKCcuLy4uL2xpYnMvdXRpbHMnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBSZXN1bHRWTSA9IGZ1bmN0aW9uKCl7fTtcblxuLypcblx0UHJpdmF0ZSBNZW1lYmVyc1xuKi9cblxudmFyIF9jYWxjTWVzc2FnZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBtZXNzYWdlcyA9IHRoaXMucmVzdWx0TWVzc2FnZXMoKSxcblx0XHRwZXJjZW50YWdlID0gTWF0aC5yb3VuZCgodGhpcy5zY29yZSgpIC8gdGhpcy5oaWdoU2NvcmUoKSkgKiAxMDApLFxuXHRcdHJlc3VsdCA9IG1lc3NhZ2VzWzIwXTtcblxuXHRmb3IodmFyIHJlcyBpbiBtZXNzYWdlcykge1xuXHRcdGlmKHBlcmNlbnRhZ2UgPj0gcmVzKSByZXN1bHQgPSBtZXNzYWdlc1tyZXNdO1xuXHRcdGVsc2UgYnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcblxudmFyIF9jYWxjVG9wRml2ZSA9IGZ1bmN0aW9uKHByZXZpb3VzU2NvcmVzLCBjdXJyZW50U2NvcmUpe1xuXG5cdC8vIGdldCBmcmllbmRseSBUaW1lXG5cdF8uZWFjaChwcmV2aW91c1Njb3JlcywgZnVuY3Rpb24oc2NvcmUpe1xuXHRcdHNjb3JlLmZyaWVuZGx5VGltZSA9IHV0aWxzLnJlbGF0aXZlVGltZShzY29yZS5kYXRlKTtcblx0XHRzY29yZS5pc0N1cnJlbnQgPSArc2NvcmUuc2NvcmUgPT09ICtjdXJyZW50U2NvcmU7XG5cdH0pO1xuXG5cdGlmKHByZXZpb3VzU2NvcmVzLmxlbmd0aCA8PSAxKSByZXR1cm4gcHJldmlvdXNTY29yZXM7XG5cbiAgICBwcmV2aW91c1Njb3JlcyA9IF8uc29ydEJ5KHByZXZpb3VzU2NvcmVzLCBmdW5jdGlvbihzKXtcbiAgICAgICAgcmV0dXJuIC1zLnNjb3JlO1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBwcmV2aW91c1Njb3Jlcy5zbGljZSgwLDUpO1xufTtcblxudmFyIF9nZXRQZXJmb3JtYW5jZUFkaiA9IGZ1bmN0aW9uKCl7XG5cdHZhciB0YXJnZXQgPSAnJyxcblx0XHRpbmRleCA9IF8uZmluZEluZGV4KHRoaXMuc2NvcmVCb2FyZCgpLCBmdW5jdGlvbihzY29yZSl7XG5cdFx0cmV0dXJuIHNjb3JlLmlzQ3VycmVudDtcblx0fSk7XG5cblx0c3dpdGNoKGluZGV4KXtcblx0XHRjYXNlIDA6XG5cdFx0XHR0YXJnZXQgPSAndHJvcGh5Jztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMTpcblx0XHRjYXNlIDI6XG5cdFx0XHR0YXJnZXQgPSAncG9zaXRpdmUnO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAzOlxuXHRcdGNhc2UgNDpcblx0XHRcdHRhcmdldCA9ICdtb2RlcmF0ZSc7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGFyZ2V0ID0gJ25lZ2F0aXZlJztcblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG52YXIgX2dldFJlc3VsdEltYWdlID0gZnVuY3Rpb24oKXtcblx0cmV0dXJuIF8uZmluZFdoZXJlKHRoaXMuYXNzZXRzKCksIHsgbmFtZSA6IHRoaXMucGVyZm9ybWFuY2VBZGooKSB9KS5pbWFnZTtcbn07XG5cbi8qXG4gICAgUHVibGljIE1lbWJlcnNcbiovXG5SZXN1bHRWTS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zY29yZSA9IG0ucHJvcChHYW1lTW9kZWwuc2NvcmUoKSk7XG4gICAgdGhpcy5oaWdoU2NvcmUgPSBtLnByb3AoR2FtZU1vZGVsLmhpZ2hTY29yZSgpKTtcbiAgICB0aGlzLnJlc3VsdE1lc3NhZ2VzID0gbS5wcm9wKEdhbWVNb2RlbC5yZXN1bHRNZXNzYWdlcygpKTtcbiAgICB0aGlzLmFzc2V0cyA9IG0ucHJvcChHYW1lTW9kZWwuYXNzZXRzKCkpO1xuICAgIFxuICAgIC8vIERlcml2YXRpdmUgRGF0YVxuXHR0aGlzLnNjb3JlQm9hcmQgPSBtLnByb3AoX2NhbGNUb3BGaXZlKEdhbWVNb2RlbC5wcmV2aW91c1Njb3JlcygpLCB0aGlzLnNjb3JlKCkpKTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtLnByb3AoX2NhbGNNZXNzYWdlLmNhbGwodGhpcykpO1xuICAgIHRoaXMucGVyZm9ybWFuY2VBZGogPSBtLnByb3AoX2dldFBlcmZvcm1hbmNlQWRqLmNhbGwodGhpcykpO1xuICAgIHRoaXMucmVzdWx0SW1hZ2UgPSBtLnByb3AoX2dldFJlc3VsdEltYWdlLmNhbGwodGhpcykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZXN1bHRWTTsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgYW5zd2VyKXtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZiAoYW5zd2VyLnRvZ2dsZWQoKSkge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsICdjYWxsb3V0LnB1bHNlJywgeyBkdXJhdGlvbiA6IDQwMCB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5zd2VyLnRvZ2dsZWQoZmFsc2UpO1xuICAgICAgICB9IFxuICAgICAgICBlbHNlIGlmKGFuc3dlci50b2dnbGVSZWplY3RlZCgpKXtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCAnY2FsbG91dC5zaGFrZScsIHsgZHVyYXRpb24gOiA0MDAgfSk7XG4gICAgICAgICAgICBhbnN3ZXIudG9nZ2xlUmVqZWN0ZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwudG9nZ2xlLmJpbmQoY3RybCwgYW5zd2VyKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oXCJsaS5hbnN3ZXIub3BhcXVlXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluLFxuICAgICAgICBjbGFzcyA6ICFhbnN3ZXIuY29ycmVjdCgpID8gJ2pzX2ZhbHN5JyA6ICcnLFxuICAgICAgICBzdHlsZSA6IHsgYmFja2dyb3VuZEltYWdlIDogXCJ1cmwoXCIgKyBhbnN3ZXIuaW1hZ2UoKSArIFwiKVwiIH1cbiAgICB9LCBbXG4gICAgICAgIG0oXCJoNC5uYW1lXCIsIGFuc3dlci5uYW1lKCkpXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBhbnN3ZXJWaWV3ID0gcmVxdWlyZSgnLi9hbnN3ZXItdmlldycpLFxuICAgIHRpbWVyVmlldyA9IHJlcXVpcmUoJy4vdGltZXItdmlldycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG5cbnZhciByZW5kZXJHYW1lUGFnZSA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICdnYW1lJztcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgeyB0cmFuc2xhdGVZIDogJys9MTcwcHgnIH0sIHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMzAwLCBlYXNpbmcgOiBbIDI1MCwgMCBdIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgY3RybC5yZWFkeSgpO1xuICAgIH0pO1xufTtcblxudmFyIHJlbmRlck91dCA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICBWZWxvY2l0eShlbC5jaGlsZHJlblswXSwgJ3JldmVyc2UnKS50aGVuKGN0cmwuZW5kR2FtZS5iaW5kKGN0cmwpKTtcbn07XG5cbnZhciByZW5kZXJRdWVzdGlvblVwID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIHZhciB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdxdWVzdGlvbi1udW1iZXInKSxcbiAgICBsaW1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xpbWl0JyksXG4gICAgcXVlc3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdjdXJyZW50LXF1ZXN0aW9uJyk7XG5cbiAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgIHsgZSA6IHRhcmdldCwgcCA6IHsgbGVmdCA6ICc1MHB4JywgdG9wIDogJzIwcHgnLCBmb250U2l6ZSA6ICcwLjlyZW0nIH0gfSxcbiAgICAgICAgeyBlIDogcXVlc3Rpb24sICBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJyB9LFxuICAgICAgICB7IGUgOiBsaW1pdCwgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZUluJywgbyA6IHsgY29tcGxldGUgOiBjdHJsLnN0YXJ0UXVlc3Rpb24uYmluZChjdHJsKSB9IH1cbiAgICBdO1xuXG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xufTtcblxudmFyIHJlbmRlckFuc3dlcnNPdXQgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgLy8gVmVsb2NpdHlcbiAgICB2YXIgdGFyZ2V0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Fuc3dlcicpLFxuICAgICAgICBmYWxzZUFuc3dlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqc19mYWxzeScpLFxuICAgICAgICBsaW1pdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2xpbWl0JyksXG4gICAgICAgIHF1ZXN0aW9uTnVtYmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncXVlc3Rpb24tbnVtYmVyJyksXG4gICAgICAgIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY3VycmVudC1xdWVzdGlvbicpO1xuXG4gICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICB7IGUgOiBmYWxzZUFuc3dlcnMsIHAgOiB7IG9wYWNpdHkgOiAwLjMgfSwgbyA6IHsgZHVyYXRpb24gOiA1MDAgfSB9LFxuICAgICAgICB7IGUgOiB0YXJnZXRzLCBwIDogJ3RyYW5zaXRpb24uYm91bmNlT3V0JywgbyA6IHsgZHVyYXRpb24gOiA1MDAsIGRlbGF5IDogMTUwMCB9IH0sXG4gICAgICAgIHsgZSA6IHF1ZXN0aW9uLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcE91dCcsIG8gOiB7IGR1cmF0aW9uIDogNTAwIH0gfSxcbiAgICAgICAgeyBlIDogbGltaXQsIHAgOiAnZmFkZU91dCcsIG8gOiB7IGR1cmF0aW9uIDogMjAwICwgY29tcGxldGUgOiBjdHJsLmFmdGVyRW5kUXVlc3Rpb24uYmluZChjdHJsKSB9IH1cbiAgICBdO1xuXG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xufTtcblxudmFyIHJlbmRlclN0YXJ0UXVlc3Rpb24gPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgLy8gU2hvdyB0aGUgcXVlc3Rpb25zXG4gICAgZWwuY2hpbGRyZW5bMF0uY2xhc3NMaXN0LmFkZCgnYmVnaW4nKTtcblxuICAgIC8vIGdldCBhbnN3ZXJzIGFuZCByZW1vdmUgd2VpcmQgaW5pdCBzdHlsZVxuICAgIHZhciBhbnN3ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYW5zd2Vycy1hcmVhJylbMF07XG4gICAgYW5zd2Vycy5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICBhbnN3ZXJzLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIFxuICAgIC8vIFNob3cgdGhlIGFuc3dlcnNcbiAgICB2YXIgdWwgPSBhbnN3ZXJzLmNoaWxkcmVuWzBdLFxuICAgICAgICBxdWVzdGlvbk51bWJlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3F1ZXN0aW9uLW51bWJlcicpLFxuICAgICAgICBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICAgIHsgZSA6IHVsLmNoaWxkcmVuLCBwIDogJ3RyYW5zaXRpb24uYm91bmNlSW4nLCBvIDogeyBzdGFnZ2VyIDogJzIwMG1zJywgY29tcGxldGUgOiByZW5kZXJRdWVzdGlvblVwLmJpbmQodGhpcywgY3RybCwgZWwpIH0gfVxuICAgICAgICBdO1xuXG4gICAgaWYoY3RybC5WTS5jdXJyZW50UXVlc3Rpb24oKSA+IDApIHNlcXVlbmNlLnVuc2hpZnQoeyBlIDogcXVlc3Rpb25OdW1iZXIsIHAgOiAncmV2ZXJzZScgfSk7XG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgIGN0cmwuVk0ucXVlc3Rpb25TaG93bih0cnVlKTtcbn07XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCl7XG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIC8vIERlY2lkZSB3aGF0IHRvIGRvIFxuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJlbmRlckdhbWVQYWdlKGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbmQgb2YgcXVlc3Rpb25cbiAgICAgICAgZWxzZSBpZihjdHJsLlZNLmVuZFF1ZXN0aW9uKCkpe1xuICAgICAgICAgICAgcmVuZGVyQW5zd2Vyc091dChjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2hvdyB0aGUgcXVlc3Rpb25cbiAgICAgICAgZWxzZSBpZighY3RybC5WTS5nYW1lT3ZlcigpICYmICFjdHJsLlZNLnF1ZXN0aW9uU2hvd24oKSl7XG4gICAgICAgICAgICByZW5kZXJTdGFydFF1ZXN0aW9uKGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFbmQgb2YgZ2FtZSBcbiAgICAgICAgZWxzZSBpZihjdHJsLlZNLmdhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgIHJlbmRlck91dChjdHJsLCBlbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNnYW1lLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5nYW1lLWhvbGRlcicsIHtcbiAgICAgICAgICAgIGNvbmZpZyA6IGFuaW1JblxuICAgICAgICB9LFtcbiAgICAgICAgICAgIG0oJ2hlYWRlci5nYW1lLWhlYWRlci5vdXQtdG9wLWZ1bGwnLCBbXG4gICAgICAgICAgICAgICAgdGltZXJWaWV3KGN0cmwsIGN0cmwuVk0udGltZXIoKSksXG4gICAgICAgICAgICAgICAgbSgnaDMuaW50cm8nLCAnR2V0IHJlYWR5JyksXG4gICAgICAgICAgICAgICAgbSgnaDMucXVlc3Rpb24tbnVtYmVyJywgXCJxdWVzdGlvbiBcIiArICgrY3RybC5WTS5jdXJyZW50UXVlc3Rpb24oKSArIDEpKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5jdXJyZW50LXF1ZXN0aW9uLm9wYXF1ZScsIGN0cmwuVk0ucXVlc3Rpb24oKS5xdWVzdGlvbkVsZW1lbnQoKSksXG4gICAgICAgICAgICAgICAgbSgnaDQubGltaXQub3BhcXVlJywgWydDaG9vc2UgJywgbSgnc3BhbicsIGN0cmwuVk0ucXVlc3Rpb24oKS5saW1pdCgpKV0pXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy5hbnN3ZXJzLWFyZWEnLCBbXG4gICAgICAgICAgICAgICAgbShcInVsXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5WTS5xdWVzdGlvbigpLmFuc3dlcnMoKS5tYXAoZnVuY3Rpb24oYW5zd2VyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFuc3dlclZpZXcoY3RybCwgYW5zd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBIYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzBdLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJywgbyA6IHsgZHVyYXRpb24gOiAzMDAsIGRlbGF5IDogMzAwLCBvcGFjaXR5IDogMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblsxXSwgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBJbicsIG8gOiB7IGR1cmF0aW9uIDogMzAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzJdLCBwIDogJ3RyYW5zaXRpb24uYm91bmNlSW4nLCAgbyA6IHsgZHVyYXRpb24gOiAzMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bM10sIHAgOiB7IG9wYWNpdHkgOiAxLCByb3RhdGVaIDogJy0yNScsIHJpZ2h0IDogLTUwIH0sIG8gOiB7IGR1cmF0aW9uIDogNTAwLCBlYXNpbmcgOiBbIDI1MCwgMTUgXSB9IH1cbiAgICAgICAgXTtcblxuICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJ2ludHJvJztcbiAgICAgICAgICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLmNoaWxkcmVuLCAndHJhbnNpdGlvbi5mYWRlT3V0JywgeyBzdGFnZ2VyIDogJzEwMG1zJyB9KS50aGVuKGN0cmwuc3RhcnRHYW1lKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgZXZlbnRzID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICBpZighaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdmFyIGhhbW1lcnRpbWUgPSBuZXcgSGFtbWVyKGVsKTtcbiAgICAgICAgICAgIGhhbW1lcnRpbWUub24oJ3RhcCcsIGN0cmwub25CZWdpbik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNpbnRyby1wYWdlJywgW1xuICAgICAgICBtKCcuaW50cm8taG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaDIub3BhcXVlJywgY3RybC5WTS50aXRsZSgpKSxcbiAgICAgICAgICAgIG0oJy5kZXNjcmlwdGlvbi5vcGFxdWUnLCBjdHJsLlZNLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgbSgnYS5iZWdpbi5vcGFxdWUnLCB7IGNvbmZpZzogZXZlbnRzIH0sICdiZWdpbicpLFxuICAgICAgICAgICAgbSgnLmJyYW5kLm9wYXF1ZS5vdXQtcmlnaHQtZmFyJywgeyBzdHlsZSA6IHsgYmFja2dyb3VuZEltYWdlIDogJ3VybCh7MH0pJy5yZXBsYWNlKCd7MH0nLCBjdHJsLlZNLmJyYW5kKCkpIH0gfSlcbiAgICAgICAgXSlcbiAgICBdKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9hZGluZzsiLCIvKiBHbG9iYWwgbW9kdWxlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgTG9hZGluZyA9IGZ1bmN0aW9uKGN0cmwpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwsIHsgdHJhbnNsYXRlWCA6ICcrPTEwMCUnIH0sIHsgZGVsYXkgOiAyMDAsIGR1cmF0aW9uIDogMzAwLCBlYXNpbmcgOiAnZWFzZScgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihjdHJsLlZNLmxvYWRlZCgpKSBWZWxvY2l0eShlbCwgXCJyZXZlcnNlXCIpLnRoZW4oY3RybC5vbmxvYWRlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG0oJyNsb2FkaW5nLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5tZXNzYWdlLWhvbGRlci5vdXQtbGVmdC1mdWxsJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaDMnLCAnTG9hZGluZyAnICsgY3RybC5WTS5wcm9ncmVzcygpICsgJyUnKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgdGltZXIpe1xuXG4gICAgdmFyIHJlbmRlclNjb3JlYm9hcmRJbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyZXN1bHRzJylbMF0sXG4gICAgICAgICAgICBzY29yZXNBcmVhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnc2NvcmVzJylbMF0sXG4gICAgICAgICAgICBzY29yZVRpdGxlID0gc2NvcmVzQXJlYS5jaGlsZHJlblswXSxcbiAgICAgICAgICAgIG1vdmVPbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vdmUtb24nKVswXSxcbiAgICAgICAgICAgIHNjb3JlcyA9IHNjb3Jlc0FyZWEuY2hpbGRyZW5bMV07XG5cbiAgICAgICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICAgICAgeyBlIDogcmVzdWx0LmNoaWxkcmVuLCBwIDogJ3RyYW5zaXRpb24uZXhwYW5kT3V0JywgbyA6IHsgZGVsYXkgOiAxNTAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IHNjb3JlVGl0bGUsIHAgOiAndHJhbnNpdGlvbi5mYWRlSW4nIH0sXG4gICAgICAgICAgICB7IGUgOiBzY29yZXMuY2hpbGRyZW4sIHAgOiAndHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdJbicsIG8gOiB7IHN0YWdnZXIgOiAyMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogbW92ZU9uLCBwIDogJ3RyYW5zaXRpb24uZmFkZUluJyB9XG4gICAgICAgIF07XG4gICAgICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbmRlclJlcGxheSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYnRuJyk7XG4gICAgICAgIFZlbG9jaXR5KGEsICdmYWRlSW4nLCB7IHN0YWdnZXIgOiAyMDAsIGNvbXBsZXRlIDogcmVuZGVyU2NvcmVib2FyZEluLmJpbmQodGhpcykgfSk7XG4gICAgfTtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZighaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAncmVzdWx0JztcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyZXN1bHRzJylbMF07XG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICAgICAgeyBlIDogcmVzdWx0LmNoaWxkcmVuWzBdLCBwIDogJ3RyYW5zaXRpb24ud2hpcmxJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMV0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMl0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicsIG8gOiB7IGNvbXBsZXRlIDogcmVuZGVyUmVwbGF5LmJpbmQodGhpcykgfSB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjcmVzdWx0LXBhZ2UnLCBbXG4gICAgICAgIG0oJy5yZXN1bHQtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnLnJlc3VsdHMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnJlc3VsdC1pbWFnZS5vcGFxdWUnLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKCcgKyBjdHJsLlZNLnJlc3VsdEltYWdlKCkgKyAnKScgfSB9KSxcbiAgICAgICAgICAgICAgICBtKCdoMS5yZXN1bHQub3BhcXVlJywgY3RybC5WTS5zY29yZSgpICsgJy8nICsgY3RybC5WTS5oaWdoU2NvcmUoKSksXG4gICAgICAgICAgICAgICAgbSgncC5vcGFxdWUnLCBjdHJsLlZNLm1lc3NhZ2UoKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnNjb3JlcycsIFtcbiAgICAgICAgICAgICAgICBtKCdoMy5vcGFxdWUnLCAnWW91ciBTY29yZXMnKSxcbiAgICAgICAgICAgICAgICBtKCdvbC5teS1zY29yZXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuVk0uc2NvcmVCb2FyZCgpLm1hcChmdW5jdGlvbihzLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gIChpID09PSAwKSA/ICdmaXJzdCcgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAgcy5pc0N1cnJlbnQgPyAnIGN1cnJlbnQnIDogJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaS5vcGFxdWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnNjb3JlLWl0ZW0nLCB7IGNsYXNzIDogY2xhc3NOYW1lIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcy5zY29yZSArICcgcG9pbnRzICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCBzLmZyaWVuZGx5VGltZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgncC5tb3ZlLW9uLm9wYXF1ZScsICdZb3Ugc2NvcmVkICcgKyBjdHJsLlZNLnNjb3JlKCkgKyAncHRzLCBHZXQgYWJvdmUgMTAgcHRzIHRvIG1vdmUgb250byBMZXZlbCAyLiBXZWxsIHlvdSB3b3VsZCBpZiB0aGVyZSB3YXMgYSBsZXZlbCAyLCBidXQgdGhlcmUgY291bGQgYmUuLi4uJyksXG4gICAgICAgICAgICBtKCdhLmJ0bi5yZXBsYXkub3BhcXVlW2hyZWY9XCIjL2dhbWVcIl0nLCAnVHJ5IEFnYWluJyksXG4gICAgICAgICAgICBtKCdhLmJ0bi5sZXZlbDIub3BhcXVlJywgJ0xldmVsIDInKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgdGltZXIpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKCF0aW1lcikgcmV0dXJuO1xuICAgICAgICBpZighdGltZXIuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6ICcxMDAlJyB9LCB7IGR1cmF0aW9uIDogdGltZXIudGltZSgpLCBlYXNpbmcgOiAnbGluZWFyJyB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3RybC5vblRpbWUoKTtcbiAgICAgICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6IDAgfSwgIHsgZHVyYXRpb24gOiAyMDAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbWVyLmlzQWN0aXZlKHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKFwiLnRpbWVyXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
