import { initProblem3Graph } from './problem3.js';
import { buildHamiltonianFromGraph } from '../core/hamiltonian.js';
import { runProblem } from '../core/main.js';
import { initUI } from '../core/ui.js';

// ---------- 1. Create graph ----------
const cy = cytoscape({
    container: document.getElementById('graph'),
    elements: initProblem3Graph(0),
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
                'border-width': 2,
                'border-color': '#000',
                'border-style': 'dashed',
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
    layout: {
        name: 'preset'
    }
});
// ---------- 2. Run problem ----------
const updatePlot = runProblem(cy, reservoirBuilder);

// ---------- 3. Reservoir Builder ----------
const gammaPhiInput = document.getElementById('gammaPhi');
const gammaPhiVal   = document.getElementById('gammaPhiVal');

gammaPhiInput.addEventListener('input', () => {
    gammaPhiVal.textContent = gammaPhiInput.value;
    updatePlot();
});

const gammaInput = document.getElementById('gamma');
const gammaVal   = document.getElementById('gammaVal');

gammaInput.addEventListener('input', () => {
    gammaVal.textContent = gammaInput.value;
    updatePlot();
});


function reservoirBuilder() {
    const gamma = parseFloat(document.getElementById('gamma').value);
    const gammaPhi = parseFloat(document.getElementById('gammaPhi').value);

    return [
        { site: 'A', gamma: gamma, type: 'L' },
        { site: 'B', gamma: gamma, type: 'R' },
        { site: 'A', gamma: gammaPhi, type: 'phi' },
        { site: 'B', gamma: gammaPhi, type: 'phi' }
    ];
}

// ---------- Toggle Aharonov–Bohm loop ----------
const alphaInput = document.getElementById('alpha');
const alphaVal   = document.getElementById('alphaVal');

alphaInput.addEventListener('input', () => {

    const alpha = parseFloat(alphaInput.value);
    alphaVal.textContent = alpha.toFixed(2);

    // e^{-iα}
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


const toggleC = document.getElementById('toggleC');
const nodeC = cy.getElementById('C');

function applyCState(on) {

    nodeC.data('active', on);

    nodeC.style('opacity', on ? 1 : 0.2);

    cy.edges().forEach(edge => {
        if (edge.source().id() === 'C' || edge.target().id() === 'C') {
            edge.style('opacity', on ? 1 : 0.2);
        }
    });

    alphaInput.disabled = !on;
}

toggleC.addEventListener('change', e => {
    applyCState(e.target.checked);
    updatePlot();
});

applyCState(toggleC.checked);

// ---------- 4. UI ----------
initUI(cy, updatePlot);

// Ensure magnetic phase matches slider at startup
alphaInput.dispatchEvent(new Event('input'));

// initial plot
window.addEventListener('load', () => {
    updatePlot();
});
