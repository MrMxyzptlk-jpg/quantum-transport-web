const cy = cytoscape({
    container: document.getElementById('graph'),

    layout: {
        name: 'preset'
    },

    elements: [
        { data: { id: 'L', label: 'L' }, position: { x: 40,  y: 150 } },
        { data: { id: 'A', label: 'A' }, position: { x: 120, y: 150 } },
        { data: { id: 'B', label: 'B' }, position: { x: 200, y: 150 } },
        { data: { id: 'C', label: 'C' }, position: { x: 160, y: 90  } },
        { data: { id: 'R', label: 'R' }, position: { x: 280, y: 150 } },

        { data: { source: 'L', target: 'A', label: 'ΓL' } },
        { data: { source: 'A', target: 'B', label: 'VAB' } },
        { data: { source: 'B', target: 'R', label: 'ΓR' } },
        { data: { source: 'A', target: 'C', label: 'VAC' } },
        { data: { source: 'C', target: 'B', label: 'VCB' } }
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

const V = 1.0;

const epsAVal = document.getElementById('epsAVal');
const epsBVal = document.getElementById('epsBVal');
const epsCVal   = document.getElementById('epsCVal');
const gammaVal = document.getElementById('gammaVal');
const phiVal   = document.getElementById('phiVal');

function updateLabels() {
    epsAVal.textContent = epsAInput.value;
    epsBVal.textContent = epsBInput.value;
    epsCVal.textContent = epsCInput.value;
    gammaVal.textContent = gammaInput.value;
    phiVal.textContent = phiInput.value;
}

function transmissionDQD(E, epsA, epsB, epsC, gamma, phi) {
    const i = math.complex(0, 1);

    // parameters (hardcoded for now)
    const VAB = 1.0;
    const VAC = 0.8;
    const VCB = 0.8;

    // Aharonov–Bohm phase (gauge choice)
    const phaseP = math.exp(math.multiply(i,  phi / 2));
    const phaseM = math.exp(math.multiply(i, -phi / 2));

    // 3×3 Hamiltonian
    const H = math.matrix([
        [epsA, VAB, math.multiply(VAC, phaseP)],
        [VAB,  epsB, math.multiply(VCB, phaseM)],
        [math.multiply(VAC, phaseM),
         math.multiply(VCB, phaseP),
         epsC]
    ]);

    // Self-energies (serial coupling)
    const SigmaL = math.matrix([
        [math.complex(0, -gamma / 2), 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]);

    const SigmaR = math.matrix([
        [0, 0, 0],
        [0, math.complex(0, -gamma / 2), 0],
        [0, 0, 0]
    ]);

    const Gr = math.inv(
        math.subtract(
            math.multiply(E, math.identity(3)),
            math.add(H, SigmaL, SigmaR)
        )
    );

    const Ga = math.conj(math.transpose(Gr));

    const GammaL = math.matrix([
        [gamma, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]);

    const GammaR = math.matrix([
        [0, 0, 0],
        [0, gamma, 0],
        [0, 0, 0]
    ]);

    const T = math.trace(
        math.multiply(GammaL, Gr, GammaR, Ga)
    );

    return Math.max(0, math.re(T));
}


function updatePlot() {
    const epsA = parseFloat(epsAInput.value);
    const epsB = parseFloat(epsBInput.value);
    const epsC = parseFloat(epsCInput.value);
    const gamma = parseFloat(gammaInput.value);
    const phi = parseFloat(phiInput.value);

    const E = [];
    const T = [];

    for (let e = -4; e <= 4; e += 0.05) {
        E.push(e);
        T.push(transmissionDQD(e, epsA, epsB, epsC, gamma, phi));
    }

    Plotly.newPlot('plot', [{
            x: E,
            y: T,
            mode: 'lines',
            name: 'T(E)'
        }], {
            xaxis: { title: 'Energy E' },
            yaxis: { title: 'Transmission T(E)', range: [-0.1, 1.1] },
        },
        { responsive: true }
    );
}

const epsAInput = document.getElementById('epsA');
const epsBInput = document.getElementById('epsB');
const epsCInput = document.getElementById('epsC');
const gammaInput = document.getElementById('gamma');
const phiInput = document.getElementById('phi');

[epsAInput, epsBInput, epsCInput, gammaInput, phiInput].forEach(el =>
    el.addEventListener('input', () => {
        updateLabels();
        updatePlot();
    })
);

updateLabels();
updatePlot();

window.addEventListener('resize', () => {
    Plotly.Plots.resize('plot');
});