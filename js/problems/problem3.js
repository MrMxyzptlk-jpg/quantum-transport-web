export function initProblem3Graph(alpha) {
    const i = math.complex(0,1);
    const phase = math.exp(math.multiply(i, -alpha));

    return [

        // Leads
        { data: { id: 'L', label: 'L' }, classes: 'lead-site', position: { x: 40,  y: 150 } },
        { data: { id: 'R', label: 'R' }, classes: 'lead-site', position: { x: 280, y: 150 } },

        // Main sites
        { data: { id: 'A', label: 'A', eps: 0 }, position: { x: 120, y: 150 } },
        { data: { id: 'B', label: 'B', eps: 0 }, position: { x: 200, y: 150 } },
        { data: { id: 'C', label: 'C', eps: 0, active: true }, position: { x: 160, y: 90 } },

        // Fictitious probes
        { data: { id: 'phiA', label: 'φA' }, classes: 'probe-site', position: { x: 120, y: 210 } },
        { data: { id: 'phiB', label: 'φB' }, classes: 'probe-site', position: { x: 200, y: 210 } },

        // Real couplings
        { data: { source: 'L', target: 'A', label: 'ΓL' } },
        { data: { source: 'A', target: 'B', V: 1 } },
        { data: { source: 'B', target: 'R', label: 'ΓR' } },
        { data: { source: 'A', target: 'C', V: 1 } },
        { data: { source: 'C', target: 'B', V: phase } },

        // Decoherence couplings
        { data: { source: 'A', target: 'phiA', label: 'Γφ' } },
        { data: { source: 'B', target: 'phiB', label: 'Γφ' } },
    ];
}
