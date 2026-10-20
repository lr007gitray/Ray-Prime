document.addEventListener("DOMContentLoaded", () => {
    inicializarPerfil();
    carregarCatalogo(obterImoveis());
    configurarFiltros();
    criarModalDetalhes();
    criarModalCadastro();
});

function inicializarPerfil() {
    document.getElementById("nome-anunciante").textContent = CONFIGURACAO_ANUNCIANTE.nomeComercial;
    document.getElementById("titulo-anunciante").textContent = CONFIGURACAO_ANUNCIANTE.funcaoTitulo;

    const btnWhats = document.getElementById("btn-whatsapp");
    if (CONFIGURACAO_ANUNCIANTE.telefoneWhatsApp) {
        const mensagemCodificada = encodeURIComponent(CONFIGURACAO_ANUNCIANTE.mensagemPadrao);
        btnWhats.href = `https://wa.me/${CONFIGURACAO_ANUNCIANTE.telefoneWhatsApp}?text=${mensagemCodificada}`;
        btnWhats.style.display = "inline-block";
    } else {
        btnWhats.style.display = "none";
    }
}

function converterLinkYouTube(url) {
    if (!url) return "";
    let codigo = "";
    if (url.includes("youtu.be/")) {
        codigo = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
        codigo = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("/embed/")) {
        return url;
    }
    return codigo ? `https://www.youtube.com/embed/${codigo}` : url;
}

function carregarCatalogo(listaImoveis) {
    const grid = document.getElementById("grid-imoveis");
    const contador = document.getElementById("contador-resultados");
    
    grid.innerHTML = "";
    contador.textContent = `${listaImoveis.length} imóvel(is) encontrado(s)`;

    if (listaImoveis.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 20px;'>Nenhum imóvel cadastrado no momento. Clique em '+ Novo Imóvel' acima para começar!</p>";
        return;
    }

    listaImoveis.forEach(imovel => {
        const precoFormatado = Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const card = document.createElement("div");
        card.className = "property-card";
        card.innerHTML = `
            <img src="${imovel.imagem || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}" alt="${imovel.titulo}" class="property-image">
            <div class="property-content">
                <span class="property-tag">${imovel.finalidade} • ${imovel.tipo}</span>
                <h3 class="property-title">${imovel.titulo}</h3>
                <div class="property-price">${precoFormatado}</div>
                <div class="property-details">
                    <span>📍 ${imovel.cidade}</span>
                    <span>📐 ${imovel.area} m²</span>
                    ${imovel.quartos > 0 ? `<span>🛏️ ${imovel.quartos} qts</span>` : ''}
                </div>
                <button class="btn-detalhes" data-id="${imovel.id}">Ver Detalhes / Gerenciar</button>
            </div>
        `;
        
        card.querySelector(".btn-detalhes").addEventListener("click", () => {
            abrirDetalhesImovel(imovel);
        });

        grid.appendChild(card);
    });
}

function configurarFiltros() {
    const inputBusca = document.getElementById("input-busca");
    const filtroFinalidade = document.getElementById("filtro-finalidade");
    const filtroTipo = document.getElementById("filtro-tipo");
    const btnLimpar = document.getElementById("btn-limpar");

    function aplicarFiltros() {
        const termo = inputBusca.value.toLowerCase();
        const finalidade = filtroFinalidade.value;
        const tipo = filtroTipo.value;

        const todos = obterImoveis();
        const filtrados = todos.filter(imovel => {
            const matchTermo = imovel.titulo.toLowerCase().includes(termo) || imovel.cidade.toLowerCase().includes(termo);
            const matchFinalidade = finalidade === "" || imovel.finalidade === finalidade;
            const matchTipo = tipo === "" || imovel.tipo === tipo;

            return matchTermo && matchFinalidade && matchTipo;
        });

        carregarCatalogo(filtrados);
    }

    if(inputBusca) inputBusca.addEventListener("input", aplicarFiltros);
    if(filtroFinalidade) filtroFinalidade.addEventListener("change", aplicarFiltros);
    if(filtroTipo) filtroTipo.addEventListener("change", aplicarFiltros);

    if(btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            inputBusca.value = "";
            filtroFinalidade.value = "";
            filtroTipo.value = "";
            carregarCatalogo(obterImoveis());
        });
    }
}

function criarModalDetalhes() {
    if (document.getElementById("modal-imovel")) return;
    const modalHtml = `
        <div id="modal-imovel" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <button id="modal-fechar" class="modal-close">&times;</button>
                <div id="modal-corpo"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById("modal-fechar").addEventListener("click", fecharModal);
    document.getElementById("modal-imovel").addEventListener("click", (e) => {
        if (e.target.id === "modal-imovel") fecharModal();
    });
}

function abrirDetalhesImovel(imovel) {
    const precoFormatado = Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const modalCorpo = document.getElementById("modal-corpo");

    let galeriaHtml = '';
    if (imovel.fotosGaleria && imovel.fotosGaleria.length > 0) {
        galeriaHtml = '<div class="modal-galeria">';
        imovel.fotosGaleria.forEach(foto => {
            galeriaHtml += `<img src="${foto}" alt="Foto" class="galeria-miniatura">`;
        });
        galeriaHtml += '</div>';
    }

    let videosHtml = '';
    const listaVideos = imovel.videosUrl || (imovel.videoUrl ? [imovel.videoUrl] : []);
    if (listaVideos.length > 0) {
        videosHtml = '<div class="modal-video-container"><h4 style="margin-bottom: 10px;">Vídeos do Imóvel</h4>';
        listaVideos.forEach((urlVid, index) => {
            const urlEmbed = converterLinkYouTube(urlVid);
            if (urlEmbed) {
                videosHtml += `
                    <div style="margin-bottom: 15px;">
                        <p style="font-size: 0.85rem; color: #555; margin-bottom: 5px;">Vídeo ${index + 1}</p>
                        <div class="video-responsive">
                            <iframe src="${urlEmbed}" title="Vídeo ${index + 1}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    </div>
                `;
            }
        });
        videosHtml += '</div>';
    }

    const textoWhats = encodeURIComponent(`Olá, tenho interesse no imóvel "${imovel.titulo}" (${precoFormatado}) anunciado na Ray Prime.`);
    const linkWhatsImovel = `https://wa.me/${CONFIGURACAO_ANUNCIANTE.telefoneWhatsApp}?text=${textoWhats}`;

    modalCorpo.innerHTML = `
        <span class="property-tag">${imovel.finalidade} • ${imovel.tipo}</span>
        <h2>${imovel.titulo}</h2>
        <div class="modal-preco">${precoFormatado}</div>
        
        <div class="property-details" style="margin: 15px 0;">
            <span>📍 ${imovel.cidade}</span>
            <span>📐 Área: ${imovel.area} m²</span>
            ${imovel.quartos > 0 ? `<span>🛏️ Quartos: ${imovel.quartos}</span>` : ''}
            ${imovel.banheiros > 0 ? `<span>🚽 Banheiros: ${imovel.banheiros}</span>` : ''}
        </div>

        <p class="modal-descricao">${imovel.descricao}</p>
        <h4 style="margin-top: 20px;">Fotos</h4>
        ${galeriaHtml}
        ${videosHtml}

        <div class="modal-acoes" style="margin-top: 25px; display: flex; flex-direction: column; gap: 10px;">
            <a href="${linkWhatsImovel}" target="_blank" class="btn-whatsapp" style="text-align: center; display: block;">Tenho Interesse - Falar no WhatsApp</a>
            
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="btn-editar-imovel" class="btn-secondary" style="flex: 1; background-color: #3182ce; color: #fff; border:none;">✏️ Editar Imóvel</button>
                <button id="btn-excluir-imovel" class="btn-secondary" style="flex: 1; background-color: #e53e3e; color: #fff; border:none;">🗑️ Excluir Imóvel</button>
            </div>
        </div>
    `;

    document.getElementById("btn-excluir-imovel").onclick = () => {
        if (confirm(`Tem certeza que deseja excluir o imóvel "${imovel.titulo}"?`)) {
            excluirImovel(imovel.id);
            fecharModal();
            carregarCatalogo(obterImoveis());
            alert("Imóvel excluído com sucesso!");
        }
    };

    document.getElementById("btn-editar-imovel").onclick = () => {
        fecharModal();
        abrirFormularioEdicao(imovel);
    };

    document.getElementById("modal-imovel").style.display = "flex";
}

function fecharModal() {
    document.getElementById("modal-imovel").style.display = "none";
}

function criarModalCadastro() {
    if (document.getElementById("modal-cadastro")) return;
    const modalCadHtml = `
        <div id="modal-cadastro" class="modal-overlay" style="display: none;">
            <div class="modal-content">
                <button id="modal-cad-fechar" class="modal-close">&times;</button>
                <h2 id="modal-titulo-form">Cadastrar Novo Imóvel</h2>
                <form id="form-novo-imovel" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                    <input type="hidden" id="cad-id">
                    <input type="text" id="cad-titulo" placeholder="Título (Ex: Terreno em Chácara)" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    
                    <div style="display: flex; gap: 10px;">
                        <select id="cad-tipo" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                            <option value="Casa">Casa</option>
                            <option value="Apartamento">Apartamento</option>
                            <option value="Terreno">Terreno</option>
                            <option value="Comercial">Comercial</option>
                        </select>
                        <select id="cad-finalidade" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                            <option value="Venda">Venda</option>
                            <option value="Aluguel">Aluguel</option>
                        </select>
                    </div>

                    <input type="number" id="cad-preco" placeholder="Preço em Reais (Ex: 100000)" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <input type="text" id="cad-cidade" placeholder="Cidade / Região (Ex: São Paulo - SP)" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="cad-area" placeholder="Área m² (Ex: 1000)" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                        <input type="number" id="cad-quartos" placeholder="Quartos (Opcional)" style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    </div>

                    <!-- CAMINHO DA FOTO ATUALIZADO PARA PASTAS LOCAIS -->
                    <input type="text" id="cad-imagem" placeholder="Caminho da Foto (Ex: imagens/terreno1.jpg)" required style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    
                    <label style="font-size: 0.9rem; font-weight: bold; color: #0b132b; margin-top: 5px;">Vídeos do YouTube (Até 3 vídeos curtos):</label>
                    <input type="text" id="cad-video-1" placeholder="Link do Vídeo 1 do YouTube" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <input type="text" id="cad-video-2" placeholder="Link do Vídeo 2 do YouTube (Opcional)" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    <input type="text" id="cad-video-3" placeholder="Link do Vídeo 3 do YouTube (Opcional)" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                    
                    <textarea id="cad-descricao" placeholder="Descrição completa do imóvel..." rows="3" style="padding: 10px; border: 1px solid #ccc; border-radius: 5px;"></textarea>
                    
                    <button type="submit" class="btn-detalhes" style="background-color: #25d366; color: #fff; border: none; padding: 12px; margin-top: 10px;">Salvar Imóvel</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalCadHtml);

    document.getElementById("btn-abrir-cadastro").addEventListener("click", () => {
        document.getElementById("modal-titulo-form").textContent = "Cadastrar Novo Imóvel";
        document.getElementById("form-novo-imovel").reset();
        document.getElementById("cad-id").value = "";
        document.getElementById("modal-cadastro").style.display = "flex";
    });

    document.getElementById("modal-cad-fechar").addEventListener("click", () => {
        document.getElementById("modal-cadastro").style.display = "none";
    });

    document.getElementById("form-novo-imovel").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const idExistente = document.getElementById("cad-id").value;
        
        const v1 = document.getElementById("cad-video-1").value.trim();
        const v2 = document.getElementById("cad-video-2").value.trim();
        const v3 = document.getElementById("cad-video-3").value.trim();
        const arrayVideos = [v1, v2, v3].filter(v => v !== "");

        const dadosImovel = {
            titulo: document.getElementById("cad-titulo").value,
            tipo: document.getElementById("cad-tipo").value,
            finalidade: document.getElementById("cad-finalidade").value,
            preco: parseFloat(document.getElementById("cad-preco").value),
            cidade: document.getElementById("cad-cidade").value,
            area: parseFloat(document.getElementById("cad-area").value) || 0,
            quartos: parseInt(document.getElementById("cad-quartos").value) || 0,
            banheiros: 1,
            status: "Disponível",
            descricao: document.getElementById("cad-descricao").value,
            imagem: document.getElementById("cad-imagem").value,
            fotosGaleria: [document.getElementById("cad-imagem").value],
            videosUrl: arrayVideos,
            videoUrl: arrayVideos[0] || ""
        };

        if (idExistente) {
            atualizarImovel(idExistente, dadosImovel);
            alert("Imóvel atualizado com sucesso!");
        } else {
            salvarImovel(dadosImovel);
            alert("Imóvel cadastrado com sucesso!");
        }

        document.getElementById("form-novo-imovel").reset();
        document.getElementById("modal-cadastro").style.display = "none";
        carregarCatalogo(obterImoveis());
    });
}

function abrirFormularioEdicao(imovel) {
    document.getElementById("modal-titulo-form").textContent = "Editar Imóvel";
    document.getElementById("cad-id").value = imovel.id;
    document.getElementById("cad-titulo").value = imovel.titulo;
    document.getElementById("cad-tipo").value = imovel.tipo;
    document.getElementById("cad-finalidade").value = imovel.finalidade;
    document.getElementById("cad-preco").value = imovel.preco;
    document.getElementById("cad-cidade").value = imovel.cidade;
    document.getElementById("cad-area").value = imovel.area;
    document.getElementById("cad-quartos").value = imovel.quartos || 0;
    document.getElementById("cad-imagem").value = imovel.imagem;
    
    const vids = imovel.videosUrl || (imovel.videoUrl ? [imovel.videoUrl] : []);
    document.getElementById("cad-video-1").value = vids[0] || "";
    document.getElementById("cad-video-2").value = vids[1] || "";
    document.getElementById("cad-video-3").value = vids[2] || "";

    document.getElementById("cad-descricao").value = imovel.descricao;

    document.getElementById("modal-cadastro").style.display = "flex";
}
