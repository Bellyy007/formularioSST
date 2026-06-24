// FUNÇÕES DE TABELA 

function adicionarSetor() {

    const tabela = document.getElementById("tabela-setores");

    const numero = tabela.rows.length + 1;

    const linha = `
        <tr>

            <td>${numero}</td>

            <td contenteditable="true"></td>

            <td contenteditable="true"></td>

            <!-- LUX -->
            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel"></div>

                <label class="btn-arquivo">
                    📎
                    <input type="file" hidden>
                </label>

            </td>

            <!-- RUÍDO -->
            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel"></div>

                <label class="btn-arquivo">
                    📎
                    <input type="file" hidden>
                </label>

            </td>

            <!-- TEMPERATURA -->
            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel"></div>

                <label class="btn-arquivo">
                    📎
                    <input type="file" hidden>
                </label>

            </td>

            <td contenteditable="true"></td>

            <td>
                <button onclick="removerLinha(this)">
                    X
                </button>
            </td>

        </tr>
    `;

    tabela.innerHTML += linha;
}

function removerLinha(botao) {

    botao.parentElement.parentElement.remove();

    atualizarNumeros();
}

function atualizarNumeros() {

    const linhas = document.querySelectorAll("#tabela-setores tr");

    linhas.forEach((linha, index) => {

        linha.cells[0].innerText = index + 1;
    });
}

function adicionarExtintor() {
    const tabela = document.getElementById("tabela-extintores");
    const numero = tabela.rows.length + 1;

    const linha = `
        <tr>
            <td>${numero}</td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td contenteditable="true"></td>
            <td><button onclick="removerLinha(this)">X</button></td>
        </tr>
    `;

    tabela.innerHTML += linha;
}

function removerLinha(botao) {
    const linha = botao.parentElement.parentElement;
    linha.remove();
    atualizarNumeracao();
}

function atualizarNumeracao() {
    const linhas = document.querySelectorAll("#tabela-setores tr");
    linhas.forEach((linha, index) => {
        linha.cells[0].innerText = index + 1;
    });
}

// SALVAR DADOS
function salvarDados() {
    const dados = {
        razao: document.getElementById("razaoSocial").value,
        cnpj: document.getElementById("cnpj").value,
        responsavel: document.getElementById("responsavelVisita").value,
        observacoes: document.getElementById("observacoes").value
    };

    localStorage.setItem("sstForm", JSON.stringify(dados));
    alert("Dados salvos!");
}

// ASSINATURAS
document.addEventListener("DOMContentLoaded", () => {

    const canvases = document.querySelectorAll(".assinaturaCanvas");
    let estados = [];

    canvases.forEach((canvas, index) => {
        const ctx = canvas.getContext("2d");

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        estados[index] = { desenhando: false, ctx };

        // MOUSE
        canvas.addEventListener("mousedown", () => estados[index].desenhando = true);
        canvas.addEventListener("mouseup", () => estados[index].desenhando = false);
        canvas.addEventListener("mousemove", (e) => desenhar(e, index));

        // TOUCH
        canvas.addEventListener("touchstart", () => estados[index].desenhando = true);
        canvas.addEventListener("touchend", () => estados[index].desenhando = false);
        canvas.addEventListener("touchmove", (e) => desenharTouch(e, index));
    });

    function desenhar(e, i) {
        if (!estados[i].desenhando) return;

        const ctx = estados[i].ctx;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    function desenharTouch(e, i) {
        e.preventDefault();

        const rect = canvases[i].getBoundingClientRect();
        const touch = e.touches[0];

        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (!estados[i].desenhando) return;

        const ctx = estados[i].ctx;

        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    window.limparAssinatura = (i) => {
        const ctx = estados[i].ctx;
        ctx.clearRect(0, 0, canvases[i].width, canvases[i].height);
    };

    //  GERAR PDF
    window.gerarPDF = () => {
        const elemento = document.getElementById("areaPDF");

        const opt = {
            margin: 10,
            filename: 'relatorio_sst.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2 }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elemento).save();
    };

});
