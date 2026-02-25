const eps0Slider = document.getElementById("eps0");
const gammaSlider = document.getElementById("gamma");
const lambdaSlider = document.getElementById("lambda");
const omegaSlider = document.getElementById("omega");
const nmaxSlider = document.getElementById("nmax");

eps0Slider.oninput = updatePlot;
gammaSlider.oninput = updatePlot;
lambdaSlider.oninput = updatePlot;
omegaSlider.oninput = updatePlot;
nmaxSlider.oninput = updatePlot;

updatePlot();

function factorial(n){
    if(n===0) return 1;
    return n*factorial(n-1);
}

function franckCondon(n,S){
    return Math.exp(-S)*Math.pow(S,n)/factorial(n);
}

function transmission(E, eps0, gamma, lambda, omega, nmax){

    const Lambda = lambda*lambda/omega;
    const S = (lambda/omega)**2;

    let real = 0;
    let imag = 0;

    for(let n=0; n<=nmax; n++){

        const Fn = franckCondon(n,S);

        const denomReal = E - (eps0 - Lambda) - n*omega;
        const denomImag = gamma;

        const denom = denomReal**2 + denomImag**2;

        real += Fn * denomReal/denom;
        imag -= Fn * denomImag/denom;
    }

    return gamma*gamma*(real*real + imag*imag);
}

function updatePlot(){

    const eps0 = parseFloat(eps0Slider.value);
    const gamma = parseFloat(gammaSlider.value);
    const lambda = parseFloat(lambdaSlider.value);
    const omega = parseFloat(omegaSlider.value);
    const nmax = parseInt(nmaxSlider.value);

    let E = [];
    let T = [];

    for(let e=-4; e<=4; e+=0.02){
        E.push(e);
        T.push(transmission(e,eps0,gamma,lambda,omega,nmax));
    }

    Plotly.newPlot("plot",[{
        x:E,
        y:T,
        mode:"lines"
    }]);
}
