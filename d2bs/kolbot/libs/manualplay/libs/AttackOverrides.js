/**
*  @filename    AttackOverrides.js
*  @author      kolton, theBGuy
*  @desc        Attack.js fixes to improve functionality for map mode
*
*/

includeIfNotIncluded("core/Attack.js");

Attack.init = function (notify = false) {
  if (Config.Wereform) {
    ClassAttack.load(me.classid, require("../../core/Attacks/Wereform"));
  } else if (Config.CustomClassAttack && FileTools.exists("libs/core/Attacks/" + Config.CustomClassAttack + ".js")) {
    console.log("Loading custom attack file");
    ClassAttack.load(me.classid, require("../../core/Attacks/" + Config.CustomClassAttack));
  } else {
    ClassAttack.load(me.classid);
  }

  if (Config.AttackSkill[1] < 0 || Config.AttackSkill[3] < 0) {
    notify && console.log("ÿc1Bad attack config. Don't expect your bot to attack.");
  }

  this.getPrimarySlot();
  Skill.init();

  if (me.expansion) {
    Precast.checkCTA();
    this.checkInfinity();
    this.checkAuradin();
  }
};

