import { initProblem1Graph } from './graph.js';
import { runProblem } from '../../core/main.js';
import { initUI } from '../../core/ui.js';
import { createGraph } from '../../core/graph.js';

// ---------- 1. Graph ----------
const cy = createGraph(initProblem1Graph(0));

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

const gammaInput = document.getElementById('gamma');
const gammaVal   = document.getElementById('gammaVal');

gammaInput.addEventListener('input', () => {
    gammaVal.textContent = gammaInput.value;
    updatePlot();
});

// ---------- 4. Magnetic Flux ----------
const nodeC = cy.getElementById('C');
const toggleC = document.getElementById('toggleC');


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
// ---------- 5. Init UI ----------
initUI(cy, updatePlot);


// ---------- 6. Initial State ----------
window.addEventListener('load', () => {
    alphaInput.dispatchEvent(new Event('input'));
    updatePlot();
});
