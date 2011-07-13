"use strict";

module("command-manager");

test("jQuery.commandManager() works w/ multiple cmd types", function() {
  var log = [];
  
  function genericCmd(name) {
    return {
      name: name,
      execute: function() { log.push("execute " + name); },
      undo: function() { log.push("undo " + name); },
      serialize: function() {
        return {__cmd__: "cmd" + name};
      }
    };
  }

  function cmdA() { return genericCmd("A"); }
  function cmdB() { return genericCmd("B"); }
  
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
  cmdMgr.run("cmdA");
  cmdMgr.run("cmdB");
  
  deepEqual(log, ["execute A", "execute B"],
            "different constructors are registered " +
            "and executed properly");
  log = [];
  
  var serialized = cmdMgr.serializeUndoStack();
  deepEqual(log, ["undo B", "undo A", "execute A", "execute B"],
            "different constructors are undone/exec'd properly " +
            "during serializeUndoStack()");
  log = [];

  deepEqual(serialized, [{"__cmd__":"cmdB"},{"__cmd__":"cmdA"}],
            "different constructors are serialized properly");
  serialized = JSON.stringify(serialized);
  
  cmdMgr = makeCommandManager();
  cmdMgr.deserializeUndoStack(JSON.parse(serialized));
  deepEqual(log, ["undo B", "undo A", "execute A", "execute B"],
            "different constructors are undone/exec'd properly" +
            "during deserializeUndoStack()");
});
