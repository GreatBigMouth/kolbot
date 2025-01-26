export {};
declare global {
  type GlobalScript = () => boolean;
  type ScriptContext = { [key: string]: any };
  interface RunnableOptions {
    setup?: (ctx: ScriptContext) => any;
    preAction?: (ctx: ScriptContext) => any;
    postAction?: (ctx: ScriptContext) => any;
    cleanup?: (ctx: ScriptContext) => any;
    forceTown?: boolean;
    bossid?: number;
    startArea?: number;
  }

  class Runnable {
    constructor(action: () => boolean, options: Partial<RunnableOptions>);

    action: (ctx: ScriptContext) => boolean;
    startArea: number | null;
    setup: ((ctx: ScriptContext) => any) | null;
    preAction: (ctx: ScriptContext) => any;
    postAction: ((ctx: ScriptContext) => any) | null;
    cleanup: ((ctx: ScriptContext) => any) | null;
    forceTown: boolean;
    bossid: number | null;
  }
  
  namespace Loader {
    const fileList: string[];
    const scriptList: string[];
    const scriptIndex: number;
    const skipTown: string[];
    const firstScriptAct: number;
    const currentScript: GlobalScript | Runnable | null;
    const nextScript: GlobalScript | Runnable | null;
    const doneScripts: Set<string>;
    const tempList: string[];

    function init(): void;
    function getScripts(): void;
    function _runCurrent(ctx: ScriptContext): boolean;
    function clone(obj: any): void;
    function copy(from: any, to: any): void;
    function loadScripts(): void;
    function runScript(name: string, configOverride: Partial<Config> | (() => any)): boolean;
    function scriptName(offset?: number): string;
  }

  type Scripts = {
    [key: string]: boolean;
  };

  const Scripts: Scripts;
}
