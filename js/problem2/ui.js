export function initUI(updateCallback) {

    const sliders = [
        { id: "eps", display: "epsVal" },
        { id: "gammaL", display: "gammaLVal" },
        { id: "gammaR", display: "gammaRVal" },
        { id: "gammaPhi", display: "gammaPhiVal" }
    ];

    sliders.forEach(({ id, display }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(display);

        valueDisplay.textContent = slider.value;

        slider.addEventListener("input", () => {
            valueDisplay.textContent = slider.value;
            updateCallback();
        });
    });
}
