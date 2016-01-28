'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise(){
    this.state = 'pending';
    this.value = {};
    this.handlerGroups = [];
}

$Promise.prototype.then = function(successCb, errorCb){
    if (typeof successCb !== 'function') {
        successCb = null;

    }
    if (typeof errorCb !== 'function') {
        errorCb = null;
    }
    var myDeferral = defer();
    var object = {'successCb': successCb, 'errorCb': errorCb, 'forwarder': myDeferral};
    this.handlerGroups.push(object);
    this.callHandlers();
    return myDeferral.$promise;
};

$Promise.prototype.callHandlers = function(){
    if (this.state === 'resolved') {
        for (var i = 0; i < this.handlerGroups.length; i++) {
            if (this.handlerGroups[i].successCb) {
                var nextVal = this.handlerGroups[i].successCb(this.value);
                this.handlerGroups[i].forwarder.resolve(nextVal);

                //this.handlerGroups[i].forwarder.resolve(this.value);
            }
            else {
                try{
                    this.handlerGroups[i].forwarder.resolve(this.value);
                } catch(err){
                    this.handlerGroups[i].forwarder.reject(err);
                }
                

            }
        }
        this.handlerGroups = [];
    }
    if (this.state === 'rejected') {
        for (var i = 0; i < this.handlerGroups.length; i++) {
            if (this.handlerGroups[i].errorCb) {
               var nextVal2 = this.handlerGroups[i].errorCb(this.value);
               this.handlerGroups[i].forwarder.resolve(nextVal2);
            }
            else {
                try{
                    this.handlerGroups[i].forwarder.reject(this.value);
                } catch(err){
                    this.handlerGroups[i].forwarder.reject(err);
                }
                
            }
        }
        this.handlerGroups = [];
    }
};

$Promise.prototype.catch = function(errorFn){
    return this.then(null, errorFn);
};

function Deferral(){
    this.$promise = new $Promise();
}

function defer(){
    return new Deferral();
}

Deferral.prototype.resolve = function(data){
    if (this.$promise.state === 'pending') {
        this.$promise.value = data;
        this.$promise.state = 'resolved';
        this.$promise.callHandlers();
    }
};

Deferral.prototype.reject = function(reason){
    if (this.$promise.state === 'pending') {
        this.$promise.value = reason;
        this.$promise.state = 'rejected';
        this.$promise.callHandlers();
    }
};












/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
