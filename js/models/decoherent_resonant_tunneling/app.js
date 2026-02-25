import { initProblem2Graph } from './graph.js';
import { runProblem } from '../../core/main.js';

// ---------- 1. Create graph ----------
const cy = cytoscape({
    container: document.getElementById('graph'),
    elements: initProblem2Graph(),
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
    layout: { name: 'preset' }
});


// ---------- 2. Reservoir Builder ----------
function reservoirBuilder() {

    const gammaL   = parseFloat(document.getElementById('gammaL').value);
    const gammaR   = parseFloat(document.getElementById('gammaR').value);
    const gammaPhi = parseFloat(document.getElementById('gammaPhi').value);

    return [
        { site: 'A', gamma: gammaL,   type: 'L' },
        { site: 'A', gamma: gammaR,   type: 'R' },
        { site: 'A', gamma: gammaPhi, type: 'phi' }
    ];
}


// ---------- 3. Run problem ----------
const updatePlot = runProblem(cy, reservoirBuilder);


// ---------- 4. UI Binding ----------

// Onsite energy ε0
const epsInput = document.getElementById('eps');
const epsVal   = document.getElementById('epsVal');

epsInput.addEventListener('input', () => {
    const val = parseFloat(epsInput.value);
    cy.getElementById('A').data('eps', val);
    epsVal.textContent = val;
    updatePlot();
});


// Gamma sliders
['gammaL', 'gammaR', 'gammaPhi'].forEach(id => {

    const input = document.getElementById(id);
    const label = document.getElementById(id + 'Val');

    input.addEventListener('input', () => {
        label.textContent = input.value;
        updatePlot();
    });
});


// ---------- 5. Initial plot ----------
window.addEventListener('load', () => {
    updatePlot();
});
