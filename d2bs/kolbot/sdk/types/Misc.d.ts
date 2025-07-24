export {};
declare global {
  namespace Misc {
    const _diabloSpawned: boolean;
    const screenshotErrors: boolean;
    const errorConsolePrint: boolean;
    const useItemLog: boolean;
    let shrineStates: number[] | null;
    const _shrinerIgnore: Set<number>;
    const lastShrine: {
      tick: number;
      duration: number;
      type: number;
      state: number;
      update(unit: ObjectUnit): void;
      remaining(): number;
      isMyCurrentState(): boolean;
    };

    function click(button: number, shift: number, x?: number | Unit, y?: number): boolean;
    function inMyParty(name: string): boolean;
    function findPlayer(name: string): Party | false;
    function getPlayerUnit(name: string): Player | false;
    function getPlayerAct(player: Party | string): number | false;
    function getNearbyPlayerCount(): number;
    function getPlayerCount(): number;
    function getPartyCount(): number;
    function getPartyMembers(): Party[];
    function checkPartyLevel(levelCheck?: number, exclude?: string | string[]): boolean;
    function getPlayerArea(player: Party | string): number | false;
    function autoLeaderDetect(givenSettings?: {
      destination?: number | number[];
      quitIf?: (area: number) => boolean;
      timeout?: number;
    }): string | false;
    function openChest(unit: Unit | number): boolean;
    function openChestsInArea(area?: number, chestIds?: number[]): boolean;
    function openChests(range?: number): boolean;
    function shriner(ignore: number[]): boolean;
    function scanShrines(range: number, ignore: number[]): boolean;
    function getShrine(unit: ObjectUnit): boolean;
    function getShrinesInArea(area: number, type: number, use: boolean): boolean;
    /** @deprecated */
    function townCheck(): boolean;
    function spy(name: string): boolean;
    function errorReport(error: Error | string, script?: string): void;
    function debugLog(msg: string): void;
    function useMenu(id: number): boolean;
    function poll<T>(check: () => T, timeout?: number, sleep?: number): T | false;
    function getUIFlags(excluded?: number[]): number[] | null;
    function getQuestStates(questId: number): number[];
  }
}
