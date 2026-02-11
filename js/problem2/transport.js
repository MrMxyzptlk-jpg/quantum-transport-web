export function transmissionDP(E, eps0, gammaL, gammaR, gammaPhi) {

    const gammaTot = gammaL + gammaR + gammaPhi;
    const D = (E - eps0) ** 2 + gammaTot ** 2;

    const Tcoh = 4 * gammaL * gammaR / D;

    if (gammaPhi === 0) return Tcoh;

    const factor = 1 + gammaPhi / (gammaL + gammaR);

    return Tcoh * factor;
}
