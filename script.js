// ======================================
// LEVANTAMENTO AMBIENTAL SST
// Desenvolvido por Izabelly
// ======================================

"use strict";

// ======================================
// ELEMENTOS PRINCIPAIS
// ======================================

const tabelaSetores = document.getElementById("tabela-setores");
const tabelaExtintores = document.getElementById("tabela-extintores");
const areaPDF = document.getElementById("areaPDF");

// ======================================
// TABELAS
// ======================================

function removerLinha(botao) {

    const linha = botao.closest("tr");
    if (!linha) return;
    linha.remove();
    atualizarNumeracao();
    salvarAutomaticamente();

}

function atualizarNumeracao() {

    // Setores
    tabelaSetores.querySelectorAll("tr").forEach((linha, index) => {
        linha.cells[0].textContent = index + 1;
    });

    // Extintores
    tabelaExtintores.querySelectorAll("tr").forEach((linha, index) => {
        linha.cells[0].textContent = index + 1;
    });

}

function criarLinhaExtintor(dados = {}) {

    return `
        <tr>

            <td>${dados.numero || tabelaExtintores.rows.length + 1}</td>

            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel">
                    ${dados.local || ""}
                </div>

                <label class="btn-arquivo">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>

            </td>

            <td contenteditable="true">${dados.tipo || ""}</td>
            <td contenteditable="true">${dados.quantidade || ""}</td>
            <td contenteditable="true">${dados.vencimento || ""}</td>
            <td contenteditable="true">${dados.observacao || ""}</td>

            <td>
                <button onclick="removerLinha(this)">
                    X
                </button>
            </td>

        </tr>
    `;

}

function adicionarExtintor() {

    tabelaExtintores.insertAdjacentHTML(

        "beforeend",

        criarLinhaExtintor()

    );

    atualizarNumeracao();
    ativarUploadImagens();
    salvarAutomaticamente();

}

// ===============================
// SALVAMENTO AUTOMÁTICO
// ===============================

function salvarAutomaticamente() {

    const dados = {};

    document.querySelectorAll("input, textarea").forEach(campo => {

    if (
        campo.type === "button" ||
        campo.type === "submit"
    ) return;

        // Radios
        if (campo.type === "radio") {
            if (campo.checked) {
                dados[campo.name] = campo.value;
            }
            return;
        }

        // Checkboxes
        if (campo.type === "checkbox") {
            dados[campo.id] = campo.checked;
            return;
        }

        // Campos sem ID não são salvos
        if (!campo.id) return;

        // Inputs e textarea
        dados[campo.id] = campo.value;

    });

    localStorage.setItem(
    "sstAutoSave",
    JSON.stringify(dados)
);

const imagens = [];

document
    .querySelectorAll(".campo-arquivo input[type='file']")
    .forEach(input => {

        imagens.push(
            input.dataset.imagem || ""
        );

    });

localStorage.setItem(
    "imagensSST",
    JSON.stringify(imagens)
);

    salvarTabelaSetores();
    salvarTabelaExtintores();

}

function restaurarDados() {

    const dados = JSON.parse(
        localStorage.getItem("sstAutoSave")
    );

    if (!dados) return;

    document.querySelectorAll("input, textarea").forEach(campo => {

        // Ignora uploads
        if (
            campo.type === "file" ||
            campo.type === "button" ||
            campo.type === "submit"
        ) return;

        // Radios
        if (campo.type === "radio") {
            campo.checked = (dados[campo.name] === campo.value);
            return;
        }

        // Checkboxes
        if (campo.type === "checkbox") {
            campo.checked = dados[campo.id] || false;
            return;
        }

        // Campos sem id
        if (!campo.id) return;

        // Inputs e textarea
        campo.value = dados[campo.id] || "";

    });

}

function restaurarImagens() {

    const imagens = JSON.parse(
        localStorage.getItem("imagensSST")
    ) || [];

    const inputs = document.querySelectorAll(
        ".campo-arquivo input[type='file']"
    );

    inputs.forEach((input, indice) => {

        const imagem = imagens[indice];

        if (!imagem) return;
        input.dataset.imagem = imagem;
        const td = input.closest(".campo-arquivo");
        let img = td.querySelector("img");

        if (!img) {
            img = document.createElement("img");
            img.className = "imagem-medicao";
            img.alt = "Imagem da medição";
            td.appendChild(img);
        }

        img.src = imagem;
        img.title = "Clique para trocar a foto";
        img.onclick = () => input.click();

    });

}

// ======================================
// INICIALIZAÇÃO
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    restaurarDados();
    restaurarTabelaSetores();
    restaurarTabelaExtintores();
    ativarUploadImagens();
    ativarFotosGrandes();
    restaurarImagens();

    document.addEventListener("keyup", (e) => {

        if (e.target.isContentEditable) {
            salvarAutomaticamente();
        }

    });

    document.addEventListener("input", salvarAutomaticamente);
    document.addEventListener("change", salvarAutomaticamente);

});

// ======================================
// PDF
// ======================================

function gerarPDF() {

    const opt = {
        margin: 10,
        filename: "relatorio_sst.pdf",
        image: {
            type: "jpeg",
            quality: 1
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        }
    };

    html2pdf()
        .set(opt)
        .from(areaPDF)
        .save();

}

function salvarTabelaSetores() {

    console.log("SALVANDO TABELA");

    const setores = [];

    document.querySelectorAll("#tabela-setores tr").forEach(linha => {

    const colunas = linha.querySelectorAll("td");

    console.log(colunas);
    console.log(colunas[1]);
    console.log(colunas[1].innerHTML);
    console.log(colunas[1].textContent);

    setores.push({

            numero: colunas[0].textContent.trim(),
            setor: colunas[1].textContent.trim(),
            descricao: colunas[2].textContent.trim(),
            lux: colunas[3].querySelector(".editavel").innerText,
            ruido: colunas[4].querySelector(".editavel").innerText,
            temperatura: colunas[5].querySelector(".editavel").innerText,
            observacao: colunas[6].innerText

        });

    });

    localStorage.setItem(
        "tabelaSetores",
        JSON.stringify(setores)
    );

}

function salvarTabelaExtintores() {

    const extintores = [];

    tabelaExtintores.querySelectorAll("tr").forEach(linha => {

        const colunas = linha.querySelectorAll("td");

        extintores.push({

            numero: colunas[0].textContent.trim(),
            local: colunas[1].querySelector(".editavel").innerText,
            tipo: colunas[2].innerText,
            quantidade: colunas[3].innerText,
            vencimento: colunas[4].innerText,
            observacao: colunas[5].innerText

        });

    });

    localStorage.setItem(
        "tabelaExtintores",
        JSON.stringify(extintores)
    );

}



function restaurarTabelaSetores() {

    const setores = JSON.parse(
        localStorage.getItem("tabelaSetores")
    );

    if (!setores || setores.length === 0) return;

    tabelaSetores.innerHTML = "";

    setores.forEach(setor => {

        tabelaSetores.insertAdjacentHTML(
            "beforeend",
            criarLinhaSetor(setor)
        );

    });

    ativarUploadImagens();
    atualizarNumeracao();

}

function restaurarTabelaExtintores() {

    const extintores = JSON.parse(
        localStorage.getItem("tabelaExtintores")
    );

    if (!extintores || extintores.length === 0) return;

    tabelaExtintores.innerHTML = "";
    extintores.forEach(extintor => {

        tabelaExtintores.insertAdjacentHTML(

            "beforeend",
            criarLinhaExtintor(extintor)

        );

    });

    ativarUploadImagens();
    atualizarNumeracao();

}

// ======================================
// UPLOAD DE IMAGENS
// ======================================

function ativarUploadImagens() {

    const inputs = document.querySelectorAll("input[type='file']");

    inputs.forEach(input => {

        // Evita adicionar o evento duas vezes
        if (input.dataset.ativo) return;

        input.dataset.ativo = "true";

        input.addEventListener("change", function () {

            const arquivo = this.files[0];

            if (!arquivo) return;

            const leitor = new FileReader();

            leitor.onload = (evento) => {

                const td = this.closest(".campo-arquivo");

                if (!td) return;

                let img = td.querySelector("img");

                if (!img) {

                    img = document.createElement("img");
                    img.classList.add("imagem-medicao");
                    img.alt = "Imagem da medição";
                    td.appendChild(img);

                }

            const imagemBase64 = evento.target.result;

img.src = imagemBase64;
img.title = "Clique para trocar a foto";

this.dataset.imagem = imagemBase64;

img.onclick = () => {
    input.click();
};

salvarAutomaticamente();
};

        leitor.readAsDataURL(arquivo);

        });

    });

}

function ativarFotosGrandes() {

    console.log("ATIVANDO FOTOS GRANDES");

    const inputs = document.querySelectorAll(
        ".campo-arquivo-grande input[type='file']"
    );

    console.log(inputs);

    inputs.forEach(input => {

        if (input.dataset.ativoGrande) return;
        input.dataset.ativoGrande = "true";

        input.addEventListener("change", function () {
            const arquivo = this.files[0];
            if (!arquivo) return;

            const leitor = new FileReader();

            leitor.onload = (evento) => {

                console.log("Arquivo carregado!");

                const td = this.closest(".campo-arquivo-grande");
                console.log("Arquivo carregado!");

                let img = td.querySelector("img");
                console.log(img);

                if (!img) {
                    img = document.createElement("img");
                    img.className = "foto-local";
                    td.insertBefore(img, td.firstChild);
                }

                img.src = evento.target.result;
                this.dataset.imagem = evento.target.result;
                img.title = "Clique para trocar a foto";
                img.onclick = () => this.click();
                salvarAutomaticamente();

            };

            leitor.readAsDataURL(arquivo);

        });

    });

}

function criarLinhaSetor(dados = {}) {

    return `
        <tr>

            <td>${dados.numero || tabelaSetores.rows.length + 1}</td>

            <td contenteditable="true">${dados.setor || ""}</td>

            <td contenteditable="true">${dados.descricao || ""}</td>

            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel">${dados.lux || ""}</div>

                <label class="btn-arquivo">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>

            </td>

            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel">${dados.ruido || ""}</div>

                <label class="btn-arquivo">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>

            </td>

            <td class="campo-arquivo">

                <div contenteditable="true" class="editavel">${dados.temperatura || ""}</div>

                <label class="btn-arquivo">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>

            </td>

            <td contenteditable="true">${dados.observacao || ""}</td>

            <td>
                <button onclick="removerLinha(this)">
                    X
                </button>
            </td>

        </tr>
    `;

}

function adicionarSetor() {

    tabelaSetores.insertAdjacentHTML(
        "beforeend",
        criarLinhaSetor()
    );

    atualizarNumeracao();
    ativarUploadImagens();
    salvarAutomaticamente();

}

function adicionarBanheiro() {

    const tabela = document.getElementById("tabela-banheiros");
    tabela.insertAdjacentHTML("beforeend", `
        <tr>
            <td class="campo-arquivo-grande">
                <label class="btn-foto-grande">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>
            </td>
            <td contenteditable="true"></td>

            <td>
                <button onclick="removerLinha(this)">
                    X
                </button>
            </td>
        </tr>
    `);
    ativarFotosGrandes();

}

function adicionarBebedouro() {

    const tabela = document.getElementById("tabela-bebedouros");

    tabela.insertAdjacentHTML("beforeend", `
        <tr>
            <td class="campo-arquivo-grande">
                <label class="btn-foto-grande">
                    📎
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        hidden
                    >
                </label>

            </td>
            <td contenteditable="true"></td>
            <td>
                <button onclick="removerLinha(this)">
                    X
                </button>
            </td>
        </tr>
    `);
    ativarFotosGrandes();

}
