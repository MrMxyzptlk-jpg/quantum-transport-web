const cy = cytoscape({
    container: document.getElementById('graph'),

    layout: {
        name: 'preset'
    },

    elements: [
        { data: { id: 'L', label: 'L' }, position: { x: 40,  y: 150 } },
        { data: { id: 'A', label: 'A', eps: 0.0 }, position: { x: 120, y: 150 } },
        { data: { id: 'B', label: 'B', eps: 0.0 }, position: { x: 200, y: 150 } },
        { data: { id: 'C', label: 'C', eps: 0.0, active: true }, position: { x: 160, y: 90  } },
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

function transmissionDQD(E, gamma, phi) {
    const i = math.complex(0, 1);

    // parameters (hardcoded for now)
    const VAB = 1.0;
    const VAC = 0.8;
    const VCB = 0.8;

    // Aharonov–Bohm phase (gauge choice)
    const phaseP = math.exp(math.multiply(i,  phi / 2));
    const phaseM = math.exp(math.multiply(i, -phi / 2));

    // NxN system
    const { H, index } = buildHamiltonian(phi);
    const N = H.size()[0];
    const I = math.identity(N);


    // Self-energies (serial coupling)
    let SigmaL = math.zeros(N, N);
    let SigmaR = math.zeros(N, N);

    if ('A' in index)
        SigmaL.set([index['A'], index['A']], math.complex(0, -gamma/2));

    if ('B' in index)
        SigmaR.set([index['B'], index['B']], math.complex(0, -gamma/2));


    const Gr = math.inv(
        math.subtract(
            math.multiply(E, math.identity(N)),
            math.add(H, SigmaL, SigmaR)
        )
    );

    const Ga = math.conj(math.transpose(Gr));

    let GammaL = math.zeros(N, N);
    let GammaR = math.zeros(N, N);

    if ('A' in index)
        GammaL.set([index['A'], index['A']], gamma);

    if ('B' in index)
        GammaR.set([index['B'], index['B']], gamma);

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
        T.push(transmissionDQD(e, gamma, phi));
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

function bindOnsiteSlider(nodeId, input, label) {
    input.addEventListener('input', () => {
        const val = parseFloat(input.value);
        cy.getElementById(nodeId).data('eps', val);
        label.textContent = val;
        updatePlot();
    });
}

bindOnsiteSlider('A', epsAInput, epsAVal);
bindOnsiteSlider('B', epsBInput, epsBVal);
bindOnsiteSlider('C', epsCInput, epsCVal);


document.getElementById('toggleC').addEventListener('change', e => {
    const on = e.target.checked;

    const C = cy.getElementById('C');
    C.data('active', on);

    // visually fade
    C.style('opacity', on ? 1 : 0.2);

    // disable its edges
    cy.edges().forEach(edge => {
        if (edge.source().id() === 'C' || edge.target().id() === 'C') {
            edge.style('opacity', on ? 1 : 0.2);
        }
    });

    updatePlot();
});


[epsAInput, epsBInput, epsCInput, gammaInput, phiInput].forEach(el =>
    el.addEventListener('input', () => {
        updateLabels();
        updatePlot();
    })
);

function buildHamiltonian(phi) {
    const i = math.complex(0, 1);

    // internal active sites
    const nodes = cy.nodes().filter(n =>
        ['A','B','C'].includes(n.id()) &&
        n.data('active') !== false
    );

    const N = nodes.length;
    const index = {};
    nodes.forEach((n, k) => index[n.id()] = k);

    let H = math.zeros(N, N);

    // onsite energies
    nodes.forEach(n => {
        const k = index[n.id()];
        H.set([k, k], n.data('eps'));
    });
    const phaseP = math.exp(math.multiply(i,  phi / 2));
    const phaseM = math.exp(math.multiply(i, -phi / 2));

    cy.edges().forEach(edge => {
        const s = edge.source().id();
        const t = edge.target().id();

        if (!(s in index) || !(t in index)) return;

        const V = edge.data('V');

        let hop = V;

        // AB phase only on loop
        if ((s === 'A' && t === 'C') || (s === 'C' && t === 'B'))
            hop = math.multiply(V, phaseP);

        if ((s === 'C' && t === 'A') || (s === 'B' && t === 'C'))
            hop = math.multiply(V, phaseM);

        H.set([index[s], index[t]], hop);
        H.set([index[t], index[s]], math.conj(hop));
    });

    return { H, index };
}


updateLabels();
updatePlot();

window.addEventListener('resize', () => {
    Plotly.Plots.resize('plot');
});