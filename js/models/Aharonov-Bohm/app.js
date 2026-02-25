import { initProblem1Graph } from './graph.js';
import { runProblem } from '../../core/main.js';
import { initUI } from '../../core/ui.js';

// ---------- 1. Graph ----------
const cy = cytoscape({
    container: document.getElementById('graph'),
    elements: initProblem1Graph(0),

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
        }
    ],

    layout: { name: 'preset' }
});


// ---------- 2. Reservoir Builder ----------
function reservoirBuilder() {

    const gamma = parseFloat(document.getElementById('gamma').value);

    return [
        { site: 'A', gamma: gamma, type: 'L' },
        { site: 'B', gamma: gamma, type: 'R' }
    ];
}


// ---------- 3. Run Problem ----------
const updatePlot = runProblem(cy, reservoirBuilder);


// ---------- 4. Magnetic Flux ----------
const alphaInput = document.getElementById('alpha');
const alphaVal   = document.getElementById('alphaVal');

alphaInput.addEventListener('input', () => {

    const alpha = parseFloat(alphaInput.value);
    alphaVal.textContent = alpha.toFixed(2);

    const phase = math.exp(
        math.multiply(math.complex(0, 1), -alpha)
    );

    const edge = cy.edges().filter(e =>
        e.source().id() === 'C' &&
        e.target().id() === 'B'
    )[0];

    if (edge) {
        edge.data('V', phase);
    }

    updatePlot();
});


// ---------- 5. Init UI ----------
initUI(cy, updatePlot);


// ---------- 6. Initial State ----------
window.addEventListener('load', () => {
    alphaInput.dispatchEvent(new Event('input'));
    updatePlot();
});
