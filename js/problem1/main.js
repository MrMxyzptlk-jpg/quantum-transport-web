import { initGraph } from './graph.js';
import { buildHamiltonianFromGraph } from './hamiltonian.js';
import { transmission } from './transport.js';
import { initUI } from './ui.js';

const cy = initGraph();

const gammaInput = document.getElementById('gamma');
const phiInput   = document.getElementById('phi');

function updatePlot() {
    const gamma = parseFloat(gammaInput.value);
    const phi   = parseFloat(phiInput.value);

    const E = [];
    const T = [];

    for (let e = -4; e <= 4; e += 0.05) {
        const { H, index } = buildHamiltonianFromGraph(cy, phi);
        T.push(transmission(e, H, index, gamma));
        E.push(e);
    }

    Plotly.newPlot('plot', [{
        x: E,
        y: T,
        mode: 'lines'
    }], {
        xaxis: { title: 'Energy E' },
        yaxis: { title: 'Transmission T(E)', range: [-0.1, 1.1] }
    }, { responsive: true });
}

initUI(cy, updatePlot);
updatePlot();

window.addEventListener('resize', () =>
    Plotly.Plots.resize('plot')
);
