export function buildHamiltonianFromGraph(cy) {
    const nodes = cy.nodes().filter(n =>
        n.data('eps') !== undefined &&
        n.data('active') !== false
    );

    const N = nodes.length;
    const index = {};
    nodes.forEach((n, k) => index[n.id()] = k);

    let H = math.zeros(N, N);

    // onsite
    nodes.forEach(n => {
        H.set([index[n.id()], index[n.id()]], n.data('eps'));
    });

    // hoppings (already include phase if needed)
    cy.edges().forEach(edge => {
        const s = edge.source().id();
        const t = edge.target().id();

        if (!(s in index) || !(t in index)) return;
        if (edge.data('V') === undefined) return;

        let hop = edge.data('V');

        H.set([index[s], index[t]], hop);
        H.set([index[t], index[s]], math.conj(hop));
    });

    return { H, index };
}
