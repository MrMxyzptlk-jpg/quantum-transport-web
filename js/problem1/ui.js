export function initUI(cy, updatePlot) {
    const epsAInput = document.getElementById('epsA');
    const epsBInput = document.getElementById('epsB');
    const epsCInput = document.getElementById('epsC');
    const phiInput   = document.getElementById('phi');

    const epsAVal = document.getElementById('epsAVal');
    const epsBVal = document.getElementById('epsBVal');
    const epsCVal = document.getElementById('epsCVal');

    const toggleC = document.getElementById('toggleC');
    const C = cy.getElementById('C');

    function bindOnsite(nodeId, input, label) {
        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            cy.getElementById(nodeId).data('eps', val);
            label.textContent = val;
            updatePlot();
        });

        // initialize label at load
        label.textContent = input.value;
    }

    bindOnsite('A', epsAInput, epsAVal);
    bindOnsite('B', epsBInput, epsBVal);
    bindOnsite('C', epsCInput, epsCVal);

    function applyCState(on) {
        C.data('active', on);

        // visual state
        C.style('opacity', on ? 1 : 0.2);

        cy.edges().forEach(edge => {
            if (edge.source().id() === 'C' || edge.target().id() === 'C') {
                edge.style('opacity', on ? 1 : 0.2);
            }
        });

        // disable sliders when inactive
        epsCInput.disabled = !on;
        phiInput.disabled = !on;
    }

    toggleC.addEventListener('change', e => {
        applyCState(e.target.checked);
        updatePlot();
    });

    applyCState(toggleC.checked);
}

// Generic Parameter Binder
function bindParameter(rangeInput, numberInput, onChange) {

    function updateFromRange() {
        const val = parseFloat(rangeInput.value);
        numberInput.value = val;
        onChange(val);
    }

    function updateFromNumber() {
        let val = parseFloat(numberInput.value);

        val = Math.max(parseFloat(rangeInput.min), val);
        val = Math.min(parseFloat(rangeInput.max), val);

        rangeInput.value = val;
        onChange(val);
    }

    rangeInput.addEventListener('input', updateFromRange);
    numberInput.addEventListener('input', updateFromNumber);

    // initialize
    onChange(parseFloat(rangeInput.value));
}
