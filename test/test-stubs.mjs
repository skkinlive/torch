import assert from 'assert';

// These stubs provide all (and only) the features we use from Foundry objects

export class MockItem {
  name;
  img;
  system;
  constructor(name, quantity) {
      this.name = name;
      this.img = `${name}.png`;
      if (typeof quantity === "undefined") {
      this.system = {};
      } else {
      this.system = {quantity: quantity};
      }
  }
  update(props) {
      for (let prop in props) {
      let subprops = prop.split('.');
      let where = this;
      for (let i = 0; i < subprops.length - 1; i++) {
          where = where[subprops[i]];
      }
      where[subprops[subprops.length - 1]] = props[prop];
      }
  };
};
  
export class MockActor {
  constructor(id, name, items, protoBright, protoDim) {
    this.system = {id: id};
    this.name = name;
    this.items = items;
    this.prototypeToken = {
      light: {
        bright: protoBright,
        dim: protoDim
      }
    }
  }
};
  
export class MockToken {
  name;
  system;
  light;
  constructor(actor, lightSource, state) {
    this.name = actor.name;
    this.actor = actor;
    this.actorId = this.actor.system.id;
    this.flags = {};
    this.light = {};
    if (lightSource) {
      this.flags.lightSource = lightSource;
    }
    if (state) {
      this.flags.lightSourceState = state;
    }
  }
  getFlag(modname, flagname) {
    assert.equal(modname, 'torch');
    return this.flags[flagname];
  };
  setFlag(modname, flagname, value) {
    assert.equal(modname, 'torch');
    this.flags[flagname] = value;
  };
  update(props) {
    for (let prop in props) {
      let subprops = prop.split('.');
      let where = this;
      for (let i = 0; i < subprops.length - 1; i++) {
          where = where[subprops[i]];
      }
      where[subprops[subprops.length - 1]] = props[prop];
    }
  };
};

export class MockGame {
  getSetting(modname, settingName) { 
    assert.equal(modname, 'torch');
    let value = this.settingsData[settingName];
    assert.notEqual(value, undefined, `Value for setting ${settingName} is undefined`);
    return value;
  };
  getActor(id) {
    return this.actorData.find ( (actor) => actor.system.id === id );
  }
  constructor (system, actors, isGM, settings) {
    this.actorData = actors;
    this.settingsData = settings; 
    this.user = { isGM: isGM };
    this.system = { id: system };
    this.actors = {
      get : (id) => this.getActor(id)
    }
    this.settings = {
      get : (modname, settingName) => this.getSetting(modname, settingName)
    }
  };
};
