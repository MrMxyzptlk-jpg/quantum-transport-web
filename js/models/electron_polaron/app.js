// Sliders
const eps0Slider = document.getElementById("eps0");
const lambdaSlider = document.getElementById("lambda");
const gammaLSlider = document.getElementById("gammaL");
const gammaRSlider = document.getElementById("gammaR");
const omegaSlider = document.getElementById("omega");
const nmaxSlider = document.getElementById("nmax");

// Value spans
const eps0Val = document.getElementById("eps0Val");
const lambdaVal = document.getElementById("lambdaVal");
const gammaLVal = document.getElementById("gammaLVal");
const gammaRVal = document.getElementById("gammaRVal");
const omegaVal = document.getElementById("omegaVal");
const nmaxVal = document.getElementById("nmaxVal");

eps0Slider.addEventListener("input", refresh);
lambdaSlider.addEventListener("input", refresh);
gammaLSlider.addEventListener("input", refresh);
gammaRSlider.addEventListener("input", refresh);
omegaSlider.addEventListener("input", refresh);
nmaxSlider.addEventListener("input", refresh);

function refresh(){
    updateValues();
    updatePlot();
}

refresh();

function factorial(n){
    let f = 1;
    for(let i=2; i<=n; i++) f *= i;
    return f;
}

function franckCondon(n,S){
    return Math.exp(-S)*Math.pow(S,n)/factorial(n);
}

function transmission(E, eps0, gammaL, gammaR, lambda, omega, nmax){

    const Gamma = gammaL + gammaR
    const Lambda = lambda*lambda/omega;
    const S = (lambda/omega)**2;

    let real = 0;
    let imag = 0;

    for(let n=0; n<=nmax; n++){

        const Fn = franckCondon(n,S);

        const denomReal = E - (eps0 - Lambda) - n*omega;
        const denomImag = Gamma;

        const denom = denomReal**2 + denomImag**2;

        real += Fn * denomReal/denom;
        imag -= Fn * denomImag/denom;
    }

    const Gabs2 = real*real + imag*imag;
    return 4*gammaL*gammaR * Gabs2;

}

function updateValues(){
    eps0Val.textContent = eps0Slider.value;
    lambdaVal.textContent = lambdaSlider.value;
    gammaLVal.textContent = gammaLSlider.value;
    gammaRVal.textContent = gammaRSlider.value;
    omegaVal.textContent = omegaSlider.value;
    nmaxVal.textContent = nmaxSlider.value;
}

function updatePlot(){

    const eps0 = parseFloat(eps0Slider.value);
    const lambda = parseFloat(lambdaSlider.value);
    const gammaL = parseFloat(gammaLSlider.value);
    const gammaR = parseFloat(gammaRSlider.value);
    const omega = parseFloat(omegaSlider.value);
    const nmax = parseInt(nmaxSlider.value);

    let E = [];
    let T = [];

    for(let e=-4; e<=4; e+=0.02){
        E.push(e);
        T.push(transmission(e,eps0,gammaL,gammaR,lambda,omega,nmax));
    }

    Plotly.react("plot",[{
        x:E,
        y:T,
        mode:"lines"
    }]);
}
