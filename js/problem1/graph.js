export function initGraph() {
    return cytoscape({
        container: document.getElementById('graph'),
        layout: { name: 'preset' },

        elements: [
            { data: { id: 'L', label: 'L' }, position: { x: 40,  y: 150 } },
            { data: { id: 'A', label: 'A', eps: 0.0 }, position: { x: 120, y: 150 } },
            { data: { id: 'B', label: 'B', eps: 0.0 }, position: { x: 200, y: 150 } },
            { data: { id: 'C', label: 'C', eps: 0.0, active: false }, position: { x: 160, y: 90 } },
            { data: { id: 'R', label: 'R' }, position: { x: 280, y: 150 } },

            { data: { source: 'L', target: 'A', label: 'ΓL' } },
            { data: { source: 'A', target: 'B', label: 'VAB', V: 1.0 } },
            { data: { source: 'B', target: 'R', label: 'ΓR' } },
            { data: { source: 'A', target: 'C', label: 'VAC', V: 0.8 } },
            { data: { source: 'C', target: 'B', label: 'VCB', V: 0.8 } }
        ],

        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'background-color': '#0074D9',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'label': 'data(label)',
                    'font-size': 11,
                    'text-rotation': 'autorotate',
                    'text-margin-y': -10,
                    'text-background-opacity': 1,
                    'text-background-color': '#ffffff',
                    'text-background-padding': '2px'
                }
            }
        ]
    });
}
