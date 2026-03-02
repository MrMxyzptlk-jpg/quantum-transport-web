// Sliders
const eps0Slider = document.getElementById("eps0");
const VgSlider = document.getElementById("Vg");
const VLSlider = document.getElementById("VL");
const VRSlider = document.getElementById("VR");
const omegaSlider = document.getElementById("omega");
const initialNSlider = document.getElementById("initialN"); 
const nmaxSlider = document.getElementById("nmax"); 

// Value spans
const eps0Val = document.getElementById("eps0Val");
const VgVal = document.getElementById("VgVal");
const VLVal = document.getElementById("VLVal");
const VRVal = document.getElementById("VRVal");
const omegaVal = document.getElementById("omegaVal");
const initialNVal = document.getElementById("initialNVal");
const nmaxVal = document.getElementById("nmaxVal");

eps0Slider.addEventListener("input", refresh);
VgSlider.addEventListener("input", refresh);
VLSlider.addEventListener("input", refresh);
VRSlider.addEventListener("input", refresh);
omegaSlider.addEventListener("input", refresh);
initialNSlider.addEventListener("input", refresh);
nmaxSlider.addEventListener("input", refresh);


function refresh(){
    updateValues();
    updatePlot();
}

// Math helper: Factorial
function factorial(n){
    if(n <= 0) return 1;
    let f = 1;
    for(let i=2; i<=n; i++) f *= i;
    return f;
}

// Math helper: Combinations (n choose k)
function choose(n, k){
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let c = 1;
    for (let i = 1; i <= k; i++) {
        c = c * (n - i + 1) / i;
    }
    return c;
}

// Math helper: Associated Laguerre Polynomial L_n^(alpha)(x)
function laguerre(n, alpha, x){
    let sum = 0;
    for (let i = 0; i <= n; i++) {
        let term = Math.pow(-1, i) * choose(n + alpha, n - i) * Math.pow(x, i) / factorial(i);
        sum += term;
    }
    return sum;
}

// Exact Franck-Condon factor for n -> m transition
function franckCondon(n, m, S){
    let initial = n;
    let final = m;
    if (n > m) {
        initial = m;
        final = n;
    }

    let alpha = final - initial;
    let lag = laguerre(initial, alpha, S);
    let prefactor = Math.exp(-S) * (factorial(initial) / factorial(final)) * Math.pow(S, alpha);

    return prefactor * lag * lag;
}

// Exact Self-Energy for Semi-Infinite 1D Chain
function getSelfEnergy(E, V, t_lead = 1.0) {
    let Delta = 0; // Real part (Energy shift)
    let Gamma = 0; // Imaginary part (Escape rate)

    // Inside the tight-binding energy band [-2t, 2t]
    if (Math.abs(E) <= 2 * t_lead) {
        Delta = (V * V * E) / (2 * t_lead * t_lead);
        Gamma = (V * V * Math.sqrt(4 * t_lead * t_lead - E * E)) / (2*t_lead * t_lead);
    }
    // Outside the band (evanescent states)
    else {
        Delta = (V * V / (2 * t_lead * t_lead)) * (E - Math.sign(E) * Math.sqrt(E * E - 4 * t_lead * t_lead));
        Gamma = 0; // No available states to escape to
    }
    return { Delta, Gamma };
}

function transmission(E, eps0, VL, VR, Vg, omega, initialN, nmax){
    // --- Lead self-energies at incoming energy ---
    const sigL = getSelfEnergy(E, VL);
    const sigR = getSelfEnergy(E, VR);

    const GammaL = sigL.Gamma;
    const DeltaL = sigL.Delta;

    const GammaR = sigR.Gamma;
    const DeltaR = sigR.Delta;

    // If no injection possible → zero transmission
    if (GammaL === 0) return 0;

    const GammaTot = GammaL + GammaR;
    const DeltaTot = DeltaL + DeltaR;

    // --- Build continued fraction Σ_n ---
    let SigmaR = new Array(nmax + 1).fill(0);
    let SigmaI = new Array(nmax + 1).fill(0);

    // Boundary condition at truncation
    SigmaR[nmax] = 0;
    SigmaI[nmax] = 0;

    for(let n = nmax - 1; n >= 0; n--){

        const coupling2 = (Vg * Math.sqrt(n + 1))**2;

        const denomReal =
            E
            - eps0
            - (n + 1) * omega
            - DeltaTot
            - SigmaR[n + 1];

        const denomImag =
            - GammaTot
            - SigmaI[n + 1];

        const denomAbs2 = denomReal*denomReal + denomImag*denomImag;

        SigmaR[n] =  coupling2 * denomReal / denomAbs2;
        SigmaI[n] = -coupling2 * denomImag / denomAbs2;
    }

    // --- Diagonal Green function G_{n0,n0} ---

    const D0_real =
        E
        - eps0
        - initialN * omega
        - DeltaTot
        - SigmaR[initialN];

    const D0_imag =
        - GammaTot
        - SigmaI[initialN];

    const D0_abs2 = D0_real*D0_real + D0_imag*D0_imag;

    let G_real =  D0_real / D0_abs2;
    let G_imag = -D0_imag / D0_abs2;

    // Store G_{m,n0}
    let GmR = new Array(nmax + 1).fill(0);
    let GmI = new Array(nmax + 1).fill(0);

    GmR[initialN] = G_real;
    GmI[initialN] = G_imag;

    // --- Propagate upward ---
    for(let n = initialN; n < nmax; n++){

        const coupling = Vg * Math.sqrt(n + 1);

        const denomReal =
            E
            - eps0
            - (n + 1) * omega
            - DeltaTot
            - SigmaR[n + 1];

        const denomImag =
            - GammaTot
            - SigmaI[n + 1];

        const denomAbs2 = denomReal*denomReal + denomImag*denomImag;

        const factorReal =  coupling * denomReal / denomAbs2;
        const factorImag = -coupling * denomImag / denomAbs2;

        GmR[n+1] =
            factorReal * GmR[n] - factorImag * GmI[n];

        GmI[n+1] =
            factorReal * GmI[n] + factorImag * GmR[n];
    }

    // --- Compute total inelastic transmission ---
    let T_total = 0;

    for(let m = 0; m <= nmax; m++){

        const E_out = E - (m - initialN) * omega;

        const sigR_out = getSelfEnergy(E_out, VR);
        const GammaR_out = sigR_out.Gamma;

        if (GammaR_out === 0) continue;

        const G_abs2 = GmR[m]*GmR[m] + GmI[m]*GmI[m];

        T_total += 4 * GammaL * GammaR_out * G_abs2;
    }

    return T_total;
}

function updateValues(){
    eps0Val.textContent = eps0Slider.value;
    VgVal.textContent = VgSlider.value;
    VLVal.textContent = VLSlider.value;
    VRVal.textContent = VRSlider.value;
    omegaVal.textContent = omegaSlider.value;
    initialNVal.textContent = initialNSlider.value;
    nmaxVal.textContent = nmaxSlider.value;
}

/**
 * transmission3: Coherent Inelastic Sum (Polatronic Interference)
 * Implements the sum over virtual phonon states 'k' before squaring.
 * Matches the physics of Pastawski et al. (2002).
 */
function transmission3(E, eps0, VL, VR, Vg, omega, initialN, nmax) {
    const S = (Vg / omega) ** 2;
    const polaronShift = S * omega;
    const eps_tilde = eps0 - polaronShift;

    const sigL = getSelfEnergy(E, VL);
    const sigR_in = getSelfEnergy(E, VR);
    const GammaL = sigL.Gamma;
    const GammaR_in = sigR_in.Gamma;

    if (GammaL === 0) return 0;

    const GammaTot = GammaL + GammaR_in;
    const DeltaTot = sigL.Delta + sigR_in.Delta;

    let T_total = 0;

    // Sum over final phonon channels 'm'
    for (let m = 0; m <= nmax; m++) {
        const E_out = E - (m - initialN) * omega;
        const sigR_out = getSelfEnergy(E_out, VR);
        const GammaR_out = sigR_out.Gamma;

        if (GammaR_out === 0) continue;

        let ampReal = 0;
        let ampImag = 0;

        // COHERENT SUM: Interference between virtual states k
        for (let k = 0; k <= nmax; k++) {
            const overlap_kn = displacementOverlap(k, initialN, Vg / omega);
            const overlap_mk = displacementOverlap(m, k, -Vg / omega);

            const resDenomReal = E - (eps_tilde + k * omega) - DeltaTot;
            const resDenomImag = GammaTot;
            const det = resDenomReal ** 2 + resDenomImag ** 2;

            const Gk_R = resDenomReal / det;
            const Gk_I = resDenomImag / det; 

            const netOverlap = overlap_mk * overlap_kn;

            ampReal += netOverlap * Gk_R;
            ampImag += netOverlap * Gk_I;
        }

        const AmpSq = ampReal * ampReal + ampImag * ampImag;
        T_total += 4 * GammaL * GammaR_out * AmpSq;
    }
    return T_total;
}

/**
 * displacementOverlap: Signed matrix element <m|D(g)|n>
 * Required for coherent sums where phase/sign matters.
 */
function displacementOverlap(m, n, g) {
    const S = g * g;
    let i = n, f = m;
    if (n > m) { i = m; f = n; }

    const alpha = f - i;
    const lag = laguerre(i, alpha, S);
    const overlap = Math.exp(-S / 2) * Math.sqrt(factorial(i) / factorial(f)) * Math.pow(Math.abs(g), alpha) * lag;

    // Parity of the displacement operator
    const parity = (g < 0 && alpha % 2 !== 0) ? -1 : 1;
    const hermitianSign = (n > m && alpha % 2 !== 0) ? -1 : 1;

    return overlap * parity * hermitianSign;
}

function updatePlot(){

    const eps0 = parseFloat(eps0Slider.value);
    const Vg = parseFloat(VgSlider.value);
    const VL = parseFloat(VLSlider.value);
    const VR = parseFloat(VRSlider.value);
    const omega = parseFloat(omegaSlider.value);
    const initialN = parseInt(initialNSlider.value);
    const nmax = parseInt(nmaxSlider.value);

    let E = [];
    let T_dec = [];
    let T_fc = [];

    for(let e = -2.1; e <= 2.1; e += 0.001){
        E.push(e);
        T_dec.push(transmission(e, eps0, VL, VR, Vg, omega, initialN, nmax));
        T_fc.push(transmission3(e, eps0, VL, VR, Vg, omega, initialN, nmax));
    }

    Plotly.react("plot", [
        {
            x: E,
            y: T_dec,
            mode: "lines",
            name: "Decimation",
            line: {color: "#2ca02c", width: 5},
        },
        {
            x: E,
            y: T_fc,
            mode: "lines",
            name: "Franck–Condon",
            line: {color: "#d62728"}
        }

    ], {

        xaxis: {
            title: "Energy E",
            range: [-2.1, 2.1]
        },

        yaxis: {
            title: "Transmission T(E)",
            type: "log",
            range: [-4, 0],
            exponentformat: "power"
        },

        legend: {
            x: 1.02,
            y: 1,
            xanchor: "left",
            yanchor: "top"
        },

        margin: { r: 120 }
    });
}

// Init
refresh();
