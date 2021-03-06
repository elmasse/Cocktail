/*
 *
 * Copyright (c) 2013 Maximiliano Fierro
 * Licensed under the MIT license.
 */
'use strict';

var sequence = require('../sequence'),
    Merge;


/**
 * @constructor
 */
Merge = function(options) {
    var useProto;
    if(options) {
        useProto = options.usePrototypeWhenSubjectIsClass;
        this._usePrototypeWhenSubjectIsClass = (useProto === false) ? useProto : true;
    }
};

Merge.prototype = {
    retain   : false,
    priority : sequence.MERGE,
    name     : '@merge',

    _parameter   : undefined,

    _usePrototypeWhenSubjectIsClass: true,

    _strategies: {
        'single'     : '_mergeMine',
        'mine'       : '_mergeMine',
        'their'      : '_mergeTheir',
        'deep-mine'  : '_mergeDeepMine',
        'deep-their' : '_mergeDeepTheir'
    },

    setParameter: function(value){
        this._parameter = value;
    },

    getParameter: function() {
        return this._parameter;
    },

    /**
     * mine merge strategy: mine params over their. If params is already defined it gets overriden.
     */
    _mergeMine : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                mine[key] = their[key];
            }
        }

        return mine;
    },


     /**
     * deepMine merge strategy: mine params over their. 
     * If params is already defined and it is an object it is merged with strategy mine,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepMine : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                if(typeof their[key] === "object"){
                    if(their[key] instanceof Array){
                        mine[key] = [].concat(mine[key], their[key]);
                    }else{
                        mine[key] = this._mergeMine(mine[key], their[key]);
                    }
                }else{
                    mine[key] = their[key];
                }
            }
        }
        return mine;
    },

    /**
     * their merge strategy: their params over mine. If params is already defined it doesn't get overriden.
     */
    _mergeTheir : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key) && mine[key] === undefined ){
                mine[key] = their[key];
            }
        }

        return mine;        
    },



     /**
     * deepMine merge strategy: their params over mine. 
     * If params is already defined and it is an object it is merged with strategy their,
     * if params is already defined and it is an array it is concatenated,
     * otherwise it gets overriden with mine.
     */
     _mergeDeepTheir : function(mine, their){
        var key;

        for(key in their){
            if(their.hasOwnProperty(key)){
                if(typeof their[key] === "object"){
                    if(their[key] instanceof Array){
                        mine[key] = [].concat(mine[key], their[key]);
                    }else{
                        mine[key] = this._mergeTheir(mine[key], their[key]);
                    }
                }else if(mine[key] === undefined ){
                    mine[key] = their[key];
                }
            }
        }
        return mine;
    },    

    _shouldUsePrototypeWhenSubjectIsClass: function() {
        return this._usePrototypeWhenSubjectIsClass;
    },

    process: function(subject, proto){
        var their = proto,
            useProto = this._shouldUsePrototypeWhenSubjectIsClass(),
            mine = (useProto && subject.prototype) || subject,
            strategy = this._strategies[this.getParameter()];

        this[strategy](mine, their);
    }
};

module.exports = Merge;
