export function transmission(E, H, index, gamma) {
    const N = H.size()[0];
    const I = math.identity(N);

    let SigmaL = math.zeros(N, N);
    let SigmaR = math.zeros(N, N);

    if ('A' in index)
        SigmaL.set([index['A'], index['A']], math.complex(0, -gamma / 2));

    if ('B' in index)
        SigmaR.set([index['B'], index['B']], math.complex(0, -gamma / 2));

    const Gr = math.inv(
        math.subtract(math.multiply(E, I), math.add(H, SigmaL, SigmaR))
    );

    const Ga = math.conj(math.transpose(Gr));

    let GammaL = math.zeros(N, N);
    let GammaR = math.zeros(N, N);

    if ('A' in index)
        GammaL.set([index['A'], index['A']], gamma);

    if ('B' in index)
        GammaR.set([index['B'], index['B']], gamma);

    return Math.max(
        0,
        math.re(math.trace(math.multiply(GammaL, Gr, GammaR, Ga)))
    );
}
