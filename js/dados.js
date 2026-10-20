// Gerenciador de Dados com LocalStorage para a Ray Prime
const CHAVE_STORAGE = "ray_prime_imoveis";

const imoveisIniciais = [
    {
        id: 1,
        titulo: "Casa Residencial Moderna",
        tipo: "Casa",
        finalidade: "Venda",
        preco: 450000,
        cidade: "São Paulo - SP",
        area: 180,
        quartos: 3,
        suites: 1,
        banheiros: 2,
        vagas: 2,
        status: "Disponível",
        descricao: "Bela casa com acabamento de primeira linha e espaço gourmet completo.",
        imagem: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        fotosGaleria: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
        ],
        videosUrl: [] // Lista de vídeos do YouTube
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

