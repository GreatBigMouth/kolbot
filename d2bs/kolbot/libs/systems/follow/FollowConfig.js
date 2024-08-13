/**
*  @filename    FollowConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotFollow system
*
*/

(function (module) {
  /**
   * @description Join game settings
   * - Format: "leader's profile": ["leecher 1 profile", "leecher 2 profile", ...]
   * - If you want everyone to join the same leader, use "leader's profile": ["all"]
   * - NOTE: Use *PROFILE* names (profile matches window title), NOT character/account names
   * - leader:leecher groups need to be divided by a comma
   * @example
   *  const JoinSettings = {
   *    "lead1": ["follow1", "follow2"],
   *    "lead2": ["follow3", "follow4"]
   *  };
   */
  const JoinSettings = {
    "Wakka.Leader": [
      "Wakka.Helper",
      "Wakka.Follow1",
      "Wakka.Follow2",
      "Wakka.Follow3",
      "Wakka.Follow4",
      "Wakka.Follow5",
      "Wakka.Follow6",
    ],
    "LS.CH.Leader": [
      "LS.CH.Follow1",
      "LS.CH.Follow2",
      "LS.CH.Follow3",
      "LS.CH.Follow4",
      "LS.CH.Follow5",
      "LS.CH.Follow6",
      "LS.CH.Follow7",
      "LS.CH.Follow8",
    ],
    "LS.CH.MFLeader": [
      "LS.CH.MFHelp1",
      "LS.CH.MFHelp2",
      "LS.CH.MFHelp3",
      "LS.CH.MFHelp4",
      "LS.CH.MFHelp5",
      "LS.CH.MFHelp6",
      "LS.CH.MFHelp7"
    ]
  };

  module.exports = {
    JoinSettings: JoinSettings,
  };
})(module);
