export function transmission(E, H, index, reservoirs) {
    const N = H.size()[0];
    const I = math.identity(N);

    let Sigma = math.zeros(N, N);
    let Gamma = {};

    // Build all self-energies
    reservoirs.forEach(res => {
        const { site, gamma } = res;

        if (!(site in index)) return;

        const k = index[site];

        Sigma.set([k, k], math.add(
            Sigma.get([k, k]),
            math.complex(0, -gamma)
        ));
    });

    const Gr = math.inv(
        math.subtract(math.multiply(E, I), math.add(H, Sigma))
    );

    const Ga = math.conj(math.transpose(Gr));

    // Build Γ matrices only for transport leads
    const left  = reservoirs.find(r => r.type === 'L');
    const right = reservoirs.find(r => r.type === 'R');

    let GammaL = math.zeros(N, N);
    let GammaR = math.zeros(N, N);

    if (left && left.site in index)
        GammaL.set([index[left.site], index[left.site]], left.gamma);

    if (right && right.site in index)
        GammaR.set([index[right.site], index[right.site]], right.gamma);

    return Math.max(
        0,
        math.re(
            math.trace(
                math.multiply(2, GammaL, Gr, 2, GammaR, Ga)
            )
        )
    );
}
