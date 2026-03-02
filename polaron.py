import numpy as np
import matplotlib.pyplot as plt
import math
import csv

# ============================================================
# DEFAULT PARAMETERS
# ============================================================
eps0 = 0
VL = 0.05
VR = 0.05
Vg = 0.0015
omega = 5e-4
initialN = 300
nmax = 25  # This acts as the "half-width" of our window
t_lead = 1.0

E_min = -2.1
E_max =  2.1
dE = 0.001

# ============================================================
# MATHEMATICAL HELPERS
# ============================================================
def factorial(n):
    return math.factorial(n)

def choose(n, k):
    if k < 0 or k > n:
        return 0
    return math.comb(n, k)

def laguerre(n, alpha, x):
    s = 0.0
    for i in range(n + 1):
        term = ((-1)**i) * choose(n + alpha, n - i) * (x**i) / factorial(i)
        s += term
    return s

def displacement_overlap(m, n, g):
    if g == 0:
        return 1.0 if m == n else 0.0
    
    S = g * g
    i, f = min(m, n), max(m, n)
    alpha = f - i

    # 1. Log-Prefactor: -S/2 + 0.5*(ln(i!) - ln(f!)) + alpha*ln(|g|)
    ln_prefactor = -S/2.0 + 0.5 * (math.lgamma(i + 1) - math.lgamma(f + 1)) + alpha * math.log(abs(g))

    # 2. Log-Laguerre using a Scaled Recurrence
    # We maintain L_curr as (Actual_L / Scale_Factor) to prevent overflow
    # But a simpler way for n=300 is to use the log-sum-exp trick or 
    # just compute the recurrence and check for magnitude.
    
    L_prev = 0.0
    L_curr = 1.0
    
    # To handle the sign of the Laguerre polynomial
    # L_n^alpha(S) for small S and large n is usually positive, but can oscillate.
    for j in range(i):
        L_next = ((2.0 * j + 1.0 + alpha - S) * L_curr - (j + alpha) * L_prev) / (j + 1.0)
        L_prev = L_curr
        L_curr = L_next
    
    # 3. Safe Recombination
    # If L_curr is 0, the log would fail
    if L_curr == 0:
        return 0.0
    
    # Final result: sign(L) * exp( ln|L| + ln_prefactor )
    # This prevents the intermediate L_curr from overflowing before the exp() pulls it back down
    res = math.copysign(1.0, L_curr) * math.exp(math.log(abs(L_curr)) + ln_prefactor)

    # 4. Parity and Hermiticity
    parity = -1 if (g < 0 and alpha % 2 != 0) else 1
    hermitian = -1 if (n > m and alpha % 2 != 0) else 1

    return res * parity * hermitian

# ============================================================
# SELF ENERGY
# ============================================================
def get_self_energy(E, V, t_lead=1.0):
    if abs(E) <= 2 * t_lead:
        Delta = (V**2 * E) / (2 * t_lead**2)
        Gamma = (V**2 * math.sqrt(4*t_lead**2 - E**2)) / (2*t_lead**2)
    else:
        Delta = (V**2 / (2*t_lead**2)) * (
            E - math.copysign(math.sqrt(E**2 - 4*t_lead**2), E)
        )
        Gamma = 0.0
    return Delta, Gamma

# ============================================================
# DECIMATION (CHAIN) TRANSMISSION
# ============================================================
def transmission_decimation(E):
    DeltaL, GammaL = get_self_energy(E, VL)
    DeltaR, GammaR = get_self_energy(E, VR)
    if GammaL == 0: return 0.0
    
    # We use complex numbers for clarity; it handles the Real/Imag parts automatically
    Sigma_leads = DeltaL + DeltaR - 1j * (GammaL + GammaR)

    # 1. UPWARD SELF-ENERGY (from upper_bound down to initialN + 1)
    # This represents the effect of all states with more phonons than initialN
    upper = initialN + nmax
    SigmaUp = 0j
    for n in range(upper, initialN, -1):
        coupling2 = (Vg * math.sqrt(n))**2
        denom = (E - eps0 - n * omega) - Sigma_leads - SigmaUp
        SigmaUp = coupling2 / denom

    # 2. DOWNWARD SELF-ENERGY (from 0 up to initialN - 1)
    # This represents the effect of all states with fewer phonons than initialN
    SigmaDown = 0j
    for n in range(0, initialN):
        # The coupling between state n and n+1 is Vg*sqrt(n+1)
        coupling2 = (Vg * math.sqrt(n + 1))**2
        denom = (E - eps0 - n * omega) - Sigma_leads - SigmaDown
        SigmaDown = coupling2 / denom

    # 3. GREEN'S FUNCTION AT initialN (The Injection Site)
    G00 = 1.0 / ((E - eps0 - initialN * omega) - Sigma_leads - SigmaUp - SigmaDown)

    # 4. PROPAGATION TO ALL CHANNELS 'm'
    # We need to sum over all m (absorption and emission)
    lower = 0 # Absorption can go down to the vacuum state
    upper_limit = initialN + nmax
    
    # Pre-calculate SigmaUp for all nodes to allow propagation
    # (Similar to your SigmaR/SigmaI approach but for the whole chain)
    sig_up_array = [0j] * (upper_limit + 1)
    for n in range(upper_limit, 0, -1):
        c2 = (Vg * math.sqrt(n))**2
        sig_up_array[n-1] = c2 / ((E - eps0 - n * omega) - Sigma_leads - sig_up_array[n])

    # Propagation array
    Gm = [0j] * (upper_limit + 1)
    Gm[initialN] = G00

    # Propagate UP (Emission channels)
    for n in range(initialN, upper_limit):
        coupling = Vg * math.sqrt(n + 1)
        denom = (E - eps0 - (n + 1) * omega) - Sigma_leads - sig_up_array[n + 1]
        Gm[n + 1] = Gm[n] * (coupling / denom)

    # Propagate DOWN (Absorption channels)
    # For downward propagation, we need the "Downward Self-Energy" array
    sig_down_array = [0j] * (upper_limit + 1)
    for n in range(0, upper_limit):
        c2 = (Vg * math.sqrt(n + 1))**2
        sig_down_array[n+1] = c2 / ((E - eps0 - n * omega) - Sigma_leads - sig_down_array[n])

    for n in range(initialN, 0, -1):
        coupling = Vg * math.sqrt(n)
        denom = (E - eps0 - (n - 1) * omega) - Sigma_leads - sig_down_array[n - 1]
        Gm[n - 1] = Gm[n] * (coupling / denom)

    # 5. SUM TRANSMISSION
    T_total = 0.0
    for m in range(0, upper_limit + 1):
        E_out = E - (m - initialN) * omega
        _, GammaR_out = get_self_energy(E_out, VR)
        if GammaR_out > 0:
            T_total += 4 * GammaL * GammaR_out * (abs(Gm[m])**2)

    return T_total

# ============================================================
# SPECTRAL SUM (FRANCK-CONDON) TRANSMISSION
# ============================================================
def transmission_fc(E):

    g = Vg / omega
    S = g**2
    eps_tilde = eps0 - S * omega

    # Injection energy self-energies
    DeltaL_in, GammaL_in = get_self_energy(E, VL)
    DeltaR_in, GammaR_in = get_self_energy(E, VR)

    if GammaL_in == 0:
        return 0.0

    # Define phonon window centered at initialN
    lower = max(0, initialN - nmax)
    upper = initialN + nmax

    T_total = 0.0

    # ---- Sum over final phonon channels m ----
    for m in range(lower, upper + 1):

        # Outgoing electron energy
        E_out = E - (m - initialN) * omega
        _, GammaR_out = get_self_energy(E_out, VR)

        if GammaR_out == 0:
            continue

        ampReal = 0.0
        ampImag = 0.0

        # ---- Sum over intermediate vibronic states k ----
        for k in range(lower, upper + 1):

            # Electron energy in intermediate sector
            E_k = E - (k - initialN) * omega

            DeltaL_k, GammaL_k = get_self_energy(E_k, VL)
            DeltaR_k, GammaR_k = get_self_energy(E_k, VR)

            DeltaTot_k = DeltaL_k + DeltaR_k
            GammaTot_k = GammaL_k + GammaR_k

            # Vibronic propagator denominator
            resReal = E - (eps_tilde + k * omega) - DeltaTot_k
            resImag = GammaTot_k

            det = resReal**2 + resImag**2

            Gk_R =  resReal / det
            Gk_I =  resImag / det

            # Franck–Condon overlaps
            overlap_kn = displacement_overlap(k, initialN, g)
            overlap_mk = displacement_overlap(m, k, -g)

            netOverlap = overlap_mk * overlap_kn

            ampReal += netOverlap * Gk_R
            ampImag += netOverlap * Gk_I

        T_total += 4 * GammaL_in * GammaR_out * (ampReal**2 + ampImag**2)

    return T_total

# ============================================================
# MAIN
# ============================================================
E_values = np.arange(E_min, E_max, dE)

with open("decimation.dat", "w") as f_dec, open("franck_condon.dat", "w") as f_fc:
    writer_dec = csv.writer(f_dec, delimiter=" ")
    writer_fc  = csv.writer(f_fc,  delimiter=" ")

    for E in E_values:
        T_dec = transmission_decimation(E)
        T_fc  = transmission_fc(E)
        writer_dec.writerow([E, T_dec])
        writer_fc.writerow([E, T_fc])

data = np.loadtxt("data_3.csv", delimiter=",")
dec = np.loadtxt("decimation.dat")
fc = np.loadtxt("franck_condon.dat")

plt.figure(figsize=(8,5))
plt.scatter(data[:,0], data[:,1], s=10, label="Pastawski 2002", color="black")
plt.plot(dec[:,0] - 0.15, dec[:,1], lw=3, label="Decimation", alpha=0.7)
plt.plot(fc[:,0] - 0.15, fc[:,1], lw=2, color='red', label="Spectral Sum")

#plt.yscale("log")
plt.xlim(-0.1, 0.1)
plt.ylim(1e-3, 1)

plt.xlabel("Energy")
plt.ylabel("Transmission")
plt.title(f"Coherent Polaron Model (n_initial={initialN})")
plt.legend()
plt.tight_layout()
plt.savefig('data3.png', dpi=300)
