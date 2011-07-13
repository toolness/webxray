"use strict";

module("command-manager");

test("jQuery.commandManager() works w/ multiple cmd types", function() {
  var log = [];
  
  function genericCmd(name, options) {
    var x = options.state ? options.state.x : options.x;
    return {
      name: name,
      execute: function() { log.push("execute " + name + " x:" + x); },
      undo: function() { log.push("undo " + name + " x:" + x); },
      serialize: function() { return {x: x}; }
    };
  }

  function cmdA(options) { return genericCmd("A", options); }
  function cmdB(options) { return genericCmd("B", options); }
  
  function makeCommandManager() {
    var cmdMgr = jQuery.commandManager({
      hud: {},
      focusedOverlay: {
        focus: function() {},
        unfocus: function() {}
      },
      transitionEffects: {
        observe: function() {},
        disableDuring: function(cb) { cb(); }
      }
    });
  
    cmdMgr.register(cmdA);
    cmdMgr.register(cmdB);

    return cmdMgr;
  }
  
  var cmdMgr = makeCommandManager();
  cmdMgr.run("cmdA", {x: 1});
  cmdMgr.run("cmdB", {x: 5});
  
  deepEqual(log, ["execute A x:1", "execute B x:5"],
            "different constructors are registered " +
            "and executed properly");
  log = [];
  
  var serialized = cmdMgr.serializeUndoStack();
  deepEqual(log, ["undo B x:5", "undo A x:1",
                  "execute A x:1", "execute B x:5"],
            "different constructors are undone/exec'd properly " +
            "during serializeUndoStack()");
  log = [];

  deepEqual(serialized, [{x: 5, __cmd__:"cmdB"},
                         {x: 1, __cmd__:"cmdA"}],
            "different constructors are serialized properly");
  serialized = JSON.stringify(serialized);
  
  cmdMgr = makeCommandManager();
  cmdMgr.deserializeUndoStack(JSON.parse(serialized));
  deepEqual(log, ["undo B x:5", "undo A x:1",
                  "execute A x:1", "execute B x:5"],
            "different constructors are undone/exec'd properly" +
            "during deserializeUndoStack()");
});
