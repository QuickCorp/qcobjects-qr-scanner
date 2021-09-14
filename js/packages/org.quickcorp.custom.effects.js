'use strict';
Package('org.quickcorp.custom.effects',[
  Class('MainTransitionEffect',TransitionEffect,{
    duration:2000,
    defaultParams:{
      alphaFrom:0,
      alphaTo:1
    },
    effects:['Fade'],
    fitToHeight:true
  })
]);
