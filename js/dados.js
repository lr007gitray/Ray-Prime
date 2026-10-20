// Gerenciador de Dados para a Ray Prime
const CHAVE_STORAGE = "ray_prime_imoveis";

const imoveisIniciais = [
    {
        id: 1,
        titulo: "Terreno Ideal para Chácara - 1.000m²",
        tipo: "Terreno",
        finalidade: "Venda",
        preco: 100000,
        cidade: "São Paulo - SP",
        area: 1000,
        quartos: 0,
        banheiros: 0,
        status: "Disponível",
        descricao: "Terreno espetacular com 1.000m², pronto para construir, com água direto da fonte, energia no local e excelente localização. Perfeito para chácara!",
        imagem: "imagens/terreno1.jpg",
        fotosGaleria: [
            "imagens/terreno1.jpg"
        ],
        videosUrl: [] // Cole aqui o link do YouTube se quiser, ex: ["https://www.youtube.com/watch?v=SEU_CODIGO"]
    }
];

function obterImoveis() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    if (!dadosSalvos) {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(imoveisIniciais));
        return imoveisIniciais;
    }
    return JSON.parse(dadosSalvos);
}

function salvarImovel(novoImovel) {
    const imoveis = obterImoveis();
    novoImovel.id = Date.now();
    imoveis.unshift(novoImovel);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(imoveis));
}

function atualizarImovel(idImovel, dadosAtualizados) {
    let imoveis = obterImoveis();
    imoveis = imoveis.map(imovel => {
        if (imovel.id == idImovel) {
            return { ...imovel, ...dadosAtualizados, id: Number(idImovel) };
        }
        return imovel;
    });
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(imoveis));
}

function excluirImovel(idImovel) {
    let imoveis = obterImoveis();
    imoveis = imoveis.filter(imovel => imovel.id != idImovel);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(imoveis));
}

