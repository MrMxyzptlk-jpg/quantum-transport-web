export function buildHamiltonianFromGraph(cy, phi) {
    const i = math.complex(0, 1);

    const nodes = cy.nodes().filter(n =>
        n.data('eps') !== undefined &&
        n.data('active') !== false
    );

    const N = nodes.length;
    const index = {};
    nodes.forEach((n, k) => index[n.id()] = k);

    let H = math.zeros(N, N);

    // onsite terms
    nodes.forEach(n => {
        const k = index[n.id()];
        H.set([k, k], n.data('eps'));
    });

    const phaseP = math.exp(math.multiply(i,  phi / 2));
    const phaseM = math.exp(math.multiply(i, -phi / 2));

    cy.edges().forEach(edge => {
        const s = edge.source().id();
        const t = edge.target().id();

        if (!(s in index) || !(t in index)) return;
        if (edge.data('V') === undefined) return;

        let hop = edge.data('V');

        // AB phase convention (Problem 1 loop)
        if ((s === 'A' && t === 'C') || (s === 'C' && t === 'B'))
            hop = math.multiply(hop, phaseP);

        if ((s === 'C' && t === 'A') || (s === 'B' && t === 'C'))
            hop = math.multiply(hop, phaseM);

        H.set([index[s], index[t]], hop);
        H.set([index[t], index[s]], math.conj(hop));
    });

    return { H, index };
}
