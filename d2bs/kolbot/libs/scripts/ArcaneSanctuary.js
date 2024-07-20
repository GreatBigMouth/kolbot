const ArcaneSanctuary = new Runnable(
  function ArcaneSanctuary () {
    Pather.useWaypoint(sdk.areas.ArcaneSanctuary);
    Precast.doPrecast(true);

    Attack.clearLevel(Config.ClearType);

    return true;
  },
  {
    startArea: sdk.areas.ArcaneSanctuary
  }
);
