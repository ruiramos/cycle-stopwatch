import Cycle from '@cycle/core';
import {makeDOMDriver, div, input, p, button, span, h1} from '@cycle/dom';
import { Observable, Subject } from 'rx';

require('../styles.less');

const _setPlaying = (p) => {
  document.querySelector('iframe').contentWindow
    .postMessage({playing: p}, '*');
}

// returns an array with `n` values, set to `undefined`
const arrayWithElm = (n) => Array.apply(null, {length: n});

// pads a string with `n` `v`s
const pad = (n, s, v='0') => {
  let str = String(s),
    pad = arrayWithElm(n - str.length).map(() => v);

  return pad.join('')+str;
}

const pad3 = (s) => pad(3, s);
const pad2 = (...s) => s.map((v) => pad(2,v));

// formats a string from elapsed time in ms
const formatMinutes = (ms) => pad2(Math.floor(ms/1000/60));
const formatSeconds = (ms) => pad2(Math.floor((ms/1000) % 60));
const formatMiliseconds = (ms) => pad3(ms % 1000);

const toggleTimerText = function(isTimerOn){
  return isTimerOn ? 'Stop timer' : 'Start timer'
}

/**
 * Cycle stuff!
 */

function main(drivers){
  const STEP = 32;  // timer goes every 32 ms

  const pauser = new Subject();

  const timer$ = Observable.timer(0, STEP)
    .map((c, i) => STEP)
    .pausable(pauser);

  const toggleButton$ = drivers.DOM
    .select('button[data-hook=toggle-timer]')
    .events('click')
    .map(() => ':toggle');

  const resetButton$ = drivers.DOM
    .select('button[data-hook=reset-timer]')
    .events('click')
    .map(() => ':reset');

  const timerStatus$ = toggleButton$
    .scan((p, v) => {
      if(v === ':toggle'){
        pauser.onNext(!p);
        _setPlaying(!p);
        return !p;
      }
      return p;
    }, false)
    .startWith(false);

  const timerValue$ = Observable.merge(timer$, resetButton$)
    .scan((acc, x) => {
      if(x === ':reset') // timer restarted
        return 0;

      return acc + x;
    })
    .startWith(0);

  const $events = Observable.combineLatest(timerValue$, timerStatus$);

  const $actions = $events.scan((a, x) => {
    return x;
  });
  
  return {
    DOM: $actions
      .map(([msTimerValue, isTimerOn]) => div({
        id: 'timer'
      },[
        p({className: 'title' + (isTimerOn ? ' title--on' : '')}, '⏱'),
        div({'className': 'numbers', 'data-hook': 'timer'}, [
          span({'className': 'numbers__minutes'}, formatMinutes(msTimerValue)),
          span({className: 'numbers__separator'}, ':'),
          span({'className': 'numbers__second'}, formatSeconds(msTimerValue)), 
          span({className: 'numbers__separator'}, ':'),
          span({'className': 'numbers__miliseconds'}, formatMiliseconds(msTimerValue)),
        ]),
        button({
          type: 'button',
          className: 'button--grey',
          attributes: {
            'data-hook': 'reset-timer'
          }
        }, 'Reset timer'), 
        button({
          type: 'button', 
          className: 'button--green',
          attributes: {
            'data-hook': 'toggle-timer'
          }
        }, toggleTimerText(isTimerOn))
      ]))
  }
}

const drivers = {
  DOM: makeDOMDriver('#app')
};


Cycle.run(main, drivers);


