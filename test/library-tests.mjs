import assert from 'assert';
import SourceLibrary from '../src/library.mjs';

const testLights = {
  "dnd5e": {
    "sources": {
      "Phantom Torch": {
        "consumable": true,
        "light": [
          { "bright": 5, "dim": 20, "angle": 360, "color": "#ff9329", "alpha": 0.6 }
        ]
      },
      "Candle": {
        "consumable": true,
        "light": { 
          "bright": 10, "dim": 15, "angle": 360, "color": "#ff9329", "alpha": 0.5,
          "animation": { "type": "torch", "speed": 5, "intensity": 5, "reverse": false } 
        }
      }
    }
  },
  "test": {
    "topology": "gurps",
    "sources": {
      "Flashlight": {
        "light": { "bright": 10, "dim": 0, "angle": 3, "color": "#ffd6aa", "alpha": 1.0 }
      }
    }
  }
};

class MockItem {
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

describe('Torch Library Tests >', () => {
  describe('Library defaulting tests >', () => {
    it('library defaults are all applied - no reference', () => {
      let lib = {
        fakeSystem: { 
          sources: {
            nuke: { light: {bright: 5, dim: 10, angle: 360 } },
            other: { light: [ {bright: 10, dim: 20, angle: 360} ] }
          },
          aliases: {
            bomb: "nuke",
            alt: "other"
          } 
        }
      }
      SourceLibrary.applyFieldDefaults(lib);
      assert.equal(lib['fakeSystem'].system, 'fakeSystem');
      assert.equal(lib['fakeSystem'].topology, 'standard');
      assert.equal(lib['fakeSystem'].quantity, 'quantity');
      assert.equal(lib['fakeSystem'].sources['nuke'].name, 'nuke');
      assert.equal(lib['fakeSystem'].sources['nuke'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['nuke'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['nuke'].states, 2);
      assert.equal(lib['fakeSystem'].sources['nuke'].light.length, 1);
      assert.equal(lib['fakeSystem'].sources['nuke'].light[0].bright, 5);
      assert.equal(lib['fakeSystem'].sources['other'].name,'other');
      assert.equal(lib['fakeSystem'].sources['other'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['other'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['other'].states, 2);
      assert.equal(lib['fakeSystem'].sources['other'].light[0].bright, 10);
      assert.equal(lib['fakeSystem'].sources['bomb'].name, 'bomb');
      assert.equal(lib['fakeSystem'].sources['bomb'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['bomb'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['bomb'].states, 2);
      assert.equal(lib['fakeSystem'].sources['bomb'].light.length, 1);
      assert.equal(lib['fakeSystem'].sources['bomb'].light[0].bright, 5);
      assert.equal(lib['fakeSystem'].sources['alt'].name,'alt');
      assert.equal(lib['fakeSystem'].sources['alt'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['alt'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['alt'].states, 2);
      assert.equal(lib['fakeSystem'].sources['alt'].light[0].bright, 10);
    })
    it('library defaults are all applied - with reference', () => {
      let lib = {
        fakeSystem: { 
          sources: {
            nuke: { light: {bright: 5, dim: 10, angle: 360 } },
            other: { light: [ {bright: 10, dim: 20, angle: 360} ] }
          },
          aliases: {
            crazy: "special"
          }
        }
      };
      let ref = {
        fakeSystem: { topology: "gurps", quantity: "amount", sources: {
          other: { type: "spell", consumable: true, states: 2, light: [ {bright: 15, dim: 30, angle: 57}]},
          special: { type: "equipment", consumable: false, states: 2, light: [ {bright: 20, dim: 35, angle: 90}]}
        }}
      };
      SourceLibrary.applyFieldDefaults(lib, ref);
      assert.equal(lib['fakeSystem'].system, 'fakeSystem');
      assert.equal(lib['fakeSystem'].topology, 'gurps');
      assert.equal(lib['fakeSystem'].quantity, 'amount');
      assert.equal(lib['fakeSystem'].sources['nuke'].name, 'nuke');
      assert.equal(lib['fakeSystem'].sources['nuke'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['nuke'].consumable, false,"Consumable matches for nuke");
      assert.equal(lib['fakeSystem'].sources['nuke'].states, 2);
      assert.equal(lib['fakeSystem'].sources['nuke'].light.length, 1);
      assert.equal(lib['fakeSystem'].sources['nuke'].light[0].bright, 5);
      assert.equal(lib['fakeSystem'].sources['other'].name,'other');
      assert.equal(lib['fakeSystem'].sources['other'].type, 'spell');
      assert.equal(lib['fakeSystem'].sources['other'].consumable, true, "Consumable matches for other");
      assert.equal(lib['fakeSystem'].sources['other'].states, 2);
      assert.equal(lib['fakeSystem'].sources['other'].light[0].bright, 10);
      assert.equal(lib['fakeSystem'].sources['crazy'].name,'crazy');
      assert.equal(lib['fakeSystem'].sources['crazy'].type, 'equipment');
      assert.equal(lib['fakeSystem'].sources['crazy'].consumable, false, "Consumable matches for other");
      assert.equal(lib['fakeSystem'].sources['crazy'].states, 2);
      assert.equal(lib['fakeSystem'].sources['crazy'].light[0].bright, 20);
      assert.equal(lib['fakeSystem'].sources['special'], undefined);

    })
    it('library defaults do not override actual data - no reference', () => {
      let lib = {
        fakeSystem: { 
          system: "aSystem",
          topology: "gurps",
          quantity: "count",
          sources: {
            nuke: { name: "Nuke2", type: "spell", consumable: true, states: 3, 
              light: [{bright: 15, dim: 20, angle: 360 }, {bright: 20, dim: 40, angle: 57}] },
            other: { name: "Other", type: "spell", consumable: false, states: 2, light: [ {bright: 10, dim: 20, angle: 360} ] }
        } }
      }
      SourceLibrary.applyFieldDefaults(lib);
      assert.equal(lib['fakeSystem'].system, 'aSystem');
      assert.equal(lib['fakeSystem'].topology, 'gurps');
      assert.equal(lib['fakeSystem'].quantity, 'count');
      assert.equal(lib['fakeSystem'].sources['nuke'].name, 'Nuke2');
      assert.equal(lib['fakeSystem'].sources['nuke'].type, 'spell');
      assert.equal(lib['fakeSystem'].sources['nuke'].consumable, true);
      assert.equal(lib['fakeSystem'].sources['nuke'].states, 3);
      assert.equal(lib['fakeSystem'].sources['nuke'].light.length, 2);
      assert.equal(lib['fakeSystem'].sources['nuke'].light[0].bright, 15);
      assert.equal(lib['fakeSystem'].sources['other'].name,'Other');
      assert.equal(lib['fakeSystem'].sources['other'].type, 'spell');
      assert.equal(lib['fakeSystem'].sources['other'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['other'].states, 2);
      assert.equal(lib['fakeSystem'].sources['other'].light[0].bright, 10);
    })

    it('library defaults do not override actual data - with reference', () => {
      let lib = {
        fakeSystem: { 
          system: "aSystem",
          topology: "gurps",
          quantity: "count",
          sources: {
            nuke: { name: "Nuke2", type: "spell", consumable: "true", states: 3, 
              light: [{bright: 15, dim: 20, angle: 360 }, {bright: 20, dim: 40, angle: 57}] },
            other: { name: "Other", type: "spell", consumable: "false", states: 2, light: [ {bright: 10, dim: 20, angle: 360} ] }
        } }
      }
      let ref = {
        fakeSystem: { topology: "gurps", quantity: "amount", sources: {
          other: { type: "spell", consumable: true, "states": 2, light: [ {bright: 15, dim: 30, angle: 57}]}
        }}
      };
      SourceLibrary.applyFieldDefaults(lib, ref);
      assert.equal(lib['fakeSystem'].system, 'aSystem');
      assert.equal(lib['fakeSystem'].topology, 'gurps');
      assert.equal(lib['fakeSystem'].quantity, 'count');
      assert.equal(lib['fakeSystem'].sources['nuke'].name, 'Nuke2');
      assert.equal(lib['fakeSystem'].sources['nuke'].type, 'spell');
      assert.equal(lib['fakeSystem'].sources['nuke'].consumable, true);
      assert.equal(lib['fakeSystem'].sources['nuke'].states, 3);
      assert.equal(lib['fakeSystem'].sources['nuke'].light.length, 2);
      assert.equal(lib['fakeSystem'].sources['nuke'].light[0].bright, 15);
      assert.equal(lib['fakeSystem'].sources['other'].name,'Other');
      assert.equal(lib['fakeSystem'].sources['other'].type, 'spell');
      assert.equal(lib['fakeSystem'].sources['other'].consumable, false);
      assert.equal(lib['fakeSystem'].sources['other'].states, 2);
      assert.equal(lib['fakeSystem'].sources['other'].light[0].bright, 10);
    })

  });

  describe('Library Loading tests >', () => {
    beforeEach(function () {
    });
    afterEach(function() {
      SourceLibrary.commonLibrary = undefined;
    });
    it('library load for D&D 5e without a user library', async () => {
      assert.equal(SourceLibrary.commonLibrary, undefined, "no common library loaded initially");
      let library = await SourceLibrary.load('dnd5e', 10, 50, 'Torch');
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.equal(candle.light[0].bright, 5, "common candle bright light level");
      assert.equal(candle.light[0].dim, 10, "common candle dim light level");
      let torch = library.getLightSource("torch");
      assert.equal(torch.light[0].bright, 10, "torch bright light level from settings");
      assert.equal(torch.light[0].dim, 50, "torch dim light level from settings");
      let phantom = library.getLightSource("phantom torch");
      assert.equal(phantom, undefined, "No phantom torch defined as expected");
    });
    it('library load for D&D 5e with no user inventory item set', async () => {
      assert.equal(SourceLibrary.commonLibrary, undefined, "no common library loaded initially");
      let library = await SourceLibrary.load('dnd5e', 50, 10, undefined);
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.equal(candle.light[0].bright, 5, "common candle bright light level");
      assert.equal(candle.light[0].dim, 10, "common candle dim light level");
      assert.equal(candle.light[0].alpha, undefined, "no candle alph level set");
      let torch = library.getLightSource("torch");
      assert.equal(torch.light[0].bright, 20, "common torch bright light level");
      assert.equal(torch.light[0].dim, 40, "common torch dim light level");
    });
    it('library load for D&D 5e with a user library', async () => {
      assert.equal(SourceLibrary.commonLibrary, undefined, "no common library loaded initially");
      let library = await SourceLibrary.load('dnd5e', 10, 50, 'Torch', testLights);
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.equal(candle.light[0].bright, 10, "user candle bright light level");
      assert.equal(candle.light[0].dim, 15, "user candle dim light level");
      assert.equal(candle.light[0].alpha, 0.5, "user candle has alpha defined");
      let torch = library.getLightSource("torch");
      assert.equal(torch.light[0].bright, 10, "torch bright light level from settings");
      assert.equal(torch.light[0].dim, 50, "torch dim light level from settings");
      let phantom = library.getLightSource("phantom torch");
      assert.ok(phantom, "The phantom torch light source exists in the data");
      assert.equal(phantom.light[0].bright, 5, "user phantom torch bright light level");
      assert.equal(phantom.light[0].dim, 20, "user phantom torch bright light level");
    });
    it('library load for GURPS with a user library with a GURPS flashlight', async () => {
      assert.equal(SourceLibrary.commonLibrary, undefined, "no common library loaded initially");
      let library = await SourceLibrary.load('test', 50, 10, 'Torch', testLights);
      assert.ok(SourceLibrary.commonLibrary, "common library loaded");
      let candle = library.getLightSource("candle");
      assert.equal(candle, undefined, "No candle defined as expected");
      let selfSource = library.getLightSource("self");
      assert.equal(selfSource, undefined, "No self light source defined as expected");
      let flashlight = library.getLightSource("flashlight");
      assert.ok(flashlight, "Flashlight defined as expected");
      assert.equal(flashlight.light[0].bright, 10, "user flashlight light level");
      assert.equal(flashlight.light[0].dim, 0, "user flashlight light level");
      assert.equal(flashlight.light[0].angle, 3, "user flashlight light angle");
    });
  });
  describe('D&D5e Library Topology test >', () => {

    it('Actor inventory settings for Versatile in D&D5e with a user library', async () => {
      let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', testLights);
      let versatile = {
        items: [
          new MockItem("Torch", 5),
          new MockItem("Candle", 5),
          new MockItem("Light"),
          new MockItem("Lamp"),
        ]
      };
      let torches = library.getInventory(versatile, "Torch");
      assert.ok(typeof torches === "number", "Count of torches has a numeric value");
      let candles = library.getInventory(versatile, "Candle");
      assert.ok(typeof candles === "number", "Count of candles has a numeric value");
      let lights = library.getInventory(versatile, "Light");
      assert.ok(typeof lights === "undefined", "Light cantrip doesn't have inventory");
      let lamps = library.getInventory(versatile, "Lamp");
      assert.ok(typeof lamps === "undefined", "Lamp doesn't have inventory");
      await library._presetInventory(versatile, "Torch", 2);
      let before = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterFirst = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterSecond = library.getInventory(versatile, "Torch");
      await library.decrementInventory(versatile, "Torch");
      let afterThird = library.getInventory(versatile, "Torch");
      assert.equal(before, 2, "Started with set value");
      assert.equal(afterFirst, 1, "Decremented to one");
      assert.equal(afterSecond, 0, "Decremented to zero");
      assert.equal(afterThird, 0, "Remained at zero");
    });
    it('Actor image settings for Versatile in D&D5e with a user library', async () => {
      let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', testLights);
      let versatile = {
        items: [
          new MockItem("Torch", 5),
          new MockItem("Candle", 5),
          new MockItem("Light"),
          new MockItem("Lamp"),
        ]
      };
      let torchImage = library.getImage(versatile, "Torch");
      assert.ok(torchImage, "Torch should have a defined image");
      assert.notEqual(torchImage,"", "Torch image has a reasonable value");
      let candleImage = library.getImage(versatile, "Candle");
      assert.ok(candleImage, "Candle should have a defined image");
      assert.notEqual(candleImage,"", "Candle image has a reasonable value");
      let lampImage = library.getImage(versatile, "Lamp");
      assert.ok(lampImage, "Lamp should have a defined image");
      assert.notEqual(lampImage,"", "Lamp image has a reasonable value");
      let lightImage = library.getImage(versatile, "Light");
      assert.ok(lightImage, "Light cantrip should have a defined image");
      assert.notEqual(lightImage,"", "Light cantrip image has a reasonable value");
    });
    
    it('Actor light sources for Lightbearer, Breaker, Empty, and Bic in D&D5e with a user library', async () => {
      let library = await SourceLibrary.load('dnd5e', 50, 10, 'Torch', testLights);

      let breaker = { items: [ new MockItem("Torch"), new MockItem("Dancing Lights")] };
      let breakerSources = library.actorLightSources(breaker); 
      assert.equal (breakerSources.length, 2, "Breaker has two known light sources");
      assert.notEqual(breakerSources[0].name, breakerSources[1].name, "Breaker's sources are different");
      assert.ok (["Torch", "Dancing Lights"].includes(breakerSources[0].name), "Breaker's first source is expected");
      assert.ok (["Torch", "Dancing Lights"].includes(breakerSources[1].name), "Breaker's second source is expected");
      assert.equal(library.actorHasLightSource(breaker, "Dancing Lights"), true, "Breaker is reported as having Dancing Lights");

      let bearer = { items: [ new MockItem("Torch", 5) ] };
      let bearerSources = library.actorLightSources(bearer);
      assert.equal(bearerSources.length, 1, "Torchbearer has precisely one light source");
      assert.equal(bearerSources[0].name, "Torch", "Torchbearer's light source is Torch, as eqpected");
      assert.equal(library.actorHasLightSource(bearer, "Torch"), true, "Bearer is reported as having the Torch light source");

      let empty = { items: [] };
      let emptySources = library.actorLightSources(empty);
      assert.equal (emptySources.length, 0, "Empty truly has no known light sources");
      assert.equal(library.actorHasLightSource(empty, "Candle"), false, "Empty is reported as not having the candle light source");

      let everythingBut = { items: [ new MockItem("Flashlight"), new MockItem("Blowtorch", 5), new MockItem("Magical Floodlight")] };
      let everythingButSources = library.actorLightSources(everythingBut);
      assert.equal(everythingButSources.length, 0, "Bic has no known light sources, even though it has ways of casting light");
      assert.equal(library.actorHasLightSource(everythingBut, "Candle"), false, "Empty is reported as not having the candle light source");
    });

  });
});
