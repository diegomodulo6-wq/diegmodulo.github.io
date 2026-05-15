class F {
    constructor(n, d = 1) {
        if (d === 0) throw new Error("Denominador no puede ser 0");

        let m = this.gcd(Math.abs(n), Math.abs(d));

        this.n = n / m;
        this.d = d / m;

        if (this.d < 0) {
            this.n *= -1;
            this.d *= -1;
        }
    }

    gcd(a, b) {
        return b ? this.gcd(b, a % b) : a;
    }

    add(o) {
        return new F(this.n * o.d + o.n * this.d, this.d * o.d);
    }

    sub(o) {
        return new F(this.n * o.d - o.n * this.d, this.d * o.d);
    }

    mul(o) {
        return new F(this.n * o.n, this.d * o.d);
    }

    div(o) {
        if (o.n === 0) throw new Error("División entre 0");

        return new F(this.n * o.d, this.d * o.n);
    }

    esCero() {
        return this.n === 0;
    }

    esUno() {
        return this.n === this.d;
    }

    esMenosUno() {
        return this.n === -this.d;
    }

    toS() {
        if (this.d === 1) return `${this.n}`;
        if (this.n === 0) return `0`;

        return `${this.n}/${this.d}`;
    }

    static from(s) {
        s = s.trim();

        if (s === '') throw new Error("Campo vacío");

        if (s.includes('/')) {
            let [n, d] = s.split('/');

            return new F(parseInt(n), parseInt(d));
        }

        let num = parseFloat(s);

        if (isNaN(num)) {
            throw new Error(`"${s}" no es un número válido`);
        }

        if (s.includes('.')) {
            let dec = s.split('.')[1].length;
            let den = Math.pow(10, dec);

            return new F(Math.round(num * den), den);
        }

        return new F(num);
    }
}

function getMatriz() {
    let m = [];

    for (let i = 0; i < 3; i++) {
        m[i] = [];

        for (let j = 0; j < 4; j++) {
            m[i][j] = F.from(
                document.getElementById(`m${i}${j}`).value
            );
        }
    }

    return m;
}

function showM(matriz, titulo, operacion) {
    let html = `<div class="step"><h3>${titulo}</h3>`;

    if (operacion) {
        html += `<p><b>Operación:</b> ${operacion}</p>`;
    }

    html += `<div class="matrix">`;

    for (let i = 0; i < 3; i++) {
        html += `<div class="matrix-row">`;

        for (let j = 0; j < 4; j++) {
            html += `
                <div class="matrix-cell">
                    ${matriz[i][j].toS()}
                </div>
            `;
        }

        html += `</div>`;
    }

    html += `</div></div>`;

    return html;
}

function formatOp(fila, pivote, factor) {
    if (factor.esUno()) {
        return `R${fila+1} → R${fila+1} - R${pivote+1}`;
    }

    if (factor.esMenosUno()) {
        return `R${fila+1} → R${fila+1} + R${pivote+1}`;
    }

    return `R${fila+1} → R${fila+1} - (${factor.toS()})*R${pivote+1}`;
}

function limpiar() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            document.getElementById(`m${i}${j}`).value = '';
        }
    }

    document.getElementById('resultado').innerHTML = '';
}

function cargarEjemplo() {
    const v = [
        ['2', '1', '-1', '8'],
        ['-3', '-1', '2', '-11'],
        ['-2', '1', '2', '-3']
    ];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            document.getElementById(`m${i}${j}`).value = v[i][j];
        }
    }

    document.getElementById('resultado').innerHTML = '';
}

function resolver() {
    const div = document.getElementById('resultado');

    div.innerHTML = '';

    try {
        let m = getMatriz();

        let pasos = showM(m, 'Matriz inicial');

        for (let col = 0; col < 3; col++) {

            let pivote = col;

            for (let i = col + 1; i < 3; i++) {

                let valActual =
                    Math.abs(m[i][col].n / m[i][col].d);

                let valPivote =
                    Math.abs(m[pivote][col].n / m[pivote][col].d);

                if (valActual > valPivote) {
                    pivote = i;
                }
            }

            if (pivote !== col) {
                [m[col], m[pivote]] = [m[pivote], m[col]];

                pasos += showM(
                    m,
                    `Pivoteo`,
                    `R${col+1} ↔️ R${pivote+1}`
                );
            }

            if (m[col][col].esCero()) {

                let todaColCero = true;

                for (let i = col; i < 3; i++) {
                    if (!m[i][col].esCero()) {
                        todaColCero = false;
                    }
                }

                if (todaColCero) {

                    for (let i = col; i < 3; i++) {
                        if (!m[i][3].esCero()) {
                            throw new Error(
                                "Sistema inconsistente: No tiene solución"
                            );
                        }
                    }

                    throw new Error(
                        "Sistema con infinitas soluciones"
                    );
                }
            }

            let divisor = m[col][col];

            if (!divisor.esUno()) {

                for (let j = 0; j < 4; j++) {
                    m[col][j] = m[col][j].div(divisor);
                }

                pasos += showM(
                    m,
                    `Normalizar R${col+1}`,
                    `R${col+1} → R${col+1} / (${divisor.toS()})`
                );
            }

            for (let i = 0; i < 3; i++) {

                if (i !== col && !m[i][col].esCero()) {

                    let factor = m[i][col];

                    for (let j = 0; j < 4; j++) {
                        m[i][j] = m[i][j].sub(
                            factor.mul(m[col][j])
                        );
                    }

                    pasos += showM(
                        m,
                        `Eliminar en R${i+1}`,
                        formatOp(i, col, factor)
                    );
                }
            }
        }

        for (let i = 0; i < 3; i++) {

            if (
                m[i][0].esCero() &&
                m[i][1].esCero() &&
                m[i][2].esCero() &&
                !m[i][3].esCero()
            ) {
                throw new Error(
                    `Sistema inconsistente: 0 = ${m[i][3].toS()}`
                );
            }
        }

        pasos += `
            <div class="solution">
                Solución única:
                a = ${m[0][3].toS()},
                b = ${m[1][3].toS()},
                c = ${m[2][3].toS()}
            </div>
        `;

        div.innerHTML = pasos;

    } catch (e) {
        div.innerHTML = `
            <div class="error">
                ${e.message}
            </div>
        `;
    }
}