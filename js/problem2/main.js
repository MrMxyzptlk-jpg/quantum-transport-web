import { transmissionDP } from "./transport.js";
import { initUI } from "./ui.js";

const plotDiv = document.getElementById("plot");

function computeAndPlot() {

    const eps0 = parseFloat(document.getElementById("eps").value);
    const gammaL = parseFloat(document.getElementById("gammaL").value);
    const gammaR = parseFloat(document.getElementById("gammaR").value);
    const gammaPhi = parseFloat(document.getElementById("gammaPhi").value);

    const E = [];
    const T = [];

    const Emin = -10;
    const Emax = 10;
    const points = 500;

    for (let i = 0; i < points; i++) {
        const energy = Emin + (Emax - Emin) * i / points;
        E.push(energy);
        T.push(transmissionDP(energy, eps0, gammaL, gammaR, gammaPhi));
    }

    const trace = {
        x: E,
        y: T,
        mode: "lines",
        name: "T(E)"
    };

    const layout = {
        title: "Effective Transmission T_LR(E)",
        xaxis: { title: "Energy E" },
        yaxis: { title: "Transmission", range: [0, 1.2] },
        margin: { t: 40 }
    };

    Plotly.react(plotDiv, [trace], layout, { responsive: true });
}

initUI(computeAndPlot);
computeAndPlot();
