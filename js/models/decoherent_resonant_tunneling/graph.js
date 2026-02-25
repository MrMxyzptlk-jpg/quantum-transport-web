export function initProblem2Graph() {

    return [

        // Leads (visual only)
        { data: { id: 'L', label: 'L' }, classes: 'lead-site',
          position: { x: 40, y: 150 } },

        { data: { id: 'R', label: 'R' }, classes: 'lead-site',
          position: { x: 260, y: 150 } },

        // Central level
        { data: { id: 'A', label: 'A', eps: 0 },
          position: { x: 150, y: 150 } },

        // Probe (visual only)
        { data: { id: 'phi', label: 'φ' }, classes: 'probe-site',
          position: { x: 150, y: 230 } },

        // Couplings (purely visual)
        { data: { source: 'L', target: 'A', label: 'ΓL' } },
        { data: { source: 'A', target: 'R', label: 'ΓR' } },
        { data: { source: 'A', target: 'phi', label: 'Γφ' } }
    ];
}
