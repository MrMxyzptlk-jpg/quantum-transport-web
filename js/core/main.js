import { buildHamiltonianFromGraph } from './hamiltonian.js';
import { transmission } from './transport.js';

export function runProblem(cy, reservoirBuilder) {

    function updatePlot() {

        const reservoirs = reservoirBuilder();

        const { H, index } = buildHamiltonianFromGraph(cy);

        const E = [];
        const T = [];

        for (let e = -4; e <= 4; e += 0.01) {
            T.push(transmission(e, H, index, reservoirs));
            E.push(e);
        }
        Plotly.react('plot',
            [{
                x: E,
                y: T,
                mode: 'lines'
            }],
            {
                xaxis: { title: 'Energy E' },
                yaxis: { title: 'Transmission T(E)'}
            },
            { responsive: true }
        );
   }

    return updatePlot;
}
