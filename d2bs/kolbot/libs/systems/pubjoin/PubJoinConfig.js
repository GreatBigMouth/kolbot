/**
*  @filename    PubJoinConfig.js
*  @author      theBGuy
*  @desc        Configuration file for D2BotPubJoin system
*
*/

(function (module) {
  /**
   * @description includeFilter format
   * @example <caption>Multiple entries in the same array mean AND</caption>
   *  // game has to contain "baal" and "-"
   *  const includeFilter = ["baal", "-"];
   * 
   * @example <caption>Multiple entries in different arrays mean OR</caption>
   *  // will join games with either "baal" or "diablo" in their name
   *  const includeFilter = [
   *    ["baal"],
   *    ["diablo"]
   *  ];
   * @type {Array<Array<string>>}
   */
  const includeFilter = [
    [""]
  ];

  /**
   * @description excludeFilter format
   * @example <caption>Multiple entries in the same array mean AND</caption>
   *  // ignores games that contain "baal" and "-"
   *  const includeFilter = ["baal", "-"];
   * 
   * @example <caption>Multiple entries in different arrays mean OR</caption>
   *  // will ignore games with either "baal" or "diablo" in their name
   *  const includeFilter = [
   *    ["baal"],
   *    ["diablo"]
   *  ];
   * @type {Array<Array<string>>}
   */
  const excludeFilter = [
    [""]
  ];

  /**
   * @type {Record<string, { includeFilter?: Array<Array<string>>, excludeFilter?: Array<Array<string>>}>}
   */
  const profileOverides = {
    // "test": {
    //   includeFilter: [["trist"], ["tombs"]]
    // }
  };

  module.exports = {
    includeFilter: includeFilter,
    excludeFilter: excludeFilter,
    profileOverides: profileOverides,
  };
})(module);
