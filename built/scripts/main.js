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
	description : "Can you associate the celebrities with the shows in the time limit? Careful though, you will be deducted for an incorrect guess",
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
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : false },
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
			{ image : 'http://img-a.zeebox.com/images/z/861b18aa-152c-4ae0-9118-ffa05b79bc76.png', name : 'Wayne Knight', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/3a6eead3-90cc-406c-99e1-493923b3e8d0.png', name : 'Matthew Perry', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/40e8037e-12b2-44d3-9f84-71fe3de0bdaf.png', name : 'Michael Richards', correct : true },
			{ image : 'http://img-a.zeebox.com/images/z/1b59c445-8f3e-46bd-ad57-c15a73c7a68a.png', name : 'Paul Wasilewski', correct : false },
			{ image : 'http://img-a.zeebox.com/images/z/b3f91a63-e987-4ea7-81ab-586f930610ae.png', name : 'Jason Alexander', correct : true }
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
			{ image : 'http://img-a.zeebox.com/images/z/03833a81-7aa7-4c3b-884f-167277b19c24.png', name : 'Yvette Nicole Brown', correct : false },
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
	previousScores = _.without(items, _.findWhere(items, { score : score }));
	previousScores.push(newScore);
	this.previousScores(previousScores);

	// var howIdDid = _.indexOf(newScore) + 1

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
        limit = document.getElementsByClassName('limit'),
        questionNumber = document.getElementsByClassName('question-number'),
        question = document.getElementsByClassName('current-question');

    var sequence = [
        { e : targets, p : 'transition.bounceOut', o : { duration : 500 } },
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
            scores = document.getElementsByClassName('scores')[0].children[0];

        var sequence = [
            { e : result.children, p : 'transition.expandOut', o : { delay : 1000 } },
            { e : scores.children, p : 'transition.slideLeftBigIn', o : { stagger : 200 } }
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
                m('ol', [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWkuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvbG9hZGluZy1jb250cm9sbGVyLmpzIiwic3JjL3NjcmlwdHMvY29udHJvbGxlcnMvcmVzdWx0LWNvbnRyb2xsZXIuanMiLCJzcmMvc2NyaXB0cy9saWJzL2FwcC5qcyIsInNyYy9zY3JpcHRzL2xpYnMvdXRpbHMuanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvZ2FtZS1tb2RlbC5qcyIsInNyYy9zY3JpcHRzL21vZGVscy9nYW1lLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2ludHJvLXZtLmpzIiwic3JjL3NjcmlwdHMvbW9kZWxzL2xvYWRpbmctdm0uanMiLCJzcmMvc2NyaXB0cy9tb2RlbHMvcmVzdWx0LXZtLmpzIiwic3JjL3NjcmlwdHMvdmlld3MvYW5zd2VyLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9nYW1lLXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy9pbnRyby12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvbG9hZGluZy12aWV3LmpzIiwic3JjL3NjcmlwdHMvdmlld3MvcmVzdWx0LXZpZXcuanMiLCJzcmMvc2NyaXB0cy92aWV3cy90aW1lci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6dkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0gcmVxdWlyZSgnLi9saWJzL2FwcC5qcycpO1xuXG53aW5kb3cud2lkZ2V0VmVyc2lvbiA9IFwidjAuMC4wXCI7XG5cbnZhciBpbml0QXBwID0gZnVuY3Rpb24ocGFyYW1zKXtcblx0dmFyIGluc3RhbmNlID0gbmV3IEFwcCgpO1xufTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24oZXZlbnQpe1xuICAgLy9kbyB3b3JrXG4gICBpbml0QXBwKCk7XG59KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqXG4gICBWZWxvY2l0eSBVSSBQYWNrXG4qKioqKioqKioqKioqKioqKioqKioqL1xuXG4vKiBWZWxvY2l0eUpTLm9yZyBVSSBQYWNrICg1LjAuNCkuIChDKSAyMDE0IEp1bGlhbiBTaGFwaXJvLiBNSVQgQGxpY2Vuc2U6IGVuLndpa2lwZWRpYS5vcmcvd2lraS9NSVRfTGljZW5zZS4gUG9ydGlvbnMgY29weXJpZ2h0IERhbmllbCBFZGVuLCBDaHJpc3RpYW4gUHVjY2kuICovXG5cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAvKiBDb21tb25KUyBtb2R1bGUuICovXG4gICAgaWYgKHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIC8qIEFNRCBtb2R1bGUuICovXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyBcInZlbG9jaXR5XCIgXSwgZmFjdG9yeSk7XG4gICAgLyogQnJvd3NlciBnbG9iYWxzLiAqL1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoKTtcbiAgICB9XG59KGZ1bmN0aW9uKCkge1xucmV0dXJuIGZ1bmN0aW9uIChnbG9iYWwsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgLyoqKioqKioqKioqKipcbiAgICAgICAgQ2hlY2tzXG4gICAgKioqKioqKioqKioqKi9cblxuICAgIGlmICghZ2xvYmFsLlZlbG9jaXR5IHx8ICFnbG9iYWwuVmVsb2NpdHkuVXRpbGl0aWVzKSB7XG4gICAgICAgIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nKFwiVmVsb2NpdHkgVUkgUGFjazogVmVsb2NpdHkgbXVzdCBiZSBsb2FkZWQgZmlyc3QuIEFib3J0aW5nLlwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBWZWxvY2l0eSA9IGdsb2JhbC5WZWxvY2l0eSxcbiAgICAgICAgICAgICQgPSBWZWxvY2l0eS5VdGlsaXRpZXM7XG4gICAgfVxuXG4gICAgdmFyIHZlbG9jaXR5VmVyc2lvbiA9IFZlbG9jaXR5LnZlcnNpb24sXG4gICAgICAgIHJlcXVpcmVkVmVyc2lvbiA9IHsgbWFqb3I6IDEsIG1pbm9yOiAxLCBwYXRjaDogMCB9O1xuXG4gICAgZnVuY3Rpb24gZ3JlYXRlclNlbXZlciAocHJpbWFyeSwgc2Vjb25kYXJ5KSB7XG4gICAgICAgIHZhciB2ZXJzaW9uSW50cyA9IFtdO1xuXG4gICAgICAgIGlmICghcHJpbWFyeSB8fCAhc2Vjb25kYXJ5KSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgICQuZWFjaChbIHByaW1hcnksIHNlY29uZGFyeSBdLCBmdW5jdGlvbihpLCB2ZXJzaW9uT2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgdmVyc2lvbkludHNDb21wb25lbnRzID0gW107XG5cbiAgICAgICAgICAgICQuZWFjaCh2ZXJzaW9uT2JqZWN0LCBmdW5jdGlvbihjb21wb25lbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHZhbHVlLnRvU3RyaW5nKCkubGVuZ3RoIDwgNSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiMFwiICsgdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZlcnNpb25JbnRzQ29tcG9uZW50cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2ZXJzaW9uSW50cy5wdXNoKHZlcnNpb25JbnRzQ29tcG9uZW50cy5qb2luKFwiXCIpKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKHBhcnNlRmxvYXQodmVyc2lvbkludHNbMF0pID4gcGFyc2VGbG9hdCh2ZXJzaW9uSW50c1sxXSkpO1xuICAgIH1cblxuICAgIGlmIChncmVhdGVyU2VtdmVyKHJlcXVpcmVkVmVyc2lvbiwgdmVsb2NpdHlWZXJzaW9uKSl7XG4gICAgICAgIHZhciBhYm9ydEVycm9yID0gXCJWZWxvY2l0eSBVSSBQYWNrOiBZb3UgbmVlZCB0byB1cGRhdGUgVmVsb2NpdHkgKGpxdWVyeS52ZWxvY2l0eS5qcykgdG8gYSBuZXdlciB2ZXJzaW9uLiBWaXNpdCBodHRwOi8vZ2l0aHViLmNvbS9qdWxpYW5zaGFwaXJvL3ZlbG9jaXR5LlwiO1xuICAgICAgICBhbGVydChhYm9ydEVycm9yKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGFib3J0RXJyb3IpO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICBFZmZlY3QgUmVnaXN0cmF0aW9uXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogTm90ZTogUmVnaXN0ZXJVSSBpcyBhIGxlZ2FjeSBuYW1lLiAqL1xuICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0ID0gVmVsb2NpdHkuUmVnaXN0ZXJVSSA9IGZ1bmN0aW9uIChlZmZlY3ROYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIC8qIEFuaW1hdGUgdGhlIGV4cGFuc2lvbi9jb250cmFjdGlvbiBvZiB0aGUgZWxlbWVudHMnIHBhcmVudCdzIGhlaWdodCBmb3IgSW4vT3V0IGVmZmVjdHMuICovXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGVQYXJlbnRIZWlnaHQgKGVsZW1lbnRzLCBkaXJlY3Rpb24sIHRvdGFsRHVyYXRpb24sIHN0YWdnZXIpIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEhlaWdodERlbHRhID0gMCxcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAvKiBTdW0gdGhlIHRvdGFsIGhlaWdodCAoaW5jbHVkaW5nIHBhZGRpbmcgYW5kIG1hcmdpbikgb2YgYWxsIHRhcmdldGVkIGVsZW1lbnRzLiAqL1xuICAgICAgICAgICAgJC5lYWNoKGVsZW1lbnRzLm5vZGVUeXBlID8gWyBlbGVtZW50cyBdIDogZWxlbWVudHMsIGZ1bmN0aW9uKGksIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhZ2dlcikge1xuICAgICAgICAgICAgICAgICAgICAvKiBJbmNyZWFzZSB0aGUgdG90YWxEdXJhdGlvbiBieSB0aGUgc3VjY2Vzc2l2ZSBkZWxheSBhbW91bnRzIHByb2R1Y2VkIGJ5IHRoZSBzdGFnZ2VyIG9wdGlvbi4gKi9cbiAgICAgICAgICAgICAgICAgICAgdG90YWxEdXJhdGlvbiArPSBpICogc3RhZ2dlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgJC5lYWNoKFsgXCJoZWlnaHRcIiwgXCJwYWRkaW5nVG9wXCIsIFwicGFkZGluZ0JvdHRvbVwiLCBcIm1hcmdpblRvcFwiLCBcIm1hcmdpbkJvdHRvbVwiXSwgZnVuY3Rpb24oaSwgcHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHREZWx0YSArPSBwYXJzZUZsb2F0KFZlbG9jaXR5LkNTUy5nZXRQcm9wZXJ0eVZhbHVlKGVsZW1lbnQsIHByb3BlcnR5KSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyogQW5pbWF0ZSB0aGUgcGFyZW50IGVsZW1lbnQncyBoZWlnaHQgYWRqdXN0bWVudCAod2l0aCBhIHZhcnlpbmcgZHVyYXRpb24gbXVsdGlwbGllciBmb3IgYWVzdGhldGljIGJlbmVmaXRzKS4gKi9cbiAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSxcbiAgICAgICAgICAgICAgICB7IGhlaWdodDogKGRpcmVjdGlvbiA9PT0gXCJJblwiID8gXCIrXCIgOiBcIi1cIikgKyBcIj1cIiArIHRvdGFsSGVpZ2h0RGVsdGEgfSxcbiAgICAgICAgICAgICAgICB7IHF1ZXVlOiBmYWxzZSwgZWFzaW5nOiBcImVhc2UtaW4tb3V0XCIsIGR1cmF0aW9uOiB0b3RhbER1cmF0aW9uICogKGRpcmVjdGlvbiA9PT0gXCJJblwiID8gMC42IDogMSkgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIFJlZ2lzdGVyIGEgY3VzdG9tIHJlZGlyZWN0IGZvciBlYWNoIGVmZmVjdC4gKi9cbiAgICAgICAgVmVsb2NpdHkuUmVkaXJlY3RzW2VmZmVjdE5hbWVdID0gZnVuY3Rpb24gKGVsZW1lbnQsIHJlZGlyZWN0T3B0aW9ucywgZWxlbWVudHNJbmRleCwgZWxlbWVudHNTaXplLCBlbGVtZW50cywgcHJvbWlzZURhdGEpIHtcbiAgICAgICAgICAgIHZhciBmaW5hbEVsZW1lbnQgPSAoZWxlbWVudHNJbmRleCA9PT0gZWxlbWVudHNTaXplIC0gMSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZGVmYXVsdER1cmF0aW9uID0gcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24uY2FsbChlbGVtZW50cywgZWxlbWVudHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmRlZmF1bHREdXJhdGlvbiA9IHBhcnNlRmxvYXQocHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBJdGVyYXRlIHRocm91Z2ggZWFjaCBlZmZlY3QncyBjYWxsIGFycmF5LiAqL1xuICAgICAgICAgICAgZm9yICh2YXIgY2FsbEluZGV4ID0gMDsgY2FsbEluZGV4IDwgcHJvcGVydGllcy5jYWxscy5sZW5ndGg7IGNhbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGwgPSBwcm9wZXJ0aWVzLmNhbGxzW2NhbGxJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TWFwID0gY2FsbFswXSxcbiAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3REdXJhdGlvbiA9IChyZWRpcmVjdE9wdGlvbnMuZHVyYXRpb24gfHwgcHJvcGVydGllcy5kZWZhdWx0RHVyYXRpb24gfHwgMTAwMCksXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uUGVyY2VudGFnZSA9IGNhbGxbMV0sXG4gICAgICAgICAgICAgICAgICAgIGNhbGxPcHRpb25zID0gY2FsbFsyXSB8fCB7fSxcbiAgICAgICAgICAgICAgICAgICAgb3B0cyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgLyogQXNzaWduIHRoZSB3aGl0ZWxpc3RlZCBwZXItY2FsbCBvcHRpb25zLiAqL1xuICAgICAgICAgICAgICAgIG9wdHMuZHVyYXRpb24gPSByZWRpcmVjdER1cmF0aW9uICogKGR1cmF0aW9uUGVyY2VudGFnZSB8fCAxKTtcbiAgICAgICAgICAgICAgICBvcHRzLnF1ZXVlID0gcmVkaXJlY3RPcHRpb25zLnF1ZXVlIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgb3B0cy5lYXNpbmcgPSBjYWxsT3B0aW9ucy5lYXNpbmcgfHwgXCJlYXNlXCI7XG4gICAgICAgICAgICAgICAgb3B0cy5kZWxheSA9IHBhcnNlRmxvYXQoY2FsbE9wdGlvbnMuZGVsYXkpIHx8IDA7XG4gICAgICAgICAgICAgICAgb3B0cy5fY2FjaGVWYWx1ZXMgPSBjYWxsT3B0aW9ucy5fY2FjaGVWYWx1ZXMgfHwgdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8qIFNwZWNpYWwgcHJvY2Vzc2luZyBmb3IgdGhlIGZpcnN0IGVmZmVjdCBjYWxsLiAqL1xuICAgICAgICAgICAgICAgIGlmIChjYWxsSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLyogSWYgYSBkZWxheSB3YXMgcGFzc2VkIGludG8gdGhlIHJlZGlyZWN0LCBjb21iaW5lIGl0IHdpdGggdGhlIGZpcnN0IGNhbGwncyBkZWxheS4gKi9cbiAgICAgICAgICAgICAgICAgICAgb3B0cy5kZWxheSArPSAocGFyc2VGbG9hdChyZWRpcmVjdE9wdGlvbnMuZGVsYXkpIHx8IDApO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50c0luZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmJlZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIGEgYmVnaW4gY2FsbGJhY2sgb24gdGhlIGZpcnN0IGVmZmVjdCBjYWxsIHdpdGggdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHNldC4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvbnMuYmVnaW4gJiYgcmVkaXJlY3RPcHRpb25zLmJlZ2luLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBlZmZlY3ROYW1lLm1hdGNoKC8oSW58T3V0KSQvKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE1ha2UgXCJpblwiIHRyYW5zaXRpb25pbmcgZWxlbWVudHMgaW52aXNpYmxlIGltbWVkaWF0ZWx5IHNvIHRoYXQgdGhlcmUncyBubyBGT1VDIGJldHdlZW4gbm93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kIHRoZSBmaXJzdCBSQUYgdGljay4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKGRpcmVjdGlvbiAmJiBkaXJlY3Rpb25bMF0gPT09IFwiSW5cIikgJiYgcHJvcGVydHlNYXAub3BhY2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuZWFjaChlbGVtZW50cy5ub2RlVHlwZSA/IFsgZWxlbWVudHMgXSA6IGVsZW1lbnRzLCBmdW5jdGlvbihpLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5DU1Muc2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBcIm9wYWNpdHlcIiwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIE9ubHkgdHJpZ2dlciBhbmltYXRlUGFyZW50SGVpZ2h0KCkgaWYgd2UncmUgdXNpbmcgYW4gSW4vT3V0IHRyYW5zaXRpb24uICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5hbmltYXRlUGFyZW50SGVpZ2h0ICYmIGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlUGFyZW50SGVpZ2h0KGVsZW1lbnRzLCBkaXJlY3Rpb25bMF0sIHJlZGlyZWN0RHVyYXRpb24gKyBvcHRzLmRlbGF5LCByZWRpcmVjdE9wdGlvbnMuc3RhZ2dlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLyogSWYgdGhlIHVzZXIgaXNuJ3Qgb3ZlcnJpZGluZyB0aGUgZGlzcGxheSBvcHRpb24sIGRlZmF1bHQgdG8gXCJhdXRvXCIgZm9yIFwiSW5cIi1zdWZmaXhlZCB0cmFuc2l0aW9ucy4gKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLmRpc3BsYXkgIT09IHVuZGVmaW5lZCAmJiByZWRpcmVjdE9wdGlvbnMuZGlzcGxheSAhPT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzLmRpc3BsYXkgPSByZWRpcmVjdE9wdGlvbnMuZGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoL0luJC8udGVzdChlZmZlY3ROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIElubGluZSBlbGVtZW50cyBjYW5ub3QgYmUgc3ViamVjdGVkIHRvIHRyYW5zZm9ybXMsIHNvIHdlIHN3aXRjaCB0aGVtIHRvIGlubGluZS1ibG9jay4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVmYXVsdERpc3BsYXkgPSBWZWxvY2l0eS5DU1MuVmFsdWVzLmdldERpc3BsYXlUeXBlKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMuZGlzcGxheSA9IChkZWZhdWx0RGlzcGxheSA9PT0gXCJpbmxpbmVcIikgPyBcImlubGluZS1ibG9ja1wiIDogZGVmYXVsdERpc3BsYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgJiYgcmVkaXJlY3RPcHRpb25zLnZpc2liaWxpdHkgIT09IFwiaGlkZGVuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHMudmlzaWJpbGl0eSA9IHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLyogU3BlY2lhbCBwcm9jZXNzaW5nIGZvciB0aGUgbGFzdCBlZmZlY3QgY2FsbC4gKi9cbiAgICAgICAgICAgICAgICBpZiAoY2FsbEluZGV4ID09PSBwcm9wZXJ0aWVzLmNhbGxzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLyogQXBwZW5kIHByb21pc2UgcmVzb2x2aW5nIG9udG8gdGhlIHVzZXIncyByZWRpcmVjdCBjYWxsYmFjay4gKi9cbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gaW5qZWN0RmluYWxDYWxsYmFja3MgKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChyZWRpcmVjdE9wdGlvbnMuZGlzcGxheSA9PT0gdW5kZWZpbmVkIHx8IHJlZGlyZWN0T3B0aW9ucy5kaXNwbGF5ID09PSBcIm5vbmVcIikgJiYgL091dCQvLnRlc3QoZWZmZWN0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLmVhY2goZWxlbWVudHMubm9kZVR5cGUgPyBbIGVsZW1lbnRzIF0gOiBlbGVtZW50cywgZnVuY3Rpb24oaSwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eS5DU1Muc2V0UHJvcGVydHlWYWx1ZShlbGVtZW50LCBcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvbnMuY29tcGxldGUgJiYgcmVkaXJlY3RPcHRpb25zLmNvbXBsZXRlLmNhbGwoZWxlbWVudHMsIGVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb21pc2VEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZURhdGEucmVzb2x2ZXIoZWxlbWVudHMgfHwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvcHRzLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydGllcy5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHJlc2V0UHJvcGVydHkgaW4gcHJvcGVydGllcy5yZXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzZXRWYWx1ZSA9IHByb3BlcnRpZXMucmVzZXRbcmVzZXRQcm9wZXJ0eV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogRm9ybWF0IGVhY2ggbm9uLWFycmF5IHZhbHVlIGluIHRoZSByZXNldCBwcm9wZXJ0eSBtYXAgdG8gWyB2YWx1ZSwgdmFsdWUgXSBzbyB0aGF0IGNoYW5nZXMgYXBwbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1tZWRpYXRlbHkgYW5kIERPTSBxdWVyeWluZyBpcyBhdm9pZGVkICh2aWEgZm9yY2VmZWVkaW5nKS4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogTm90ZTogRG9uJ3QgZm9yY2VmZWVkIGhvb2tzLCBvdGhlcndpc2UgdGhlaXIgaG9vayByb290cyB3aWxsIGJlIGRlZmF1bHRlZCB0byB0aGVpciBudWxsIHZhbHVlcy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFZlbG9jaXR5LkNTUy5Ib29rcy5yZWdpc3RlcmVkW3Jlc2V0UHJvcGVydHldID09PSB1bmRlZmluZWQgJiYgKHR5cGVvZiByZXNldFZhbHVlID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiByZXNldFZhbHVlID09PSBcIm51bWJlclwiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSA9IFsgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSwgcHJvcGVydGllcy5yZXNldFtyZXNldFByb3BlcnR5XSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogU28gdGhhdCB0aGUgcmVzZXQgdmFsdWVzIGFyZSBhcHBsaWVkIGluc3RhbnRseSB1cG9uIHRoZSBuZXh0IHJBRiB0aWNrLCB1c2UgYSB6ZXJvIGR1cmF0aW9uIGFuZCBwYXJhbGxlbCBxdWV1ZWluZy4gKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzZXRPcHRpb25zID0geyBkdXJhdGlvbjogMCwgcXVldWU6IGZhbHNlIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBTaW5jZSB0aGUgcmVzZXQgb3B0aW9uIHVzZXMgdXAgdGhlIGNvbXBsZXRlIGNhbGxiYWNrLCB3ZSB0cmlnZ2VyIHRoZSB1c2VyJ3MgY29tcGxldGUgY2FsbGJhY2sgYXQgdGhlIGVuZCBvZiBvdXJzLiAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRPcHRpb25zLmNvbXBsZXRlID0gaW5qZWN0RmluYWxDYWxsYmFja3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkuYW5pbWF0ZShlbGVtZW50LCBwcm9wZXJ0aWVzLnJlc2V0LCByZXNldE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogT25seSB0cmlnZ2VyIHRoZSB1c2VyJ3MgY29tcGxldGUgY2FsbGJhY2sgb24gdGhlIGxhc3QgZWZmZWN0IGNhbGwgd2l0aCB0aGUgbGFzdCBlbGVtZW50IGluIHRoZSBzZXQuICovXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmFsRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdEZpbmFsQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0T3B0aW9ucy52aXNpYmlsaXR5ID09PSBcImhpZGRlblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRzLnZpc2liaWxpdHkgPSByZWRpcmVjdE9wdGlvbnMudmlzaWJpbGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFZlbG9jaXR5LmFuaW1hdGUoZWxlbWVudCwgcHJvcGVydHlNYXAsIG9wdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8qIFJldHVybiB0aGUgVmVsb2NpdHkgb2JqZWN0IHNvIHRoYXQgUmVnaXN0ZXJVSSBjYWxscyBjYW4gYmUgY2hhaW5lZC4gKi9cbiAgICAgICAgcmV0dXJuIFZlbG9jaXR5O1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgUGFja2FnZWQgRWZmZWN0c1xuICAgICoqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIC8qIEV4dGVybmFsaXplIHRoZSBwYWNrYWdlZEVmZmVjdHMgZGF0YSBzbyB0aGF0IHRoZXkgY2FuIG9wdGlvbmFsbHkgYmUgbW9kaWZpZWQgYW5kIHJlLXJlZ2lzdGVyZWQuICovXG4gICAgLyogU3VwcG9ydDogPD1JRTg6IENhbGxvdXRzIHdpbGwgaGF2ZSBubyBlZmZlY3QsIGFuZCB0cmFuc2l0aW9ucyB3aWxsIHNpbXBseSBmYWRlIGluL291dC4gSUU5L0FuZHJvaWQgMi4zOiBNb3N0IGVmZmVjdHMgYXJlIGZ1bGx5IHN1cHBvcnRlZCwgdGhlIHJlc3QgZmFkZSBpbi9vdXQuIEFsbCBvdGhlciBicm93c2VyczogZnVsbCBzdXBwb3J0LiAqL1xuICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0cyA9XG4gICAgICAgIHtcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuYm91bmNlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDU1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTMwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IC0xNSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogMCB9LCAwLjI1IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5zaGFrZVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMTEgfSwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMSB9LCAwLjEyNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogMCB9LCAwLjEyNSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQuZmxhc2hcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogMTEwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbk91dFF1YWRcIiwgMSBdIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgXCJlYXNlSW5PdXRRdWFkXCIgXSB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVhZFwiIF0gfSwgMC4yNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCBcImVhc2VJbk91dFF1YWRcIiBdIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJjYWxsb3V0LnB1bHNlXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgyNSxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xIH0sIDAuNTAsIHsgZWFzaW5nOiBcImVhc2VJbkV4cG9cIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9LCAwLjUwIF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwiY2FsbG91dC5zd2luZ1wiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDE1IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyByb3RhdGVaOiA1IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IC01IH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHJvdGF0ZVo6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcImNhbGxvdXQudGFkYVwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOSwgc2NhbGVZOiAwLjksIHJvdGF0ZVo6IC0zIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMS4xLCBzY2FsZVk6IDEuMSwgcm90YXRlWjogMyB9LCAwLjEwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDEuMSwgc2NhbGVZOiAxLjEsIHJvdGF0ZVo6IC0zIH0sIDAuMTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyBcInJldmVyc2VcIiwgMC4xMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNjYWxlWDogMSwgc2NhbGVZOiAxLCByb3RhdGVaOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmFkZUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0gfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mYWRlT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0gfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFhJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVZOiBbIDAsIC01NSBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcFhPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgcm90YXRlWTogNTUgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWUluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHJvdGF0ZVg6IFsgMCwgLTQ1IF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwWU91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCByb3RhdGVYOiAyNSB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5mbGlwQm91bmNlWEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDkwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjcyNSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVZOiBbIC0xMCwgOTAgXSB9LCAwLjUwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAwLjgwLCByb3RhdGVZOiAxMCB9LCAwLjI1IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiAxLCByb3RhdGVZOiAwIH0sIDAuMjUgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VYT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLjksIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgNDAwLCA0MDAgXSwgcm90YXRlWTogLTEwIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAsIHJvdGF0ZVk6IDkwIH0sIDAuNTAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHJvdGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmZsaXBCb3VuY2VZSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuNzI1LCAwIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDQwMCwgNDAwIF0sIHJvdGF0ZVg6IFsgLTEwLCA5MCBdIH0sIDAuNTAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDAuODAsIHJvdGF0ZVg6IDEwIH0sIDAuMjUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IDEsIHJvdGF0ZVg6IDAgfSwgMC4yNSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZmxpcEJvdW5jZVlPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAuOSwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA0MDAsIDQwMCBdLCByb3RhdGVYOiAtMTUgfSwgMC41MCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogMCwgcm90YXRlWDogOTAgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgcm90YXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc3dvb3BJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiMTAwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHNjYWxlWDogWyAxLCAwIF0sIHNjYWxlWTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgLTcwMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc3dvb3BPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjEwMCVcIiBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCBzY2FsZVg6IDAsIHNjYWxlWTogMCwgdHJhbnNsYXRlWDogLTcwMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHNjYWxlWDogMSwgc2NhbGVZOiAxLCB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMy4gKEZhZGVzIGFuZCBzY2FsZXMgb25seS4pICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ud2hpcmxJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogWyAxLCAwIF0sIHNjYWxlWTogWyAxLCAwIF0sIHJvdGF0ZVk6IFsgMCwgMTYwIF0gfSwgMSwgeyBlYXNpbmc6IFwiZWFzZUluT3V0U2luZVwiIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMy4gKEZhZGVzIGFuZCBzY2FsZXMgb25seS4pICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ud2hpcmxPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluT3V0UXVpbnRcIiwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMCwgc2NhbGVZOiAwLCByb3RhdGVZOiAxNjAgfSwgMSwgeyBlYXNpbmc6IFwic3dpbmdcIiB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2hyaW5rSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMS41IF0sIHNjYWxlWTogWyAxLCAxLjUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNocmlua091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA2MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIFwiNTAlXCIsIFwiNTAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHNjYWxlWDogMS4zLCBzY2FsZVk6IDEuMywgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHNjYWxlWDogMSwgc2NhbGVZOiAxIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uZXhwYW5kSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IFsgMSwgMC42MjUgXSwgc2NhbGVZOiBbIDEsIDAuNjI1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5leHBhbmRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjUwJVwiLCBcIjUwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCI1MCVcIiwgXCI1MCVcIiBdLCBzY2FsZVg6IDAuNSwgc2NhbGVZOiAwLjUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCBzY2FsZVg6IFsgMS4wNSwgMC4zIF0sIHNjYWxlWTogWyAxLjA1LCAwLjMgXSB9LCAwLjQwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzY2FsZVg6IDAuOSwgc2NhbGVZOiAwLjksIHRyYW5zbGF0ZVo6IDAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLCBzY2FsZVk6IDEgfSwgMC41MCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAwLjk1LCBzY2FsZVk6IDAuOTUgfSwgMC4zNSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgc2NhbGVYOiAxLjEsIHNjYWxlWTogMS4xLCB0cmFuc2xhdGVaOiAwIH0sIDAuMzUgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCBzY2FsZVg6IDAuMywgc2NhbGVZOiAwLjMgfSwgMC4zMCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyBzY2FsZVg6IDEsIHNjYWxlWTogMSB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VVcEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgLTMwLCAxMDAwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAxMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDEwMDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDIwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWTogLTEwMDAgfSwgMC44MCBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2xhdGVZOiBbIDMwLCAtMTAwMCBdIH0sIDAuNjAsIHsgZWFzaW5nOiBcImVhc2VPdXRDaXJjXCIgfSBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogLTEwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVk6IDAgfSwgMC4yMCBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIEFuaW1hdGUuY3NzICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uYm91bmNlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAtMjAgfSwgMC4yMCBdLFxuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCBcImVhc2VJbkNpcmNcIiwgMSBdLCB0cmFuc2xhdGVZOiAxMDAwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAzMCwgLTEyNTAgXSB9LCAwLjYwLCB7IGVhc2luZzogXCJlYXNlT3V0Q2lyY1wiIH0gXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHRyYW5zbGF0ZVg6IC0xMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAzMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIFwiZWFzZUluQ2lyY1wiLCAxIF0sIHRyYW5zbGF0ZVg6IC0xMjUwIH0sIDAuODAgXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogQW5pbWF0ZS5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5ib3VuY2VSaWdodEluXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgLTMwLCAxMjUwIF0gfSwgMC42MCwgeyBlYXNpbmc6IFwiZWFzZU91dENpcmNcIiB9IF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAxMCB9LCAwLjIwIF0sXG4gICAgICAgICAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVYOiAwIH0sIDAuMjAgXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBBbmltYXRlLmNzcyAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLmJvdW5jZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgdHJhbnNsYXRlWDogLTMwIH0sIDAuMjAgXSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgXCJlYXNlSW5DaXJjXCIsIDEgXSwgdHJhbnNsYXRlWDogMTI1MCB9LCAwLjgwIF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAyMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAtMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVEb3duSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWTogWyAwLCAtMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVZOiAyMCwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zbGF0ZVk6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZUxlZnRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtMjAgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogLTIwLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWDogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAyMCBdLCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodE91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiAxMDUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogMjAsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVVcEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlVXBCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogLTc1LCB0cmFuc2xhdGVaOiAwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNsYXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlRG93bkJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVk6IFsgMCwgLTc1IF0sIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5zbGlkZURvd25CaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWTogNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVZOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVMZWZ0QmlnSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNsYXRlWDogWyAwLCAtNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlTGVmdEJpZ091dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA3NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2xhdGVYOiAtNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInRyYW5zaXRpb24uc2xpZGVSaWdodEJpZ0luXCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDgwMCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAxLCAwIF0sIHRyYW5zbGF0ZVg6IFsgMCwgNzUgXSwgdHJhbnNsYXRlWjogMCB9IF1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnNsaWRlUmlnaHRCaWdPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNsYXRlWDogNzUsIHRyYW5zbGF0ZVo6IDAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2xhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVVwSW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogODAwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgODAwLCA4MDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyAwLCAwIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHJvdGF0ZVg6IFsgMCwgLTE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVVwT3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDg1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDgwMCwgODAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgMCwgMCBdLCB0cmFuc2Zvcm1PcmlnaW5ZOiBbIFwiMTAwJVwiLCBcIjEwMCVcIiBdLCByb3RhdGVYOiAtMTgwIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIsIHJvdGF0ZVg6IDAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZURvd25JblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4MDAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVg6IFsgMCwgMTgwIF0gfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlRG93bk91dFwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA4NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMCwgMSBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyA4MDAsIDgwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVg6IDE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVYOiAwIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKiBNYWdpYy5jc3MgKi9cbiAgICAgICAgICAgIC8qIFN1cHBvcnQ6IExvc2VzIHJvdGF0aW9uIGluIElFOS9BbmRyb2lkIDIuMyAoZmFkZXMgb25seSkuICovXG4gICAgICAgICAgICBcInRyYW5zaXRpb24ucGVyc3BlY3RpdmVMZWZ0SW5cIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDEsIDAgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IFsgMCwgLTE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZUxlZnRPdXRcIjoge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREdXJhdGlvbjogOTUwLFxuICAgICAgICAgICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICAgICAgICAgIFsgeyBvcGFjaXR5OiBbIDAsIDEgXSwgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IFsgMjAwMCwgMjAwMCBdLCB0cmFuc2Zvcm1PcmlnaW5YOiBbIDAsIDAgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IC0xODAgfSBdXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNldDogeyB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogMCwgdHJhbnNmb3JtT3JpZ2luWDogXCI1MCVcIiwgdHJhbnNmb3JtT3JpZ2luWTogXCI1MCVcIiwgcm90YXRlWTogMCB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyogTWFnaWMuY3NzICovXG4gICAgICAgICAgICAvKiBTdXBwb3J0OiBMb3NlcyByb3RhdGlvbiBpbiBJRTkvQW5kcm9pZCAyLjMgKGZhZGVzIG9ubHkpLiAqL1xuICAgICAgICAgICAgXCJ0cmFuc2l0aW9uLnBlcnNwZWN0aXZlUmlnaHRJblwiOiB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdER1cmF0aW9uOiA5NTAsXG4gICAgICAgICAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgICAgICAgICAgWyB7IG9wYWNpdHk6IFsgMSwgMCBdLCB0cmFuc2Zvcm1QZXJzcGVjdGl2ZTogWyAyMDAwLCAyMDAwIF0sIHRyYW5zZm9ybU9yaWdpblg6IFsgXCIxMDAlXCIsIFwiMTAwJVwiIF0sIHRyYW5zZm9ybU9yaWdpblk6IFsgMCwgMCBdLCByb3RhdGVZOiBbIDAsIDE4MCBdIH0gXVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmVzZXQ6IHsgdHJhbnNmb3JtUGVyc3BlY3RpdmU6IDAsIHRyYW5zZm9ybU9yaWdpblg6IFwiNTAlXCIsIHRyYW5zZm9ybU9yaWdpblk6IFwiNTAlXCIgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qIE1hZ2ljLmNzcyAqL1xuICAgICAgICAgICAgLyogU3VwcG9ydDogTG9zZXMgcm90YXRpb24gaW4gSUU5L0FuZHJvaWQgMi4zIChmYWRlcyBvbmx5KS4gKi9cbiAgICAgICAgICAgIFwidHJhbnNpdGlvbi5wZXJzcGVjdGl2ZVJpZ2h0T3V0XCI6IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RHVyYXRpb246IDk1MCxcbiAgICAgICAgICAgICAgICBjYWxsczogW1xuICAgICAgICAgICAgICAgICAgICBbIHsgb3BhY2l0eTogWyAwLCAxIF0sIHRyYW5zZm9ybVBlcnNwZWN0aXZlOiBbIDIwMDAsIDIwMDAgXSwgdHJhbnNmb3JtT3JpZ2luWDogWyBcIjEwMCVcIiwgXCIxMDAlXCIgXSwgdHJhbnNmb3JtT3JpZ2luWTogWyAwLCAwIF0sIHJvdGF0ZVk6IDE4MCB9IF1cbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc2V0OiB7IHRyYW5zZm9ybVBlcnNwZWN0aXZlOiAwLCB0cmFuc2Zvcm1PcmlnaW5YOiBcIjUwJVwiLCB0cmFuc2Zvcm1PcmlnaW5ZOiBcIjUwJVwiLCByb3RhdGVZOiAwIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgIC8qIFJlZ2lzdGVyIHRoZSBwYWNrYWdlZCBlZmZlY3RzLiAqL1xuICAgIGZvciAodmFyIGVmZmVjdE5hbWUgaW4gVmVsb2NpdHkuUmVnaXN0ZXJFZmZlY3QucGFja2FnZWRFZmZlY3RzKSB7XG4gICAgICAgIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0KGVmZmVjdE5hbWUsIFZlbG9jaXR5LlJlZ2lzdGVyRWZmZWN0LnBhY2thZ2VkRWZmZWN0c1tlZmZlY3ROYW1lXSk7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKlxuICAgICAgIFNlcXVlbmNlIFJ1bm5pbmdcbiAgICAqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgLyogTm90ZTogU2VxdWVuY2UgY2FsbHMgbXVzdCB1c2UgVmVsb2NpdHkncyBzaW5nbGUtb2JqZWN0IGFyZ3VtZW50cyBzeW50YXguICovXG4gICAgVmVsb2NpdHkuUnVuU2VxdWVuY2UgPSBmdW5jdGlvbiAob3JpZ2luYWxTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgc2VxdWVuY2UgPSAkLmV4dGVuZCh0cnVlLCBbXSwgb3JpZ2luYWxTZXF1ZW5jZSk7XG5cbiAgICAgICAgaWYgKHNlcXVlbmNlLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICQuZWFjaChzZXF1ZW5jZS5yZXZlcnNlKCksIGZ1bmN0aW9uKGksIGN1cnJlbnRDYWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRDYWxsID0gc2VxdWVuY2VbaSArIDFdO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5leHRDYWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIFBhcmFsbGVsIHNlcXVlbmNlIGNhbGxzIChpbmRpY2F0ZWQgdmlhIHNlcXVlbmNlUXVldWU6ZmFsc2UpIGFyZSB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgaW4gdGhlIHByZXZpb3VzIGNhbGwncyBiZWdpbiBjYWxsYmFjay4gT3RoZXJ3aXNlLCBjaGFpbmVkIGNhbGxzIGFyZSBub3JtYWxseSB0cmlnZ2VyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgaW4gdGhlIHByZXZpb3VzIGNhbGwncyBjb21wbGV0ZSBjYWxsYmFjay4gKi9cbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYWxsT3B0aW9ucyA9IGN1cnJlbnRDYWxsLm8gfHwgY3VycmVudENhbGwub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRDYWxsT3B0aW9ucyA9IG5leHRDYWxsLm8gfHwgbmV4dENhbGwub3B0aW9ucztcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltaW5nID0gKGN1cnJlbnRDYWxsT3B0aW9ucyAmJiBjdXJyZW50Q2FsbE9wdGlvbnMuc2VxdWVuY2VRdWV1ZSA9PT0gZmFsc2UpID8gXCJiZWdpblwiIDogXCJjb21wbGV0ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tPcmlnaW5hbCA9IG5leHRDYWxsT3B0aW9ucyAmJiBuZXh0Q2FsbE9wdGlvbnNbdGltaW5nXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zW3RpbWluZ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXh0Q2FsbEVsZW1lbnRzID0gbmV4dENhbGwuZSB8fCBuZXh0Q2FsbC5lbGVtZW50cztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IG5leHRDYWxsRWxlbWVudHMubm9kZVR5cGUgPyBbIG5leHRDYWxsRWxlbWVudHMgXSA6IG5leHRDYWxsRWxlbWVudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrT3JpZ2luYWwgJiYgY2FsbGJhY2tPcmlnaW5hbC5jYWxsKGVsZW1lbnRzLCBlbGVtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBWZWxvY2l0eShjdXJyZW50Q2FsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dENhbGwubykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGwubyA9ICQuZXh0ZW5kKHt9LCBuZXh0Q2FsbE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dENhbGwub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBuZXh0Q2FsbE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlcXVlbmNlLnJldmVyc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFZlbG9jaXR5KHNlcXVlbmNlWzBdKTtcbiAgICB9O1xufSgod2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG8gfHwgd2luZG93KSwgd2luZG93LCBkb2N1bWVudCk7XG59KSk7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdGdhbWVWaWV3TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLXZtJyk7XG5cbnZhciBHYW1lQ29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgZ2FtZVZpZXdNb2RlbCgpO1xuXHR0aGlzLlZNLmluaXQoKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbigpe1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5WTS5zdGFydEdhbWUoKTtcblx0XHRtLnJlZHJhdygpO1xuXHR9LmJpbmQodGhpcyksIDEwMDApO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uKGFucyl7XG5cdGlmKHRoaXMuVk0ubG9ja2VkKCkpIHJldHVybjtcblxuXHR2YXIgYW5zd2VySXNTZWxlY3RlZCA9IGFucy5zZWxlY3RlZCgpO1xuXHRpZih0aGlzLlZNLnF1ZXN0aW9uKCkuZ3Vlc3NMaW1pdFJlYWNoZWQoKSAmJiAhYW5zd2VySXNTZWxlY3RlZCl7XG5cdFx0YW5zLnRvZ2dsZVJlamVjdGVkKHRydWUpO1xuXHR9IGVsc2Uge1xuXHRcdGFucy5zZWxlY3RlZCghYW5zLnNlbGVjdGVkKCkpO1xuXHRcdGFucy50b2dnbGVkKHRydWUpO1xuXHRcdC8vIGNvdW50IHRoZSBndWVzc2VzIGFnYWluXG5cdFx0dGhpcy5WTS5xdWVzdGlvbigpLmNvdW50R3Vlc3MoKTtcblx0fVxuXHRtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uVGltZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5sb2NrZWQodHJ1ZSk7XG4gICAgdGhpcy5WTS5lbmRRdWVzdGlvbih0cnVlKTtcbiAgICBtLnJlZHJhdygpO1xufTtcblxuR2FtZUNvbnRyb2xsZXIucHJvdG90eXBlLmFmdGVyRW5kUXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuVk0uc3RvcFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbiAgICB0aGlzLlZNLm5leHRRdWVzdGlvbigpO1xuICAgIG0ucmVkcmF3KCk7XG59O1xuXG5HYW1lQ29udHJvbGxlci5wcm90b3R5cGUuc3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5WTS5zdGFydFF1ZXN0aW9uKCk7XG4gICAgbS5yZWRyYXcoKTtcbn07XG5cbkdhbWVDb250cm9sbGVyLnByb3RvdHlwZS5lbmRHYW1lID0gZnVuY3Rpb24oKXtcblx0dGhpcy5WTS51cGRhdGVTY29yZSgpO1xuXHRtLnJvdXRlKFwiL3Jlc3VsdFwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZUNvbnRyb2xsZXI7IiwiLyogZ2xvYmFsIG0gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdGludHJvVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvaW50cm8tdm0nKTtcblxudmFyIEludHJvQ29udHJvbGxlciA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuVk0gPSBuZXcgaW50cm9WaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cbkludHJvQ29udHJvbGxlci5wcm90b3R5cGUub25CZWdpbiA9IGZ1bmN0aW9uKCl7XG5cdG0ucmVkcmF3KCk7XG59O1xuXG5JbnRyb0NvbnRyb2xsZXIucHJvdG90eXBlLnN0YXJ0R2FtZSA9IGZ1bmN0aW9uKCl7XG5cdG0ucm91dGUoXCIvZ2FtZVwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50cm9Db250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRsb2FkaW5nVmlld01vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvbG9hZGluZy12bScpO1xuXG52YXIgTG9hZGluZ0NvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IGxvYWRpbmdWaWV3TW9kZWwoKTtcblx0dGhpcy5WTS5pbml0KCk7XG59O1xuXG4vKlxuXHRQdWJsaWMgTWVtYmVyc1xuKi9cbkxvYWRpbmdDb250cm9sbGVyLnByb3RvdHlwZS5vbmxvYWRlZCA9IGZ1bmN0aW9uKCl7XG5cdG0ucm91dGUoXCIvaW50cm9cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdDb250cm9sbGVyOyIsIi8qIGdsb2JhbCBtICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRyZXN1bHRWaWV3TW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9yZXN1bHQtdm0nKTtcblxudmFyIFJlc3VsdENvbnRyb2xsZXIgPSBmdW5jdGlvbigpe1xuXHR0aGlzLlZNID0gbmV3IHJlc3VsdFZpZXdNb2RlbCgpO1xuXHR0aGlzLlZNLmluaXQoKTtcbn07XG5cbi8qXG5cdFB1YmxpYyBNZW1iZXJzXG4qL1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0Q29udHJvbGxlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKSxcblx0diA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUvdmVsb2NpdHkudWknKSxcblx0Z2FtZUNvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9nYW1lLWNvbnRyb2xsZXInKSxcblx0Z2FtZVZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9nYW1lLXZpZXcnKSxcblx0cmVzdWx0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4uL2NvbnRyb2xsZXJzL3Jlc3VsdC1jb250cm9sbGVyJyksXG5cdHJlc3VsdFZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9yZXN1bHQtdmlldycpLFxuXHRpbnRyb0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9pbnRyby1jb250cm9sbGVyJyksXG5cdGludHJvVmlldyA9IHJlcXVpcmUoJy4uL3ZpZXdzL2ludHJvLXZpZXcnKSxcblx0bG9hZGluZ0NvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9jb250cm9sbGVycy9sb2FkaW5nLWNvbnRyb2xsZXInKSxcblx0bG9hZGluZ1ZpZXcgPSByZXF1aXJlKCcuLi92aWV3cy9sb2FkaW5nLXZpZXcnKTtcblxudmFyIGFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKXtcblx0Ly9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxuXHR2YXIgYXBwID0ge1xuXHRcdGxvYWRpbmcgOiB7IGNvbnRyb2xsZXI6IGxvYWRpbmdDb250cm9sbGVyLCB2aWV3OiBsb2FkaW5nVmlldyB9LFxuXHRcdGludHJvICAgOiB7IGNvbnRyb2xsZXI6IGludHJvQ29udHJvbGxlciwgICB2aWV3OiBpbnRyb1ZpZXcgfSxcblx0XHRnYW1lXHQ6IHsgY29udHJvbGxlcjogZ2FtZUNvbnRyb2xsZXIsIHZpZXc6IGdhbWVWaWV3IH0sXG5cdFx0cmVzdWx0ICA6IHsgY29udHJvbGxlcjogcmVzdWx0Q29udHJvbGxlciwgdmlldzogcmVzdWx0VmlldyB9LFxuXHR9XG5cblx0bS5yb3V0ZS5tb2RlID0gXCJoYXNoXCI7XG5cblx0bS5yb3V0ZShkb2N1bWVudC5ib2R5LCBcIi9cIiwge1xuXHQgICAgXCJcIlx0XHQgOiBhcHAubG9hZGluZyxcblx0ICAgIFwiL2ludHJvXCIgOiBhcHAuaW50cm8sXG5cdCAgICBcIi9nYW1lXCIgIDogYXBwLmdhbWUsXG5cdCAgICBcIi9yZXN1bHRcIjogYXBwLnJlc3VsdFxuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbGljYXRpb247IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuXHRtID0gcmVxdWlyZSgnbWl0aHJpbCcpO1xuXG5cbnZhciBfbnVtYmVyZWRTdHJpbmcgPSBmdW5jdGlvbih0YXJnZXQpe1xuXHR2YXIgaW5kZXggPSAwO1xuXHRyZXR1cm4gdGFyZ2V0LnJlcGxhY2UoL18oLio/KV8vZywgZnVuY3Rpb24gKG1hdGNoLCB0ZXh0LCBudW1iZXIpIHtcbiAgICAgICAgdmFyIHJlcyA9ICd7JyArIGluZGV4ICsgJ30nO1xuICAgICAgICBpbmRleCsrXG4gICAgICAgIHJldHVybiByZXM7ICBcbiAgXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG5cdHJlbGF0aXZlVGltZSA6IGZ1bmN0aW9uKHByZXZpb3VzKXtcblx0XHR2YXIgbXNQZXJNaW51dGUgPSA2MCAqIDEwMDA7XG5cdCAgICB2YXIgbXNQZXJIb3VyID0gbXNQZXJNaW51dGUgKiA2MDtcblx0ICAgIHZhciBtc1BlckRheSA9IG1zUGVySG91ciAqIDI0O1xuXHQgICAgdmFyIG1zUGVyTW9udGggPSBtc1BlckRheSAqIDMwO1xuXHQgICAgdmFyIG1zUGVyWWVhciA9IG1zUGVyRGF5ICogMzY1O1xuXG5cdCAgICB2YXIgZWxhcHNlZCA9IERhdGUubm93KCkgLSBwcmV2aW91cztcblxuXHQgICAgaWYgKGVsYXBzZWQgPCBtc1Blck1pbnV0ZSkge1xuXHQgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChlbGFwc2VkLzEwMDApICsgJyBzZWNvbmRzIGFnbyc7XG5cdCAgICB9XG5cdCAgICBlbHNlIGlmIChlbGFwc2VkIDwgbXNQZXJIb3VyKSB7XG5cdCAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvbXNQZXJNaW51dGUpICsgJyBtaW51dGVzIGFnbyc7XG5cdCAgICB9XG5cdCAgICBlbHNlIGlmIChlbGFwc2VkIDwgbXNQZXJEYXkgKSB7XG5cdCAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvbXNQZXJIb3VyICkgKyAnIGhvdXJzIGFnbyc7XG5cdCAgICB9XG5cdCAgICBlbHNlIGlmIChlbGFwc2VkIDwgbXNQZXJNb250aCkge1xuXHQgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGVsYXBzZWQvbXNQZXJEYXkpICsgJyBkYXlzIGFnbyc7ICAgXG5cdCAgICB9XG5cdCAgICBlbHNlIGlmIChlbGFwc2VkIDwgbXNQZXJZZWFyKSB7XG5cdCAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoZWxhcHNlZC9tc1Blck1vbnRoKSArICcgbW9udGhzIGFnbyc7ICAgXG5cdCAgICB9XG5cdCAgICBlbHNlIHtcblx0ICAgICAgICByZXR1cm4gTWF0aC5yb3VuZChlbGFwc2VkL21zUGVyWWVhciApICsgJyB5ZWFycyBhZ28nOyAgIFxuXHQgICAgfVxuXHR9LFxuXG5cdC8qXG5cdFx0UmVwbGFjZXMgc3RyaW5nIHdpdGggXCJfYm9sZF8gbm9ybWFsXCIgdGV4dCB0byBtaXRocmlsIEFycmF5XG5cdCovXG5cdHNob3J0aGFuZFRvTWl0aHJpbEFycmF5IDogZnVuY3Rpb24odGFyZ2V0KXtcblxuXHRcdGlmKHRhcmdldC5sZW5ndGggPT09IDApIHJldHVybiBbXTtcblxuXHRcdHZhciBrZXl3b3JkTWVtYmVycyA9IHRhcmdldC5tYXRjaCgvXyguKj8pXy9nKSxcblx0XHRcdG51bWJlckRlbGltaXRlcmVkU3RyaW5nID0gX251bWJlcmVkU3RyaW5nKHRhcmdldCksXG5cdFx0XHR0YXJnZXRBcnJheSA9IF8ud2l0aG91dChudW1iZXJEZWxpbWl0ZXJlZFN0cmluZy5zcGxpdCgveyhcXGQrKX0vKSwgXCJcIik7XG5cblx0XHRcblx0XHRmb3IgKHZhciBpID0gMCwgaiA9IHRhcmdldEFycmF5Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuXHRcdFx0dmFyIHQgPSArdGFyZ2V0QXJyYXlbaV07XG5cdFx0XHRpZih0ID49IDApIHRhcmdldEFycmF5W2ldID0gbSgnc3BhbicsIGtleXdvcmRNZW1iZXJzW3RdLnJlcGxhY2UoL18vZywgJycpKTsgICAgdGhpcy5ndWVzc2VzID0gbS5wcm9wKDApO1xuXG5cdFx0fTtcblxuXHRcdHJldHVybiB0YXJnZXRBcnJheTtcblxuXHR9XG5cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxudmFyIENPTlNUX0tFWSA9ICdzaG93LXN0YXItYmV0YSc7XG5cbi8qXG5cdFlvdSB3b3VsZCBvYnRhaW4gdGhpcyBieSB4aHJcbiovXG52YXIgZGF0YSA9IHtcblx0dGl0bGUgOiBcIlNob3cgU3RhclwiLFxuXHRkZXNjcmlwdGlvbiA6IFwiQ2FuIHlvdSBhc3NvY2lhdGUgdGhlIGNlbGVicml0aWVzIHdpdGggdGhlIHNob3dzIGluIHRoZSB0aW1lIGxpbWl0PyBDYXJlZnVsIHRob3VnaCwgeW91IHdpbGwgYmUgZGVkdWN0ZWQgZm9yIGFuIGluY29ycmVjdCBndWVzc1wiLFxuXHR0aW1lciA6IDUsXG5cdGFzc2V0cyA6IFtcblx0XHQgeyBuYW1lIDogJ2JyYW5kJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYTViZjYyYWMtM2U1Zi00NmZhLTliNTktNTljMDliYzAzZDNlLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Bvc2l0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMjg5ZTk1M2ItYThiOS00ZThiLTg5ZDUtMTc2OWUxZmIxNjhiLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ21vZGVyYXRlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmZmYzRmZTctMmUxMi00M2MyLTg1MmMtZDYwYzdkNGZiNWEyLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ25lZ2F0aXZlJywgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNzVmYjMwOTEtNTc0Yy00ODYzLWJmMjEtMGVhMTgyNWM0ODUzLnBuZycgfSxcblx0XHQgeyBuYW1lIDogJ3Ryb3BoeScsIGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzllY2RhMmUyLTZkMDktNDhkZC1hMTY2LTMyZWMyMzJiZGI4Yi5wbmcnIH1cblx0XSxcblx0cXVlc3Rpb25zIDpbe1xuXHRcdHF1ZXN0aW9uIDogXCJfQ2hvb3NlIDNfIG9mIHRoZSBmb2xsb3dpbmcgYXBwZWFyZWQgaW4gdGhlIDkwJ3Mgc2l0Y29tIF9GcmllbmRzX1wiLFxuXHRcdGFuc3dlcnMgIDogW1xuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzM2NiMjYyLWUxNzUtNDRmNC1hNThlLTQyNTIzMzkxZmI1ZC5wbmcnLCBuYW1lIDogJ01hdHQgTGUgQmxhbmMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8wZTgzMWU4Yy04ZDYwLTQzZWEtYWI3ZC05YmJmZDRmZmIzYWQucG5nJywgbmFtZSA6ICdEb25hbGQgR2xvdmVyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzg2MWIxOGFhLTE1MmMtNGFlMC05MTE4LWZmYTA1Yjc5YmM3Ni5wbmcnLCBuYW1lIDogJ1dheW5lIEtuaWdodCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei81ZDljOWZjOC02MDZlLTQ4NGEtYjRmZC1lYjBlMGJkYzQ0OTcucG5nJywgbmFtZSA6ICdEZW1pIE1vb3JlJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjRiODBhMzAtNTdhNi00OTI4LWE4MDUtNzBiYzM4NjQxMDE4LnBuZycsIG5hbWUgOiAnSmVzc2ljYSBXZXN0ZmVsZHQnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNGJjMDc3NmUtMWNmOC00YjEyLTg4MWItZjcxNTQzNDNkYmU0LnBuZycsIG5hbWUgOiAnSmVubmlmZXIgQW5pc3RvbicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2IzZjkxYTYzLWU5ODctNGVhNy04MWFiLTU4NmY5MzA2MTBhZS5wbmcnLCBuYW1lIDogJ0phc29uIEFsZXhhbmRlcicsIGNvcnJlY3QgOiBmYWxzZSB9XG5cdFx0XVxuXHR9LFxuXHR7XG5cdFx0cXVlc3Rpb24gOiBcIkdvaW5nIGJhY2sgYSBsaXR0bGUgZnVydGhlciwgX0Nob29zZSAzXyB3aG8gc3RhcnJlZCBpbiB0aGUgY3VsdCBjbGFzc2ljIF9TZWluZmVsZF8/XCIsXG5cdFx0YW5zd2VycyAgOiBbXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzIxZDlhMDU1LWIxYzYtNGQ0ZC1hNGI2LTUxMzE5ZmM2NTE2NS5wbmcnLCBuYW1lIDogJ0RhdmlkIFNjaHdpbW1lcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9jYTUxMTAzMC1mNzdlLTQ2ZGYtYTFhOS0xMDU4NjI4NGEzOGIucG5nJywgbmFtZSA6ICdMaXNhIEt1ZHJvdycsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei9iMzNjYjI2Mi1lMTc1LTQ0ZjQtYTU4ZS00MjUyMzM5MWZiNWQucG5nJywgbmFtZSA6ICdNYXR0IExlIEJsYW5jJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2U3N2I2NjE3LWY1NDMtNDZjYi1iNDM1LTM3YjZiMWE0NDJkNy5wbmcnLCBuYW1lIDogJ0NvdXJ0bmV5IENveC1BcnF1ZXR0ZScsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei84NjFiMThhYS0xNTJjLTRhZTAtOTExOC1mZmEwNWI3OWJjNzYucG5nJywgbmFtZSA6ICdXYXluZSBLbmlnaHQnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8zYTZlZWFkMy05MGNjLTQwNmMtOTllMS00OTM5MjNiM2U4ZDAucG5nJywgbmFtZSA6ICdNYXR0aGV3IFBlcnJ5JywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzQwZTgwMzdlLTEyYjItNDRkMy05Zjg0LTcxZmUzZGUwYmRhZi5wbmcnLCBuYW1lIDogJ01pY2hhZWwgUmljaGFyZHMnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8xYjU5YzQ0NS04ZjNlLTQ2YmQtYWQ1Ny1jMTVhNzNjN2E2OGEucG5nJywgbmFtZSA6ICdQYXVsIFdhc2lsZXdza2knLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovYjNmOTFhNjMtZTk4Ny00ZWE3LTgxYWItNTg2ZjkzMDYxMGFlLnBuZycsIG5hbWUgOiAnSmFzb24gQWxleGFuZGVyJywgY29ycmVjdCA6IHRydWUgfVxuXHRcdF1cblx0fSxcblx0e1xuXHRcdHF1ZXN0aW9uIDogXCJXaGljaCBvZiB0aGUgZm9sbG93aW5nIF8zIEFjdG9yc18gYXBwZWFyZWQgaW4gX0NvbW11bml0eV9cIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMWIxMGYzNjYtMTVhMS00YzM4LTlhZDYtNDI5NDJhMDVjMjBhLnBuZycsIG5hbWUgOiAnUnlhbiBTZWFjcmVzdCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei85ODliYmU0OS03NTNlLTQyMzQtODg1ZC0xOTI5MzE0YTM3MWUucG5nJywgbmFtZSA6ICdGcmFuayBBYmFnbmFsZSBqcicsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8yOTQ4MTgyYi1mYTc1LTQzZmYtOTYxZi01OWU2MzYwNWFlMzgucG5nJywgbmFtZSA6ICdLdW1haWwgTmFuamlhbmknLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovNjNjMzFkOGQtMjU1NC00MjMwLWEwMDYtMWRmNzc2NjA2MGE3LnBuZycsIG5hbWUgOiAnQ2hldnkgQ2hhc2UnLCBjb3JyZWN0IDogdHJ1ZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei8wMzgzM2E4MS03YWE3LTRjM2ItODg0Zi0xNjcyNzdiMTljMjQucG5nJywgbmFtZSA6ICdZdmV0dGUgTmljb2xlIEJyb3duJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2ZjMjYzMGRjLWIzN2UtNDIwMy05OWM1LTBjODM3MGFmMTFhYi5wbmcnLCBuYW1lIDogJ0tlbiBKZW9uZycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2M3NjYzNjAxLTMzNTItNGMxMS1hYWQ2LTQ3NWQwOTY4NDAxMS5wbmcnLCBuYW1lIDogJ1phY2sgQnJhZmYnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovY2YzZjdlMTctYjg1MC00YTEyLThkYTYtOGNkNWFhZDRhNWJhLnBuZycsIG5hbWUgOiAnQWxvbW9hIFdyaWdodCcsIGNvcnJlY3QgOiBmYWxzZSB9LFxuXHRcdFx0eyBpbWFnZSA6ICdodHRwOi8vaW1nLWEuemVlYm94LmNvbS9pbWFnZXMvei81Mjk2YmNkMC02ZjZhLTQxYzktYmUyNy1iN2ExZTBiZWE0NTgucG5nJywgbmFtZSA6ICdKb2VsIE1jSGFsZScsIGNvcnJlY3QgOiB0cnVlIH1cblx0XHRdXG5cdH0sXG5cdHtcblx0XHRxdWVzdGlvbiA6IFwiR2V0dGluZyBhIGxpdHRsZSBtb3JlIG1vZGVybiwgX0Nob29zZSA1XyBmcm9tIEhCTydzIF9TaWxpY29uIFZhbGxleV9cIixcblx0XHRhbnN3ZXJzICA6IFtcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZjBhYTQ4N2MtNGIyZS00NzM1LWI5NjMtYzc0NWVlMWY3MTI1LnBuZycsIG5hbWUgOiAnWmFjaCBXb29kcycsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96Lzk4OWJiZTQ5LTc1M2UtNDIzNC04ODVkLTE5MjkzMTRhMzcxZS5wbmcnLCBuYW1lIDogJ0ZyYW5rIEFiYWduYWxlIGpyJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2E2YjI4YmU2LWQwZjktNGRlMC05MDlmLTUwYjAyMWE2Mjg4YS5wbmcnLCBuYW1lIDogJ01hcnRpbiBTdGFycicsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzI5NDgxODJiLWZhNzUtNDNmZi05NjFmLTU5ZTYzNjA1YWUzOC5wbmcnLCBuYW1lIDogJ0t1bWFpbCBOYW5qaWFuaScsIGNvcnJlY3QgOiB0cnVlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96LzAzODMzYTgxLTdhYTctNGMzYi04ODRmLTE2NzI3N2IxOWMyNC5wbmcnLCBuYW1lIDogJ1l2ZXR0ZSBOaWNvbGUgQnJvd24nLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovZmMyNjMwZGMtYjM3ZS00MjAzLTk5YzUtMGM4MzcwYWYxMWFiLnBuZycsIG5hbWUgOiAnS2VuIEplb25nJywgY29ycmVjdCA6IGZhbHNlIH0sXG5cdFx0XHR7IGltYWdlIDogJ2h0dHA6Ly9pbWctYS56ZWVib3guY29tL2ltYWdlcy96L2M3NjYzNjAxLTMzNTItNGMxMS1hYWQ2LTQ3NWQwOTY4NDAxMS5wbmcnLCBuYW1lIDogJ1phY2sgQnJhZmYnLCBjb3JyZWN0IDogZmFsc2UgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovOTMzNTAyOTEtMzBlMi00NDAzLWFmYmQtOTczMDliMzU0ZjU5LnBuZycsIG5hbWUgOiAnVEogTWlsbGVyJywgY29ycmVjdCA6IHRydWUgfSxcblx0XHRcdHsgaW1hZ2UgOiAnaHR0cDovL2ltZy1hLnplZWJveC5jb20vaW1hZ2VzL3ovMDMzNzYwMDQtZWQxYy00MDYxLWE1NDEtODBiMThlNjZhNDVkLnBuZycsIG5hbWUgOiAnVGhvbWFzIE1pZGRsZWRpdGNoJywgY29ycmVjdCA6IHRydWUgfVxuXHRcdF1cblx0fVxuXHRdLFxuXHRyZXN1bHRNZXNzYWdlcyA6IHtcblx0XHQyMCAgOiBcIk9oIG9o4oCmLnRoaW5rIHlvdSBuZWVkIHRvIHNwZW5kIHNvbWUgdGltZSBvbiB0aGUgY291Y2ggdGhpcyB3ZWVrZW5kLCBob25pbmcgaW4gb24geW91ciBUViBza2lsbHMhXCIsXG5cdFx0NDAgIDogXCJQcmV0dHkgZ29vZCwgYWx0aG91Z2ggdGhlIHByZXNzdXJlIG11c3QgaGF2ZSBnb3QgdGhlIGJlc3Qgb2YgeW914oCmVHJ5IGFnYWluIVwiLFxuXHRcdDYwICA6IFwiR3JlYXQgZWZmb3J0ISBZb3XigJlyZSBuZWFybHkgYW1hemluZ+KApm5lYXJseeKApi53aHkgZG9u4oCZdCB5b3UgYXNrIHRoZSBIb21lIE9mIENvbWVkeSBUViBSb29tIGZvciBzb21lIGhlbHA/IENsaWNrIGhlcmUgb3IgdHJ5IHlvdXIgbHVjayBhZ2FpbiBhbmQgcGxheSBhZ2FpbiFcIixcblx0XHQ4MCAgOiBcIkFtYXppbmcgU3R1ZmYgLSB5b3UgYXJlIGF0IHRoZSB0b3Agb2YgdGhlIGxlYWRlcmJvYXJkISBOZWFyIHBlcmZlY3QhIEJlIHBlcmZlY3TigKZQbGF5IGFnYWluIVwiLFxuXHRcdDEwMCA6IFwiR2VuaXVz4oCmLi55b3Uga25vdyB5b3VyIFRWLiBMZXTigJlzIHNlZSBob3cgeW91IGdvIG9uIExldmVsIDJcIlxuXHR9XG59O1xuXG5cbnZhciBfZ2V0TWF4U2NvcmUgPSBmdW5jdGlvbigpe1xuXHR2YXIgc2NvcmUgPSAwO1xuXHRfLmVhY2goZGF0YS5xdWVzdGlvbnMsIGZ1bmN0aW9uKHEpe1xuXHRcdHNjb3JlICs9IF8uZmlsdGVyKHEuYW5zd2VycywgeyBjb3JyZWN0IDogdHJ1ZSB9KS5sZW5ndGg7XG5cdH0pO1xuXHRyZXR1cm4gc2NvcmU7XG59O1xuXG52YXIgX2hhc0xvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uKCl7XG5cdHZhciBtb2QgPSAneHgnO1xuXHR0cnkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShtb2QsIG1vZCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG1vZCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcblxudmFyIF90cnlQYXJzZSA9IGZ1bmN0aW9uKHRhcmdldCl7XG5cdHZhciByZXN1bHQgPSBbXTtcblx0dHJ5IHtcblx0XHRyZXR1cm4gSlNPTi5wYXJzZSh0YXJnZXQpIHx8IHJlc3VsdDtcblx0fSBjYXRjaChlKSB7XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTtcblxudmFyIF9nZXRQcmV2aW91c1Njb3JlcyA9IGZ1bmN0aW9uKCl7XG5cdGlmKCFfaGFzTG9jYWxTdG9yYWdlKCkpIHJldHVybiBbXTtcblx0cmV0dXJuIF90cnlQYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShDT05TVF9LRVkpKTtcbn07XG5cbi8qXG5cdENvbnN0cnVjdG9yXG4qL1xudmFyIEdhbWVNb2RlbCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuc2NvcmUgXHRcdD0gbS5wcm9wKDApO1xuXHR0aGlzLmhpZ2hTY29yZSAgPSBtLnByb3AoX2dldE1heFNjb3JlKCkpO1xuXHR0aGlzLnF1ZXN0aW9uc1x0PSBtLnByb3AoZGF0YS5xdWVzdGlvbnMpO1xuXHR0aGlzLmFzc2V0cyAgICAgPSBtLnByb3AoZGF0YS5hc3NldHMpO1xuXHR0aGlzLnRpdGxlXHRcdD0gbS5wcm9wKGRhdGEudGl0bGUpO1xuXHR0aGlzLnJlc3VsdE1lc3NhZ2VzID0gbS5wcm9wKGRhdGEucmVzdWx0TWVzc2FnZXMpO1xuXHR0aGlzLmRlc2NyaXB0aW9uID0gbS5wcm9wKGRhdGEuZGVzY3JpcHRpb24pO1xuXHR0aGlzLnRpbWVyID0gbS5wcm9wKGRhdGEudGltZXIgfHwgNSk7XG5cdHRoaXMucHJldmlvdXNTY29yZXMgPSBtLnByb3AoX2dldFByZXZpb3VzU2NvcmVzKCkpO1xufTtcblxuLypcblx0UHVibGljIE1lbWJlcnNcbiovXG5cbkdhbWVNb2RlbC5wcm90b3R5cGUuc2F2ZVNjb3JlID0gZnVuY3Rpb24oc2NvcmUpe1xuXHRcblx0dGhpcy5zY29yZShzY29yZSk7XG5cblx0Ly8gVXBkYXRlIHByZXZpb3VzIHNjb3JlcyBzZXR0aW5nIHRoZSBsYXRlc3Qgc2NvcmUgYXMgb25seSBvbmUgb2YgdGhhdCBzY29yZVxuXHR2YXIgcHJldmlvdXNTY29yZXMgPSB0aGlzLnByZXZpb3VzU2NvcmVzKCksXG5cdFx0bmV3U2NvcmUgPSB7IGRhdGUgOiBEYXRlLm5vdygpLCBzY29yZSA6IHNjb3JlIH07XG5cdHByZXZpb3VzU2NvcmVzID0gXy53aXRob3V0KGl0ZW1zLCBfLmZpbmRXaGVyZShpdGVtcywgeyBzY29yZSA6IHNjb3JlIH0pKTtcblx0cHJldmlvdXNTY29yZXMucHVzaChuZXdTY29yZSk7XG5cdHRoaXMucHJldmlvdXNTY29yZXMocHJldmlvdXNTY29yZXMpO1xuXG5cdC8vIHZhciBob3dJZERpZCA9IF8uaW5kZXhPZihuZXdTY29yZSkgKyAxXG5cblx0Ly8gc2F2ZSBpbiBsb2NhbCBzdG9yYWdlIHdoZXJlIGF2YWlsYWJsZVxuXHRpZighIF9oYXNMb2NhbFN0b3JhZ2UoKSkgcmV0dXJuO1xuXHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbShDT05TVF9LRVksIEpTT04uc3RyaW5naWZ5KHRoaXMucHJldmlvdXNTY29yZXMoKSkpO1xufTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEdhbWVNb2RlbCgpO1xuXG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuLyogR2xvYmFsIG1vZHVsZSAqL1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuLy4uL2xpYnMvdXRpbHMnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBBbnN3ZXIgPSBmdW5jdGlvbihkKXtcbiAgICB0aGlzLmltYWdlID0gbS5wcm9wKGQuaW1hZ2UpO1xuICAgIHRoaXMubmFtZSA9IG0ucHJvcChkLm5hbWUpO1xuICAgIHRoaXMuc2VsZWN0ZWQgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMuY29ycmVjdCA9IG0ucHJvcChkLmNvcnJlY3QpO1xuICAgIFxuICAgIC8vIHZpZXcgbWFya2Vyc1xuICAgIHRoaXMudG9nZ2xlZCA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy50b2dnbGVSZWplY3RlZCA9IG0ucHJvcChmYWxzZSk7XG59O1xuXG5BbnN3ZXIucHJvdG90eXBlLmdldFNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgc2NvcmUgPSAwO1xuICAgIGlmKHRoaXMuc2VsZWN0ZWQoKSAmJiB0aGlzLmNvcnJlY3QoKSkgc2NvcmUgPSAxO1xuICAgIHJldHVybiBzY29yZTtcbn07XG5cbnZhciBRdWVzdGlvbiA9IGZ1bmN0aW9uKGQpe1xuICAgIHRoaXMudGV4dCA9IG0ucHJvcChkLnF1ZXN0aW9uKTtcbiAgICB0aGlzLnF1ZXN0aW9uRWxlbWVudCA9IG0ucHJvcCh1dGlscy5zaG9ydGhhbmRUb01pdGhyaWxBcnJheShkLnF1ZXN0aW9uKSk7XG4gICAgdGhpcy5hbnN3ZXJzID0gbS5wcm9wKF8ubWFwKGQuYW5zd2VycywgZnVuY3Rpb24oYSl7XG4gICAgICAgIHJldHVybiBuZXcgQW5zd2VyKGEpO1xuICAgIH0pKTtcbiAgICB0aGlzLmd1ZXNzZXMgPSBtLnByb3AoMCk7XG4gICAgdGhpcy5saW1pdCA9IG0ucHJvcChfLmZpbHRlcihkLmFuc3dlcnMsIHsgY29ycmVjdCA6IHRydWUgfSkubGVuZ3RoKTtcbn07XG5cblF1ZXN0aW9uLnByb3RvdHlwZS5ndWVzc0xpbWl0UmVhY2hlZCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXMuZ3Vlc3NlcygpID09PSB0aGlzLmxpbWl0KCk7XG59O1xuXG5RdWVzdGlvbi5wcm90b3R5cGUuY291bnRHdWVzcyA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5ndWVzc2VzKF8uZmlsdGVyKHRoaXMuYW5zd2VycygpLCBmdW5jdGlvbihhbnMpe1xuICAgICAgICByZXR1cm4gYW5zLnNlbGVjdGVkKCk7XG4gICAgfSkubGVuZ3RoKTtcbn07XG5cbnZhciBUaW1lciA9IGZ1bmN0aW9uKHRpbWUpe1xuICAgIHRoaXMuaXNBY3RpdmUgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMudGltZSA9IG0ucHJvcCh0aW1lICogMTAwMCk7XG59O1xuICAgIFxuLypcbiAgICBDb25zdHJ1Y3RvclxuKi9cblxudmFyIEdhbWVWTSA9IGZ1bmN0aW9uKCl7fTtcblxuXG4vKlxuICAgIFByaXZhdGUgTWVtYmVyc1xuKi9cblxudmFyIF9jbGVhclF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gbmV3IFF1ZXN0aW9uKHsgcXVlc3Rpb24gOiBcIlwiLCBhbnN3ZXJzIDogW10gfSk7XG59O1xuXG4vLyBZb3UgY2FuIGdldCBuZWdhdGl2ZSBzY29yZXMhIVxudmFyIF91cGRhdGVTY29yZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN1cnJlbnRTY29yZSA9IHRoaXMuY3VycmVudFNjb3JlKCksXG4gICAgICAgIHNjb3JlID0gMDtcblxuICAgIF8uZWFjaCh0aGlzLnF1ZXN0aW9uKCkuYW5zd2VycygpLCBmdW5jdGlvbihhbnMpe1xuICAgICAgICBzY29yZSArPSBhbnMuZ2V0U2NvcmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudFNjb3JlKGN1cnJlbnRTY29yZSArIHNjb3JlKTtcbn07XG5cbnZhciBfc2V0Q3VycmVudFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcSA9IG5ldyBRdWVzdGlvbih0aGlzLnF1ZXN0aW9ucygpW3RoaXMuY3VycmVudFF1ZXN0aW9uKCldKTtcbiAgICB0aGlzLnF1ZXN0aW9uKHEpO1xufTtcblxudmFyIF9uZXh0UXVlc3Rpb24gPSBmdW5jdGlvbigpe1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5jdXJyZW50UXVlc3Rpb24oKSArIDEsXG4gICAgICAgIGlzRW5kID0gY3VycmVudCA9PT0gdGhpcy50b3RhbFF1ZXN0aW9ucygpO1xuXG4gICAgdGhpcy5nYW1lT3Zlcihpc0VuZCk7XG4gICAgaWYoISBpc0VuZCkge1xuICAgICAgICB0aGlzLnF1ZXN0aW9uU2hvd24oZmFsc2UpO1xuICAgICAgICB0aGlzLmN1cnJlbnRRdWVzdGlvbihjdXJyZW50KTtcbiAgICAgICAgX3NldEN1cnJlbnRRdWVzdGlvbi5jYWxsKHRoaXMpO1xuICAgIH1cbn07XG5cblxuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuR2FtZVZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcXVlc3Rpb25zID0gR2FtZU1vZGVsLnF1ZXN0aW9ucygpO1xuICAgIHRoaXMuY3VycmVudFF1ZXN0aW9uID0gbS5wcm9wKDApO1xuICAgIHRoaXMuY3VycmVudFNjb3JlID0gbS5wcm9wKDApO1xuICAgIHRoaXMudGltZXIgPSBtLnByb3AobnVsbCk7XG4gICAgdGhpcy5xdWVzdGlvbnMgPSBtLnByb3AocXVlc3Rpb25zKTtcbiAgICB0aGlzLnRvdGFsUXVlc3Rpb25zID0gbS5wcm9wKHF1ZXN0aW9ucy5sZW5ndGgpO1xuICAgIHRoaXMuZ2FtZU92ZXIgPSBtLnByb3AoZmFsc2UpO1xuICAgIHRoaXMucXVlc3Rpb24gPSBtLnByb3AoX2NsZWFyUXVlc3Rpb24oKSk7XG4gICAgXG4gICAgLy8gVmlldyBRdWV1ZXMgXG4gICAgdGhpcy5sb2NrZWQgPSBtLnByb3AodHJ1ZSk7XG4gICAgdGhpcy5xdWVzdGlvblNob3duID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLmVuZFF1ZXN0aW9uID0gbS5wcm9wKGZhbHNlKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUuc3RhcnRHYW1lID0gZnVuY3Rpb24oKXtcbiAgICBfc2V0Q3VycmVudFF1ZXN0aW9uLmNhbGwodGhpcyk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnN0b3BRdWVzdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5lbmRRdWVzdGlvbihmYWxzZSk7XG4gICAgX3VwZGF0ZVNjb3JlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5xdWVzdGlvbihfY2xlYXJRdWVzdGlvbigpKTtcbn07XG5cbkdhbWVWTS5wcm90b3R5cGUubmV4dFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICBfbmV4dFF1ZXN0aW9uLmNhbGwodGhpcyk7XG59O1xuXG5HYW1lVk0ucHJvdG90eXBlLnVwZGF0ZVNjb3JlID0gZnVuY3Rpb24oKXtcbiAgICBHYW1lTW9kZWwuc2F2ZVNjb3JlKHRoaXMuY3VycmVudFNjb3JlKCkpO1xufTtcblxuR2FtZVZNLnByb3RvdHlwZS5zdGFydFF1ZXN0aW9uID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnRpbWVyKG5ldyBUaW1lcihHYW1lTW9kZWwudGltZXIoKSkpO1xuICAgIHRoaXMubG9ja2VkKGZhbHNlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZVZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG5cdF8gPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBJbnRyb1ZNID0gZnVuY3Rpb24oKXt9O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuSW50cm9WTS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy50aXRsZSA9IG0ucHJvcChHYW1lTW9kZWwudGl0bGUoKSk7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IG0ucHJvcChHYW1lTW9kZWwuZGVzY3JpcHRpb24oKSk7XG4gICAgdGhpcy5iZWdpbiA9IG0ucHJvcChmYWxzZSk7XG4gICAgdGhpcy5icmFuZCA9IG0ucHJvcChfLmZpbmRXaGVyZShHYW1lTW9kZWwuYXNzZXRzKCksIHsgbmFtZSA6ICdicmFuZCcgfSkuaW1hZ2UpO1xuICAgIHRoaXMuYmVnaW4gPSBtLnByb3AoZmFsc2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRyb1ZNOyIsIid1c2Ugc3RyaWN0Jztcbi8qIEdsb2JhbCBtb2R1bGUgKi9cblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgXyAgPSByZXF1aXJlKCdsb2Rhc2gnKSxcbiAgICBHYW1lTW9kZWwgPSByZXF1aXJlKCcuLy4uL21vZGVscy9nYW1lLW1vZGVsJyk7XG5cbnZhciBMb2FkaW5nVk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG4gICAgUHJlbG9hZCBpbWFnZXNcbiovXG52YXIgX3ByZWxvYWQgPSBmdW5jdGlvbigpe1xuICAgIHZhciB0YXJnZXRzID0gdGhpcy50YXJnZXRzKCksXG4gICAgICAgIHRhcmdldENvdW50ID0gdGFyZ2V0cy5sZW5ndGg7XG5cbiAgICB2YXIgX19vbkxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbG9hZGVkID0gdGhpcy50YXJnZXRzTG9hZGVkKCkgKyAxO1xuICAgICAgICB0aGlzLnRhcmdldHNMb2FkZWQobG9hZGVkKTtcbiAgICAgICAgdGhpcy5wcm9ncmVzcyhNYXRoLnJvdW5kKChsb2FkZWQgLyB0YXJnZXRDb3VudCkgKiAxMDApKTtcbiAgICAgICAgdGhpcy5sb2FkZWQodGhpcy5wcm9ncmVzcygpID09PSAxMDApO1xuICAgICAgICBtLnJlZHJhdygpO1xuICAgIH07XG5cbiAgICBmb3IgKHZhciBpID0gdGFyZ2V0Q291bnQgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2Uub25sb2FkID0gX19vbkxvYWQuYmluZCh0aGlzKTtcbiAgICAgICAgaW1hZ2Uuc3JjID0gdGFyZ2V0c1tpXTtcbiAgICB9XG59O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuTG9hZGluZ1ZNLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcXVlc3Rpb25zID0gR2FtZU1vZGVsLnF1ZXN0aW9ucygpLFxuICAgICAgICBhc3NldHMgPSBHYW1lTW9kZWwuYXNzZXRzKCksXG4gICAgICAgIGVudGl0aWVzID0gW107XG5cbiAgICBfLmVhY2gocXVlc3Rpb25zLCBmdW5jdGlvbihxKXtcbiAgICAgICAgZW50aXRpZXMgPSBfLnVuaW9uKGVudGl0aWVzLCBfLnBsdWNrKHEuYW5zd2VycywgJ2ltYWdlJykpO1xuICAgIH0pO1xuICAgIGVudGl0aWVzID0gXy51bmlvbihlbnRpdGllcywgXy5wbHVjayhhc3NldHMsICdpbWFnZScpKTtcblxuICAgIHRoaXMubG9hZGVkID0gbS5wcm9wKGZhbHNlKTtcbiAgICB0aGlzLnByb2dyZXNzID0gbS5wcm9wKDApO1xuICAgIHRoaXMudGFyZ2V0cyA9IG0ucHJvcChlbnRpdGllcyk7XG4gICAgdGhpcy50YXJnZXRzTG9hZGVkID0gbS5wcm9wKDApO1xuICAgIF9wcmVsb2FkLmNhbGwodGhpcyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmdWTTsiLCIndXNlIHN0cmljdCc7XG4vKiBHbG9iYWwgbW9kdWxlICovXG5cbnZhciBtID0gcmVxdWlyZSgnbWl0aHJpbCcpLFxuXHRfID0gcmVxdWlyZSgnbG9kYXNoJyksXG5cdHV0aWxzID0gcmVxdWlyZSgnLi8uLi9saWJzL3V0aWxzJyksXG4gICAgR2FtZU1vZGVsID0gcmVxdWlyZSgnLi8uLi9tb2RlbHMvZ2FtZS1tb2RlbCcpO1xuXG52YXIgUmVzdWx0Vk0gPSBmdW5jdGlvbigpe307XG5cbi8qXG5cdFByaXZhdGUgTWVtZWJlcnNcbiovXG5cbnZhciBfY2FsY01lc3NhZ2UgPSBmdW5jdGlvbigpe1xuXHR2YXIgbWVzc2FnZXMgPSB0aGlzLnJlc3VsdE1lc3NhZ2VzKCksXG5cdFx0cGVyY2VudGFnZSA9IE1hdGgucm91bmQoKHRoaXMuc2NvcmUoKSAvIHRoaXMuaGlnaFNjb3JlKCkpICogMTAwKSxcblx0XHRyZXN1bHQgPSBtZXNzYWdlc1syMF07XG5cblx0Zm9yKHZhciByZXMgaW4gbWVzc2FnZXMpIHtcblx0XHRpZihwZXJjZW50YWdlID49IHJlcykgcmVzdWx0ID0gbWVzc2FnZXNbcmVzXTtcblx0XHRlbHNlIGJyZWFrO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBfY2FsY1RvcEZpdmUgPSBmdW5jdGlvbihwcmV2aW91c1Njb3JlcywgY3VycmVudFNjb3JlKXtcblxuXHQvLyBnZXQgZnJpZW5kbHkgVGltZVxuXHRfLmVhY2gocHJldmlvdXNTY29yZXMsIGZ1bmN0aW9uKHNjb3JlKXtcblx0XHRzY29yZS5mcmllbmRseVRpbWUgPSB1dGlscy5yZWxhdGl2ZVRpbWUoc2NvcmUuZGF0ZSk7XG5cdFx0c2NvcmUuaXNDdXJyZW50ID0gK3Njb3JlLnNjb3JlID09PSArY3VycmVudFNjb3JlO1xuXHR9KTtcblxuXHRpZihwcmV2aW91c1Njb3Jlcy5sZW5ndGggPD0gMSkgcmV0dXJuIHByZXZpb3VzU2NvcmVzO1xuXG4gICAgcHJldmlvdXNTY29yZXMgPSBfLnNvcnRCeShwcmV2aW91c1Njb3JlcywgZnVuY3Rpb24ocyl7XG4gICAgICAgIHJldHVybiAtcy5zY29yZTtcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gcHJldmlvdXNTY29yZXMuc2xpY2UoMCw1KTtcbn07XG5cbnZhciBfZ2V0UGVyZm9ybWFuY2VBZGogPSBmdW5jdGlvbigpe1xuXHR2YXIgdGFyZ2V0ID0gJycsXG5cdFx0aW5kZXggPSBfLmZpbmRJbmRleCh0aGlzLnNjb3JlQm9hcmQoKSwgZnVuY3Rpb24oc2NvcmUpe1xuXHRcdHJldHVybiBzY29yZS5pc0N1cnJlbnQ7XG5cdH0pO1xuXG5cdHN3aXRjaChpbmRleCl7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0dGFyZ2V0ID0gJ3Ryb3BoeSc7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDE6XG5cdFx0Y2FzZSAyOlxuXHRcdFx0dGFyZ2V0ID0gJ3Bvc2l0aXZlJztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRjYXNlIDQ6XG5cdFx0XHR0YXJnZXQgPSAnbW9kZXJhdGUnO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRhcmdldCA9ICduZWdhdGl2ZSc7XG5cdH1cblxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxudmFyIF9nZXRSZXN1bHRJbWFnZSA9IGZ1bmN0aW9uKCl7XG5cdHJldHVybiBfLmZpbmRXaGVyZSh0aGlzLmFzc2V0cygpLCB7IG5hbWUgOiB0aGlzLnBlcmZvcm1hbmNlQWRqKCkgfSkuaW1hZ2U7XG59O1xuXG4vKlxuICAgIFB1YmxpYyBNZW1iZXJzXG4qL1xuUmVzdWx0Vk0ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuc2NvcmUgPSBtLnByb3AoR2FtZU1vZGVsLnNjb3JlKCkpO1xuICAgIHRoaXMuaGlnaFNjb3JlID0gbS5wcm9wKEdhbWVNb2RlbC5oaWdoU2NvcmUoKSk7XG4gICAgdGhpcy5yZXN1bHRNZXNzYWdlcyA9IG0ucHJvcChHYW1lTW9kZWwucmVzdWx0TWVzc2FnZXMoKSk7XG4gICAgdGhpcy5hc3NldHMgPSBtLnByb3AoR2FtZU1vZGVsLmFzc2V0cygpKTtcbiAgICBcbiAgICAvLyBEZXJpdmF0aXZlIERhdGFcblx0dGhpcy5zY29yZUJvYXJkID0gbS5wcm9wKF9jYWxjVG9wRml2ZShHYW1lTW9kZWwucHJldmlvdXNTY29yZXMoKSwgdGhpcy5zY29yZSgpKSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbS5wcm9wKF9jYWxjTWVzc2FnZS5jYWxsKHRoaXMpKTtcbiAgICB0aGlzLnBlcmZvcm1hbmNlQWRqID0gbS5wcm9wKF9nZXRQZXJmb3JtYW5jZUFkai5jYWxsKHRoaXMpKTtcbiAgICB0aGlzLnJlc3VsdEltYWdlID0gbS5wcm9wKF9nZXRSZXN1bHRJbWFnZS5jYWxsKHRoaXMpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzdWx0Vk07IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBIYW1tZXIgPSByZXF1aXJlKCdoYW1tZXJqcycpLFxuICAgIFZlbG9jaXR5ID0gcmVxdWlyZSgndmVsb2NpdHktYW5pbWF0ZScpO1xuXG52YXIgVmlldyA9IGZ1bmN0aW9uKGN0cmwsIGFuc3dlcil7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKGFuc3dlci50b2dnbGVkKCkpIHtcbiAgICAgICAgICAgIFZlbG9jaXR5KGVsLCAnY2FsbG91dC5wdWxzZScsIHsgZHVyYXRpb24gOiA0MDAgfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuc3dlci50b2dnbGVkKGZhbHNlKTtcbiAgICAgICAgfSBcbiAgICAgICAgZWxzZSBpZihhbnN3ZXIudG9nZ2xlUmVqZWN0ZWQoKSl7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgJ2NhbGxvdXQuc2hha2UnLCB7IGR1cmF0aW9uIDogNDAwIH0pO1xuICAgICAgICAgICAgYW5zd2VyLnRvZ2dsZVJlamVjdGVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgIHZhciBoYW1tZXJ0aW1lID0gbmV3IEhhbW1lcihlbCk7XG4gICAgICAgICAgICBoYW1tZXJ0aW1lLm9uKCd0YXAnLCBjdHJsLnRvZ2dsZS5iaW5kKGN0cmwsIGFuc3dlcikpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKFwibGkuYW5zd2VyLm9wYXF1ZVwiLCB7XG4gICAgICAgIGNvbmZpZyA6IGFuaW1JbixcbiAgICAgICAgc3R5bGUgOiB7IGJhY2tncm91bmRJbWFnZSA6IFwidXJsKFwiICsgYW5zd2VyLmltYWdlKCkgKyBcIilcIiB9XG4gICAgfSwgW1xuICAgICAgICBtKFwiaDQubmFtZVwiLCBhbnN3ZXIubmFtZSgpKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgYW5zd2VyVmlldyA9IHJlcXVpcmUoJy4vYW5zd2VyLXZpZXcnKSxcbiAgICB0aW1lclZpZXcgPSByZXF1aXJlKCcuL3RpbWVyLXZpZXcnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxuXG52YXIgcmVuZGVyR2FtZVBhZ2UgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnZ2FtZSc7XG4gICAgVmVsb2NpdHkoZWwuY2hpbGRyZW5bMF0sIHsgdHJhbnNsYXRlWSA6ICcrPTE3MHB4JyB9LCB7IGR1cmF0aW9uIDogNTAwLCBkZWxheSA6IDMwMCwgZWFzaW5nIDogWyAyNTAsIDAgXSB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgIGN0cmwucmVhZHkoKTtcbiAgICB9KTtcbn07XG5cbnZhciByZW5kZXJPdXQgPSBmdW5jdGlvbihjdHJsLCBlbCl7XG4gICAgVmVsb2NpdHkoZWwuY2hpbGRyZW5bMF0sICdyZXZlcnNlJykudGhlbihjdHJsLmVuZEdhbWUuYmluZChjdHJsKSk7XG59O1xuXG52YXIgcmVuZGVyUXVlc3Rpb25VcCA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncXVlc3Rpb24tbnVtYmVyJyksXG4gICAgbGltaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsaW1pdCcpLFxuICAgIHF1ZXN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY3VycmVudC1xdWVzdGlvbicpO1xuXG4gICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICB7IGUgOiB0YXJnZXQsIHAgOiB7IGxlZnQgOiAnNTBweCcsIHRvcCA6ICcyMHB4JywgZm9udFNpemUgOiAnMC45cmVtJyB9IH0sXG4gICAgICAgIHsgZSA6IHF1ZXN0aW9uLCAgcCA6ICd0cmFuc2l0aW9uLnNsaWRlVXBJbicgfSxcbiAgICAgICAgeyBlIDogbGltaXQsIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsIG8gOiB7IGNvbXBsZXRlIDogY3RybC5zdGFydFF1ZXN0aW9uLmJpbmQoY3RybCkgfSB9XG4gICAgXTtcblxuICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbn07XG5cbnZhciByZW5kZXJBbnN3ZXJzT3V0ID0gZnVuY3Rpb24oY3RybCwgZWwpe1xuICAgIC8vIFZlbG9jaXR5XG4gICAgdmFyIHRhcmdldHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhbnN3ZXInKSxcbiAgICAgICAgbGltaXQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsaW1pdCcpLFxuICAgICAgICBxdWVzdGlvbk51bWJlciA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3F1ZXN0aW9uLW51bWJlcicpLFxuICAgICAgICBxdWVzdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2N1cnJlbnQtcXVlc3Rpb24nKTtcblxuICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgeyBlIDogdGFyZ2V0cywgcCA6ICd0cmFuc2l0aW9uLmJvdW5jZU91dCcsIG8gOiB7IGR1cmF0aW9uIDogNTAwIH0gfSxcbiAgICAgICAgeyBlIDogcXVlc3Rpb24sIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwT3V0JywgbyA6IHsgZHVyYXRpb24gOiA1MDAgfSB9LFxuICAgICAgICB7IGUgOiBsaW1pdCwgcCA6ICdmYWRlT3V0JywgbyA6IHsgZHVyYXRpb24gOiAyMDAgLCBjb21wbGV0ZSA6IGN0cmwuYWZ0ZXJFbmRRdWVzdGlvbi5iaW5kKGN0cmwpIH0gfVxuICAgIF07XG5cbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG59O1xuXG52YXIgcmVuZGVyU3RhcnRRdWVzdGlvbiA9IGZ1bmN0aW9uKGN0cmwsIGVsKXtcbiAgICAvLyBTaG93IHRoZSBxdWVzdGlvbnNcbiAgICBlbC5jaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdiZWdpbicpO1xuXG4gICAgLy8gZ2V0IGFuc3dlcnMgYW5kIHJlbW92ZSB3ZWlyZCBpbml0IHN0eWxlXG4gICAgdmFyIGFuc3dlcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdhbnN3ZXJzLWFyZWEnKVswXTtcbiAgICBhbnN3ZXJzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgIGFuc3dlcnMuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgXG4gICAgLy8gU2hvdyB0aGUgYW5zd2Vyc1xuICAgIHZhciB1bCA9IGFuc3dlcnMuY2hpbGRyZW5bMF0sXG4gICAgICAgIHF1ZXN0aW9uTnVtYmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgncXVlc3Rpb24tbnVtYmVyJyksXG4gICAgICAgIHNlcXVlbmNlID0gW1xuICAgICAgICAgICAgeyBlIDogdWwuY2hpbGRyZW4sIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsIG8gOiB7IHN0YWdnZXIgOiAnMjAwbXMnLCBjb21wbGV0ZSA6IHJlbmRlclF1ZXN0aW9uVXAuYmluZCh0aGlzLCBjdHJsLCBlbCkgfSB9XG4gICAgICAgIF07XG5cbiAgICBpZihjdHJsLlZNLmN1cnJlbnRRdWVzdGlvbigpID4gMCkgc2VxdWVuY2UudW5zaGlmdCh7IGUgOiBxdWVzdGlvbk51bWJlciwgcCA6ICdyZXZlcnNlJyB9KTtcbiAgICBWZWxvY2l0eS5SdW5TZXF1ZW5jZShzZXF1ZW5jZSk7XG4gICAgY3RybC5WTS5xdWVzdGlvblNob3duKHRydWUpO1xufTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsKXtcbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgLy8gRGVjaWRlIHdoYXQgdG8gZG8gXG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgcmVuZGVyR2FtZVBhZ2UoY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVuZCBvZiBxdWVzdGlvblxuICAgICAgICBlbHNlIGlmKGN0cmwuVk0uZW5kUXVlc3Rpb24oKSl7XG4gICAgICAgICAgICByZW5kZXJBbnN3ZXJzT3V0KGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzaG93IHRoZSBxdWVzdGlvblxuICAgICAgICBlbHNlIGlmKCFjdHJsLlZNLmdhbWVPdmVyKCkgJiYgIWN0cmwuVk0ucXVlc3Rpb25TaG93bigpKXtcbiAgICAgICAgICAgIHJlbmRlclN0YXJ0UXVlc3Rpb24oY3RybCwgZWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVuZCBvZiBnYW1lIFxuICAgICAgICBlbHNlIGlmKGN0cmwuVk0uZ2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgcmVuZGVyT3V0KGN0cmwsIGVsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2dhbWUtcGFnZScsIFtcbiAgICAgICAgbSgnLmdhbWUtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnaGVhZGVyLmdhbWUtaGVhZGVyLm91dC10b3AtZnVsbCcsIFtcbiAgICAgICAgICAgICAgICB0aW1lclZpZXcoY3RybCwgY3RybC5WTS50aW1lcigpKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5pbnRybycsICdHZXQgcmVhZHknKSxcbiAgICAgICAgICAgICAgICBtKCdoMy5xdWVzdGlvbi1udW1iZXInLCBcInF1ZXN0aW9uIFwiICsgKCtjdHJsLlZNLmN1cnJlbnRRdWVzdGlvbigpICsgMSkpLFxuICAgICAgICAgICAgICAgIG0oJ2gzLmN1cnJlbnQtcXVlc3Rpb24ub3BhcXVlJywgY3RybC5WTS5xdWVzdGlvbigpLnF1ZXN0aW9uRWxlbWVudCgpKSxcbiAgICAgICAgICAgICAgICBtKCdoNC5saW1pdC5vcGFxdWUnLCBbJ0Nob29zZSAnLCBtKCdzcGFuJywgY3RybC5WTS5xdWVzdGlvbigpLmxpbWl0KCkpXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLmFuc3dlcnMtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtKFwidWxcIiwgW1xuICAgICAgICAgICAgICAgICAgICBjdHJsLlZNLnF1ZXN0aW9uKCkuYW5zd2VycygpLm1hcChmdW5jdGlvbihhbnN3ZXIsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW5zd2VyVmlldyhjdHJsLCBhbnN3ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIEhhbW1lciA9IHJlcXVpcmUoJ2hhbW1lcmpzJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBMb2FkaW5nID0gZnVuY3Rpb24oY3RybCl7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgdmFyIHNlcXVlbmNlID0gW1xuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMF0sIHAgOiAndHJhbnNpdGlvbi5zbGlkZVVwSW4nLCBvIDogeyBkdXJhdGlvbiA6IDMwMCwgZGVsYXkgOiAzMDAsIG9wYWNpdHkgOiAwIH0gfSxcbiAgICAgICAgICAgIHsgZSA6IGVsLmNoaWxkcmVuWzFdLCBwIDogJ3RyYW5zaXRpb24uc2xpZGVVcEluJywgbyA6IHsgZHVyYXRpb24gOiAzMDAgfSB9LFxuICAgICAgICAgICAgeyBlIDogZWwuY2hpbGRyZW5bMl0sIHAgOiAndHJhbnNpdGlvbi5ib3VuY2VJbicsICBvIDogeyBkdXJhdGlvbiA6IDMwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBlbC5jaGlsZHJlblszXSwgcCA6IHsgb3BhY2l0eSA6IDEsIHJvdGF0ZVogOiAnLTI1JywgcmlnaHQgOiAtNTAgfSwgbyA6IHsgZHVyYXRpb24gOiA1MDAsIGVhc2luZyA6IFsgMjUwLCAxNSBdIH0gfVxuICAgICAgICBdO1xuXG4gICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnaW50cm8nO1xuICAgICAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVmVsb2NpdHkoZWwuY2hpbGRyZW4sICd0cmFuc2l0aW9uLmZhZGVPdXQnLCB7IHN0YWdnZXIgOiAnMTAwbXMnIH0pLnRoZW4oY3RybC5zdGFydEdhbWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBldmVudHMgPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgIGlmKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB2YXIgaGFtbWVydGltZSA9IG5ldyBIYW1tZXIoZWwpO1xuICAgICAgICAgICAgaGFtbWVydGltZS5vbigndGFwJywgY3RybC5vbkJlZ2luKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2ludHJvLXBhZ2UnLCBbXG4gICAgICAgIG0oJy5pbnRyby1ob2xkZXInLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMi5vcGFxdWUnLCBjdHJsLlZNLnRpdGxlKCkpLFxuICAgICAgICAgICAgbSgnLmRlc2NyaXB0aW9uLm9wYXF1ZScsIGN0cmwuVk0uZGVzY3JpcHRpb24oKSksXG4gICAgICAgICAgICBtKCdhLmJlZ2luLm9wYXF1ZScsIHsgY29uZmlnOiBldmVudHMgfSwgJ2JlZ2luJyksXG4gICAgICAgICAgICBtKCcuYnJhbmQub3BhcXVlLm91dC1yaWdodC1mYXInLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKHswfSknLnJlcGxhY2UoJ3swfScsIGN0cmwuVk0uYnJhbmQoKSkgfSB9KVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkaW5nOyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBMb2FkaW5nID0gZnVuY3Rpb24oY3RybCl7XG5cbiAgICB2YXIgYW5pbUluID0gZnVuY3Rpb24oZWwsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB0cmFuc2xhdGVYIDogJys9MTAwJScgfSwgeyBkZWxheSA6IDIwMCwgZHVyYXRpb24gOiAzMDAsIGVhc2luZyA6ICdlYXNlJyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKGN0cmwuVk0ubG9hZGVkKCkpIFZlbG9jaXR5KGVsLCBcInJldmVyc2VcIikudGhlbihjdHJsLm9ubG9hZGVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbSgnI2xvYWRpbmctcGFnZScsIFtcbiAgICAgICAgbSgnLm1lc3NhZ2UtaG9sZGVyLm91dC1sZWZ0LWZ1bGwnLCB7XG4gICAgICAgICAgICBjb25maWcgOiBhbmltSW5cbiAgICAgICAgfSxbXG4gICAgICAgICAgICBtKCdoMycsICdMb2FkaW5nICcgKyBjdHJsLlZNLnByb2dyZXNzKCkgKyAnJScpXG4gICAgICAgIF0pXG4gICAgXSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvYWRpbmc7IiwiLyogR2xvYmFsIG1vZHVsZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbSA9IHJlcXVpcmUoJ21pdGhyaWwnKSxcbiAgICBWZWxvY2l0eSA9IHJlcXVpcmUoJ3ZlbG9jaXR5LWFuaW1hdGUnKTtcblxudmFyIFZpZXcgPSBmdW5jdGlvbihjdHJsLCB0aW1lcil7XG5cbiAgICB2YXIgcmVuZGVyU2NvcmVib2FyZEluID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Jlc3VsdHMnKVswXSxcbiAgICAgICAgICAgIHNjb3JlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3Njb3JlcycpWzBdLmNoaWxkcmVuWzBdO1xuXG4gICAgICAgIHZhciBzZXF1ZW5jZSA9IFtcbiAgICAgICAgICAgIHsgZSA6IHJlc3VsdC5jaGlsZHJlbiwgcCA6ICd0cmFuc2l0aW9uLmV4cGFuZE91dCcsIG8gOiB7IGRlbGF5IDogMTAwMCB9IH0sXG4gICAgICAgICAgICB7IGUgOiBzY29yZXMuY2hpbGRyZW4sIHAgOiAndHJhbnNpdGlvbi5zbGlkZUxlZnRCaWdJbicsIG8gOiB7IHN0YWdnZXIgOiAyMDAgfSB9XG4gICAgICAgIF07XG4gICAgICAgIFZlbG9jaXR5LlJ1blNlcXVlbmNlKHNlcXVlbmNlKTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbmRlclJlcGxheSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnYnRuJyk7XG4gICAgICAgIFZlbG9jaXR5KGEsICdmYWRlSW4nLCB7IHN0YWdnZXIgOiAyMDAsIGNvbXBsZXRlIDogcmVuZGVyU2NvcmVib2FyZEluLmJpbmQodGhpcykgfSk7XG4gICAgfTtcblxuICAgIHZhciBhbmltSW4gPSBmdW5jdGlvbihlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuICAgICAgICBpZighaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAncmVzdWx0JztcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyZXN1bHRzJylbMF07XG4gICAgICAgICAgICB2YXIgc2VxdWVuY2UgPSBbXG4gICAgICAgICAgICAgICAgeyBlIDogcmVzdWx0LmNoaWxkcmVuWzBdLCBwIDogJ3RyYW5zaXRpb24ud2hpcmxJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMV0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicgfSxcbiAgICAgICAgICAgICAgICB7IGUgOiByZXN1bHQuY2hpbGRyZW5bMl0sIHAgOiAndHJhbnNpdGlvbi5leHBhbmRJbicsIG8gOiB7IGNvbXBsZXRlIDogcmVuZGVyUmVwbGF5LmJpbmQodGhpcykgfSB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgVmVsb2NpdHkuUnVuU2VxdWVuY2Uoc2VxdWVuY2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKCcjcmVzdWx0LXBhZ2UnLCBbXG4gICAgICAgIG0oJy5yZXN1bHQtaG9sZGVyJywge1xuICAgICAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgICAgIH0sW1xuICAgICAgICAgICAgbSgnLnJlc3VsdHMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnJlc3VsdC1pbWFnZS5vcGFxdWUnLCB7IHN0eWxlIDogeyBiYWNrZ3JvdW5kSW1hZ2UgOiAndXJsKCcgKyBjdHJsLlZNLnJlc3VsdEltYWdlKCkgKyAnKScgfSB9KSxcbiAgICAgICAgICAgICAgICBtKCdoMS5yZXN1bHQub3BhcXVlJywgY3RybC5WTS5zY29yZSgpICsgJy8nICsgY3RybC5WTS5oaWdoU2NvcmUoKSksXG4gICAgICAgICAgICAgICAgbSgncC5vcGFxdWUnLCBjdHJsLlZNLm1lc3NhZ2UoKSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnNjb3JlcycsIFtcbiAgICAgICAgICAgICAgICBtKCdvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5WTS5zY29yZUJvYXJkKCkubWFwKGZ1bmN0aW9uKHMsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAgKGkgPT09IDApID8gJ2ZpcnN0JyA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICBzLmlzQ3VycmVudCA/ICcgY3VycmVudCcgOiAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpLm9wYXF1ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuc2NvcmUtaXRlbScsIHsgY2xhc3MgOiBjbGFzc05hbWUgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzLnNjb3JlICsgJyBwb2ludHMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHMuZnJpZW5kbHlUaW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBtKCdhLmJ0bi5yZXBsYXkub3BhcXVlW2hyZWY9XCIjL2dhbWVcIl0nLCAnVHJ5IEFnYWluJyksXG4gICAgICAgICAgICBtKCdhLmJ0bi5sZXZlbDIub3BhcXVlJywgJ0xldmVsIDInKVxuICAgICAgICBdKVxuICAgIF0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3OyIsIi8qIEdsb2JhbCBtb2R1bGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG0gPSByZXF1aXJlKCdtaXRocmlsJyksXG4gICAgVmVsb2NpdHkgPSByZXF1aXJlKCd2ZWxvY2l0eS1hbmltYXRlJyk7XG5cbnZhciBWaWV3ID0gZnVuY3Rpb24oY3RybCwgdGltZXIpe1xuXG4gICAgdmFyIGFuaW1JbiA9IGZ1bmN0aW9uKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG4gICAgICAgIGlmKCF0aW1lcikgcmV0dXJuO1xuICAgICAgICBpZighdGltZXIuaXNBY3RpdmUoKSl7XG4gICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6ICcxMDAlJyB9LCB7IGR1cmF0aW9uIDogdGltZXIudGltZSgpLCBlYXNpbmcgOiAnbGluZWFyJyB9KS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY3RybC5vblRpbWUoKTtcbiAgICAgICAgICAgICAgICBWZWxvY2l0eShlbCwgeyB3aWR0aCA6IDAgfSwgIHsgZHVyYXRpb24gOiAyMDAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbWVyLmlzQWN0aXZlKHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBtKFwiLnRpbWVyXCIsIHtcbiAgICAgICAgY29uZmlnIDogYW5pbUluXG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7Il19
