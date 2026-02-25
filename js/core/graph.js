export function createGraph(elements) {

    return cytoscape({
        container: document.getElementById('graph'),
        elements: elements,

        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'background-color': '#0074D9',
                    'color': '#fff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#aaa'
                }
            },
            {
                selector: '.lead-site',
                style: {
                    'border-width': 3,
                    'border-color': '#000',
                    'border-style': 'dashed'
                }
            },
            {
                selector: '.probe-site',
                style: {
                    'background-color': '#bbbbbb',
                    'shape': 'ellipse',
                    'width': 60,
                    'height': 40,
                    'border-width': 2,
                    'border-style': 'dotted',
                    'border-color': '#666',
                    'opacity': 0.8,
                    'font-style': 'italic'
                }
            }
        ],

        layout: { name: 'preset' }
    });
}
