document.addEventListener('DOMContentLoaded', () => {
    // ESTADO INICIAL DOS PROJETOS (Conforme protótipo e novos campos)
    const defaultProjects = [
        {
            id: 199,
            nome: "Valorização das Culturas Populares",
            nomeCompleto: "Valorização das Culturas Populares e Patrimônio Imaterial do ES",
            status: "Em Andamento",
            orgao: "SEAG",
            entregas: "Realização de festivais locais, oficinas e editais de fomento",
            dataFim: "2026-12",
            // Aba 2 - Relevância
            relevanciaDesafio: "Ampliar a inserção de pessoas no mercado de trabalho",
            relevanciaProgGoverno: "Sim",
            relevanciaAudiencias: "Não",
            relevanciaG1: "Sim",
            relevanciaPIP: "Não",
            relevanciaODS: "Sim",
            relevanciaDetalheODS: "ODS 8: Trabalho Decente e Crescimento Econômico",
            relevanciaCriticidade: "2. Moderado - Situação grave, pois há risco de piora de indicadores sociais e econômicos em 2023",
            relevanciaReducaoDesigualdade: "2. Moderado - Sim, o escopo projeto está parcialmente direcionado a redução das desigualdades.",
            relevanciaAgendaMulher: "Não",
            // Aba 3 - Viabilidade
            complexidade: "Baixa",
            orcamento: "Baixo",
            riscos: "Atrasos na liberação de recursos municipais co-financiados."
        },
        {
            id: 204,
            nome: "Modernização TVE e Rad ES",
            nomeCompleto: "Modernização da Infraestrutura e Equipamentos da TV Educativa e Rádio Espírito Santo",
            status: "Em Andamento",
            orgao: "SEAG",
            entregas: "Aquisição de retransmissores digitais e câmeras digitais HD",
            dataFim: "2027-04",
            // Aba 2 - Relevância
            relevanciaDesafio: "Atrair novos investimentos e desenvolver os diversos setores produtivos",
            relevanciaProgGoverno: "Sim",
            relevanciaAudiencias: "Sim",
            relevanciaG1: "Não",
            relevanciaPIP: "Não",
            relevanciaODS: "Não",
            relevanciaDetalheODS: "",
            relevanciaCriticidade: "2. Moderado - Situação grave, pois há risco de piora de indicadores sociais e econômicos em 2023",
            relevanciaReducaoDesigualdade: "3. Baixo - Não, o projeto impacta indiretamente a população em vulnerabilidade social.",
            relevanciaAgendaMulher: "Não",
            // Aba 3 - Viabilidade
            complexidade: "Alta",
            orcamento: "Alto",
            riscos: "Obsolecência técnica rápida dos equipamentos licitados."
        },
        {
            id: 209,
            nome: "TVE Revista",
            nomeCompleto: "Produção e Exibição do Programa Informativo TVE Revista",
            status: "Em Andamento",
            orgao: "SEAG",
            entregas: "Exibições diárias do jornal de cultura capixaba",
            dataFim: "2026-11",
            // Aba 2 - Relevância
            relevanciaDesafio: "Ampliar a inserção de pessoas no mercado de trabalho",
            relevanciaProgGoverno: "Não",
            relevanciaAudiencias: "Não",
            relevanciaG1: "Não",
            relevanciaPIP: "Sim",
            relevanciaODS: "Sim",
            relevanciaDetalheODS: "ODS 4: Educação de Qualidade",
            relevanciaCriticidade: "3. Baixo - Situação de baixa urgência, se nada for feito a tendência é que nada mude em relação ao cenário atual.",
            relevanciaReducaoDesigualdade: "3. Baixo - Não, o projeto impacta indiretamente a população em vulnerabilidade social.",
            relevanciaAgendaMulher: "Sim",
            // Aba 3 - Viabilidade
            complexidade: "Média",
            orcamento: "Médio",
            riscos: "Dificuldade na agenda de produções externas em períodos chuvosos."
        }
    ];

    // Carrega do localStorage ou assume defaults
    let projects = JSON.parse(localStorage.getItem('openpmo_inventario_projetos')) || defaultProjects;
    
    // Migração automática: se houver registros antigos sem o campo 'nome', redefinimos para os defaults
    if (Array.isArray(projects)) {
        const hasLegacyData = projects.some(p => !p.nome);
        if (hasLegacyData) {
            projects = defaultProjects;
            localStorage.setItem('openpmo_inventario_projetos', JSON.stringify(projects));
        }
    } else {
        projects = defaultProjects;
        localStorage.setItem('openpmo_inventario_projetos', JSON.stringify(projects));
    }

    let editingProjectId = null;
    let currentSelectedCardId = null;
    let userOverridden = {};

    // ELEMENTOS DOM
    const pageTitleEl = document.querySelector('.page-title');
    const viewInventarioList = document.getElementById('viewInventarioList');
    const viewNovoProjeto = document.getElementById('viewNovoProjeto');
    const projectsListEl = document.getElementById('projectsList');
    const selectFiltroStatus = document.getElementById('selectFiltroStatus');
    const btnQuickAdd = document.getElementById('btnQuickAdd');
    const addProjectTrigger = document.getElementById('addProjectTrigger');
    const addProjectDropArea = document.getElementById('addProjectDropArea');
    const btnTopSearch = document.getElementById('btnTopSearch');
    const searchBarWrapper = document.getElementById('searchBarWrapper');
    const inputSearchProject = document.getElementById('inputSearchProject');

    // FORM ELEMENTS (NOVA TELA DE CADASTRO)
    const formNovoProjetoPage = document.getElementById('formNovoProjetoPage');
    const btnPageCancel = document.getElementById('btnPageCancel');
    
    // ABA 1: PROPRIEDADES
    const nomeInput = document.getElementById('nomeProjeto');
    const nomeCompletoInput = document.getElementById('nomeCompletoProjeto');
    const statusSelect = document.getElementById('statusProjeto');
    const orgaoInput = document.getElementById('orgaoProjeto');
    const deliveriesListEl = document.getElementById('deliveriesList');
    const btnAddNewDelivery = document.getElementById('btnAddNewDelivery');
    let activeDeliveries = [];
    let activeDesafios = [];
    const selectedChallengesContainer = document.getElementById('selectedChallengesContainer');
    const btnAddNewChallenge = document.getElementById('btnAddNewChallenge');
    
    function getAllDesafios() {
        const list = [];
        if (typeof HIERARQUIA_DESAFIOS !== 'undefined') {
            Object.keys(HIERARQUIA_DESAFIOS).forEach(eixo => {
                Object.keys(HIERARQUIA_DESAFIOS[eixo]).forEach(area => {
                    HIERARQUIA_DESAFIOS[eixo][area].forEach(desafio => {
                        if (!list.includes(desafio)) list.push(desafio);
                    });
                });
            });
        }
        if (typeof DESAFIOS_DATA !== 'undefined') {
            Object.keys(DESAFIOS_DATA).forEach(d => {
                if (!list.includes(d)) list.push(d);
            });
        }
        return list;
    }

    if (btnAddNewChallenge) {
        btnAddNewChallenge.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('desafioAddDropdown');
            if (!dropdown) return;
            
            const allDesafios = getAllDesafios();
            const currentSelected = activeDesafios.map(item => (typeof item === 'string' ? item : (item ? item.desafio : ''))).filter(Boolean);

            dropdown.innerHTML = '';
            let hasOptions = false;
            allDesafios.forEach(desafioName => {
                if (!currentSelected.includes(desafioName)) {
                    const item = document.createElement('div');
                    item.className = 'ods-menu-item ods-add-option';
                    item.innerHTML = `<span>${escapeHtml(desafioName)}</span>`;
                    item.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        activeDesafios.push(desafioName);
                        dropdown.classList.add('hidden');
                        renderSelectedChallenges();
                    });
                    dropdown.appendChild(item);
                    hasOptions = true;
                }
            });
            
            if (!hasOptions) {
                dropdown.innerHTML = '<div class="ods-menu-item ods-add-option" style="color:#94a3b8;">Nenhum desafio disponível</div>';
            }

            document.querySelectorAll('.desafio-menu-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });
            dropdown.classList.toggle('hidden');
        });
    }
    
    // ODS Selecionadas (Cards com Dropdown)
    let activeODS = [];
    const selectedODSContainer = document.getElementById('selectedODSContainer');
    const btnAddNewODS = document.getElementById('btnAddNewODS');
    
    if (btnAddNewODS) {
        btnAddNewODS.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('odsAddDropdown');
            if (!dropdown) return;
            
            // Generate list of available ODS
            dropdown.innerHTML = '';
            let hasOptions = false;
            SUGGESTED_ODS.forEach(ods => {
                if (!activeODS.includes(ods.id) && !activeODS.includes(String(ods.id))) {
                    const item = document.createElement('div');
                    item.className = 'ods-menu-item ods-add-option';
                    item.innerHTML = `<span>${ods.id} - ${escapeHtml(ods.name)}</span>`;
                    item.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        activeODS.push(ods.id);
                        dropdown.classList.add('hidden');
                        renderSelectedODS();
                    });
                    dropdown.appendChild(item);
                    hasOptions = true;
                }
            });
            
            if (!hasOptions) {
                dropdown.innerHTML = '<div class="ods-menu-item ods-add-option" style="color:#94a3b8;">Nenhuma ODS disponível</div>';
            }

            document.querySelectorAll('.desafio-menu-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });
            dropdown.classList.toggle('hidden');
        });
    }

    const SUGGESTED_ODS = [
        { id: 1, name: "Erradicação da pobreza" },
        { id: 2, name: "Fome zero e agricultura sustentável" },
        { id: 3, name: "Saúde e bem-estar" },
        { id: 4, name: "Educação de qualidade" },
        { id: 5, name: "Igualdade de gênero" },
        { id: 6, name: "Água potável e saneamento" },
        { id: 7, name: "Energia limpa e acessível" },
        { id: 8, name: "Trabalho decente e crescimento econômico" },
        { id: 9, name: "Indústria, inovação e infraestrutura" },
        { id: 10, name: "Redução das desigualdades" },
        { id: 11, name: "Cidades e comunidades sustentáveis" },
        { id: 12, name: "Consumo e produção responsáveis" },
        { id: 14, name: "Vida na água" },
        { id: 15, name: "Vida terrestre" },
        { id: 16, name: "Paz, justiça e instituições eficazes" },
        { id: 17, name: "Parcerias e meios de implementação" }
    ];

    function renderDeliveries() {
        if (!deliveriesListEl || !btnAddNewDelivery) return;
        
        // Remove existing delivery cards
        const cards = deliveriesListEl.querySelectorAll('.delivery-card');
        cards.forEach(card => card.remove());

        // Render cards
        activeDeliveries.forEach((deliveryName, index) => {
            const card = document.createElement('div');
            card.className = 'delivery-card';
            card.innerHTML = `
                <div class="delivery-card-icon" style="margin-bottom: 4px; margin-top: 2px;">
                    <i class="fa-solid fa-cubes"></i>
                </div>
                <div class="delivery-card-input-container" style="margin-top: 0;">
                    <input type="text" class="delivery-card-input" placeholder="Nome *" value="${escapeHtml(deliveryName)}" required />
                    <span class="help-circle" title="Nome da entrega prevista">?</span>
                </div>
                <button type="button" class="btn-delivery-menu" title="Opções">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div class="delivery-menu-dropdown hidden">
                    <div class="delivery-menu-item" data-action="delete">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Excluir</span>
                    </div>
                </div>
            `;

            const input = card.querySelector('.delivery-card-input');
            input.addEventListener('input', (e) => {
                activeDeliveries[index] = e.target.value;
            });

            const btnMenu = card.querySelector('.btn-delivery-menu');
            const dropdown = card.querySelector('.delivery-menu-dropdown');

            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other delivery dropdowns
                document.querySelectorAll('.delivery-menu-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });

            // Action delete click
            const btnDelete = card.querySelector('[data-action="delete"]');
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                activeDeliveries.splice(index, 1);
                renderDeliveries();
            });

            // Insert before add button
            deliveriesListEl.insertBefore(card, btnAddNewDelivery);
        });
    }

    // Fechar dropdowns de entrega ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.delivery-menu-dropdown').forEach(d => {
            d.classList.add('hidden');
        });
    });

    if (btnAddNewDelivery) {
        btnAddNewDelivery.addEventListener('click', () => {
            activeDeliveries.push('');
            renderDeliveries();
            
            // Focus the newly added input
            const inputs = deliveriesListEl.querySelectorAll('.delivery-card-input');
            if (inputs.length > 0) {
                inputs[inputs.length - 1].focus();
            }
        });
    }

    const dataFimInput = document.getElementById('dataFimProjeto');

    // ABA 3: VIABILIDADE DE IMPLEMENTAÇÃO
    const custoTotalInput = document.getElementById('viabilidadeCustoTotal');
    const fonteRecursosSelect = document.getElementById('viabilidadeFonteRecursos');
    const descricaoFontesInput = document.getElementById('viabilidadeDescricaoFontes');
    const statusCaptacaoSelect = document.getElementById('viabilidadeStatusCaptacao');
    const tipoDespesaSelect = document.getElementById('viabilidadeTipoDespesa');
    const recursoLOASelect = document.getElementById('viabilidadeRecursoLOA');
    const valorLOAInput = document.getElementById('viabilidadeValorLOA');
    const acaoOrcamentoInput = document.getElementById('viabilidadeAcaoOrcamento');
    const planoOrcamentoInput = document.getElementById('viabilidadePlanoOrcamento');
    const toggleProjetoTemCusto = document.getElementById('viabilidadeProjetoTemCusto');

    function updateOrcamentariosState() {
        if (!toggleProjetoTemCusto) return;
        const hasCost = toggleProjetoTemCusto.checked;
        const fields = [
            custoTotalInput,
            fonteRecursosSelect,
            descricaoFontesInput,
            statusCaptacaoSelect,
            tipoDespesaSelect,
            recursoLOASelect,
            valorLOAInput,
            acaoOrcamentoInput,
            planoOrcamentoInput
        ];
        fields.forEach(el => {
            if (el) {
                el.disabled = !hasCost;
            }
        });
        const group = toggleProjetoTemCusto.closest('.accordion-group');
        if (group) {
            if (hasCost) group.classList.remove('accordion-disabled');
            else group.classList.add('accordion-disabled');
        }
    }

    if (toggleProjetoTemCusto) {
        toggleProjetoTemCusto.addEventListener('change', updateOrcamentariosState);
    }

    function formatCurrency(input) {
        if (!input) return;
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value === '') {
                e.target.value = '';
                return;
            }
            let floatValue = parseFloat(value) / 100;
            e.target.value = floatValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        });
    }

    formatCurrency(custoTotalInput);
    formatCurrency(valorLOAInput);

    // INICIALIZAÇÃO DE COMBOBOX MULTISELEÇÃO CUSTOMIZADO
    function initCustomMultiselect(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        const selectBox = container.querySelector('.select-box');
        const dropdown = container.querySelector('.checkboxes-dropdown');
        const selectedText = container.querySelector('.selected-text');
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');

        selectBox.addEventListener('click', (e) => {
            e.stopPropagation();
            // Fechar outros checkboxes dropdowns
            document.querySelectorAll('.checkboxes-dropdown').forEach(d => {
                if (d !== dropdown) d.classList.add('hidden');
            });
            dropdown.classList.toggle('hidden');
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                updateText();
            });
        });

        function updateText() {
            const selected = [];
            checkboxes.forEach(cb => {
                if (cb.checked) selected.push(cb.value);
            });
            if (selected.length === 0) {
                selectedText.textContent = 'Selecionar...';
                selectedText.style.color = '#a0aec0';
            } else {
                selectedText.textContent = selected.join(', ');
                selectedText.style.color = '#4a5568';
            }
        }
        
        return {
            clear: () => {
                checkboxes.forEach(cb => cb.checked = false);
                updateText();
            },
            setSelected: (values) => {
                checkboxes.forEach(cb => {
                    cb.checked = values.includes(cb.value);
                });
                updateText();
            },
            getSelected: () => {
                const selected = [];
                checkboxes.forEach(cb => {
                    if (cb.checked) selected.push(cb.value);
                });
                return selected;
            }
        };
    }

    // Multiselect para outras áreas (Desafios foi removido, usa cards agora)
    const msAtendeProposta = initCustomMultiselect('filterAtendeProposta');

    // Fechar dropdowns de combo ao clicar em qualquer lugar
    document.addEventListener('click', () => {
        document.querySelectorAll('.checkboxes-dropdown').forEach(d => d.classList.add('hidden'));
    });

    // DADOS E DETALHES DE METAS DOS DESAFIOS ESTRATÉGICOS
    const DESAFIOS_DATA = {
        "Fortalecer a Edução Integral": {
            fonte: "SEDU",
            unidadeMedida: "Percentual de escolas",
            baseReferencia: "2022 (15.0%)",
            metas: { "2023": "20.0%", "2024": "25.0%", "2025": "30.0%", "2026": "35.0%" }
        },
        "Atender as necessidades do Estado referente a educação profissional": {
            fonte: "SEDU / SECTI",
            unidadeMedida: "Número de vagas anuais",
            baseReferencia: "2022 (12.000)",
            metas: { "2023": "15.000", "2024": "18.000", "2025": "22.000", "2026": "25.000" }
        },
        "Implemnetar Politicas Públicas": {
            fonte: "SEAG",
            unidadeMedida: "Projetos implementados",
            baseReferencia: "2022 (5)",
            metas: { "2023": "8", "2024": "12", "2025": "15", "2026": "20" }
        },
        "Potencializar o Ecosistema de economia criativa": {
            fonte: "SECULT",
            unidadeMedida: "Espaços criativos ativos",
            baseReferencia: "2022 (8)",
            metas: { "2023": "12", "2024": "16", "2025": "20", "2026": "24" }
        },
        "Ampliar a inserção de pessoas no mercado de trabalho": {
            fonte: "SETRAB",
            unidadeMedida: "Pessoas encaminhadas (mil)",
            baseReferencia: "2022 (45.0)",
            metas: { "2023": "48.0", "2024": "52.0", "2025": "57.0", "2026": "60.0" }
        },
        "Atrair novos investimentos e desenvolver os diversos setores produtivos": {
            fonte: "SEDEC",
            unidadeMedida: "Atração de investimentos (R$ Bilhões)",
            baseReferencia: "2022 (2.5)",
            metas: { "2023": "3.0", "2024": "3.8", "2025": "4.5", "2026": "5.0" }
        },
        "Furto e roubo em estabelecimento comercial por 100 mil habitantes": {
            fonte: "SESP",
            unidadeMedida: "Taxa por 100 mil habitantes",
            baseReferencia: "2022 (145.2)",
            metas: { "2023": "139.79", "2024": "133.92", "2025": "128.29", "2026": "122.9" }
        }
    };

    function getDesafioData(name) {
        if (!name) return null;
        const key = Object.keys(DESAFIOS_DATA).find(k => k.toLowerCase() === name.trim().toLowerCase());
        if (key) return DESAFIOS_DATA[key];
        return {
            fonte: "SESP",
            unidadeMedida: "Taxa por 100 mil habitantes",
            baseReferencia: "2022 (145.2)",
            metas: { "2023": "139.79", "2024": "133.92", "2025": "128.29", "2026": "122.9" }
        };
    }

    // HIERARQUIA DE DESAFIOS PARA CASCATA
    const HIERARQUIA_DESAFIOS = {
        "Eixo 1 + Qualidade de Vida": {
            "Edução, Cultura, Esporte e Lazer": [
                "Fortalecer a Edução Integral",
                "Atender as necessidades do Estado referente a educação profissional",
                "Implemnetar Politicas Públicas",
                "Potencializar o Ecosistema de economia criativa"
            ],
            "Segurança Pública e Justiça": [
                "Furto e roubo em estabelecimento comercial por 100 mil habitantes"
            ]
        }
    };

    // CONTROLE E RENDERIZAÇÃO DO FILTRO DE DESAFIOS EM CARDS (SEM EIXO E ÁREA TEMÁTICA)
    function renderSelectedChallenges() {
        if (!selectedChallengesContainer) return;
        
        // Remove existing challenge cards (keep the Add button)
        const cards = selectedChallengesContainer.querySelectorAll('.desafio-card');
        cards.forEach(card => card.remove());

        activeDesafios.forEach((item, index) => {
            const desafioName = typeof item === 'string' ? item : (item ? item.desafio : '');
            if (!desafioName) return;

            const card = document.createElement('div');
            card.className = 'desafio-card desafio-item-card';
            
            card.innerHTML = `
                <div class="delivery-card-icon" style="margin-bottom: 4px; margin-top: 2px; color: #0d9488; font-size: 20px;">
                    <i class="fa-solid fa-bullseye"></i>
                </div>
                <div class="desafio-title-text" style="font-size: 11px; font-weight: 600; text-align: center; color: #334155; margin-top: auto; padding: 2px 4px;">
                    ${escapeHtml(desafioName)}
                </div>
                <button type="button" class="btn-desafio-menu" title="Opções">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div class="desafio-menu-dropdown hidden">
                    <div class="desafio-menu-item" data-action="delete">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Excluir</span>
                    </div>
                </div>
            `;

            const btnMenu = card.querySelector('.btn-desafio-menu');
            const dropdown = card.querySelector('.desafio-menu-dropdown');

            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.desafio-menu-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });

            const btnDelete = card.querySelector('[data-action="delete"]');
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                activeDesafios.splice(index, 1);
                renderSelectedChallenges();
            });

            if (btnAddNewChallenge) {
                selectedChallengesContainer.insertBefore(card, btnAddNewChallenge);
            } else {
                selectedChallengesContainer.appendChild(card);
            }
        });
    }

    // Fechar dropdowns de desafios ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.desafio-menu-dropdown').forEach(d => {
            d.classList.add('hidden');
        });
    });

    // LÓGICA E RENDERIZAÇÃO DE ODS
    function renderSelectedODS() {
        if (!selectedODSContainer) return;
        
        const cards = selectedODSContainer.querySelectorAll('.ods-card');
        cards.forEach(card => card.remove());

        // Filtrar possíveis resíduos vazios
        activeODS = activeODS.filter(id => id);

        activeODS.forEach((odsId, index) => {
            const odsInfo = SUGGESTED_ODS.find(o => o.id == odsId);
            if (!odsInfo) return;

            const card = document.createElement('div');
            card.className = 'desafio-card ods-card'; 
            
            card.innerHTML = `
                <div class="delivery-card-icon" style="margin-bottom: 4px; margin-top: 2px; color: #1d4ed8; font-size: 20px;">
                    <i class="fa-solid fa-globe"></i>
                </div>
                <div class="ods-title-text" style="font-size: 11px; font-weight: 600; text-align: center; color: #334155; margin-top: auto;">
                    ${odsInfo.id} - ${escapeHtml(odsInfo.name)}
                </div>
                <button type="button" class="btn-ods-menu btn-desafio-menu" title="Opções">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                <div class="ods-menu-dropdown desafio-menu-dropdown hidden">
                    <div class="ods-menu-item desafio-menu-item" data-action="delete">
                        <i class="fa-solid fa-trash-can"></i>
                        <span>Excluir</span>
                    </div>
                </div>
            `;

            const btnMenu = card.querySelector('.btn-ods-menu');
            const dropdown = card.querySelector('.ods-menu-dropdown');

            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.desafio-menu-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });

            const btnDelete = card.querySelector('[data-action="delete"]');
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                activeODS.splice(index, 1);
                renderSelectedODS();
            });

            if (btnAddNewODS) {
                selectedODSContainer.insertBefore(card, btnAddNewODS);
            } else {
                selectedODSContainer.appendChild(card);
            }
        });
    }

    // Fechar dropdowns de ODS ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.ods-menu-dropdown').forEach(d => {
            d.classList.add('hidden');
        });
    });


    // TABS E NAVEGAÇÃO INTERNA DO FORMULÁRIO
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            tabItems.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => content.classList.add('hidden'));
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');
            if (targetId === 'pane-evaluation') {
                updateEvaluationSummariesAndAverages();
            }
        });
    });

    function updateEvaluationSummariesAndAverages() {
        // 1. Alinhamento Estratégico Summary & Auto-Calculation (0 to 5)
        const proposalsSelected = msAtendeProposta ? msAtendeProposta.getSelected() : [];
        let scoreAlinhamento = proposalsSelected.length; // 1 pt per proposal
        if (scoreAlinhamento > 4) scoreAlinhamento = 4;
        if (activeODS.length > 0) {
            scoreAlinhamento += 1; // 1 pt if at least 1 ODS is selected
        }

        const badgeAlinhamento = document.getElementById('evalNotaAlinhamento');
        if (badgeAlinhamento) {
            badgeAlinhamento.textContent = scoreAlinhamento;
        }

        const evalSummaryAlinhamento = document.getElementById('evalSummaryAlinhamento');
        if (evalSummaryAlinhamento) {
            const challengesText = activeDesafios.length > 0 ? activeDesafios.join(', ') : 'Nenhum desafio';
            const odsText = activeODS.length > 0 ? activeODS.map(id => `ODS ${id}`).join(', ') : 'Nenhuma ODS';
            evalSummaryAlinhamento.innerHTML = `<strong>Desafios:</strong> ${escapeHtml(challengesText)} <br> <strong>ODS:</strong> ${escapeHtml(odsText)}`;
        }

        // 2. Criticidade Summary & Auto-Calculation (0 to 2)
        const criticidadeVal = document.getElementById('relevanciaCriticidade').value;
        let scoreCriticidade = 0;
        if (criticidadeVal.includes("Alto")) scoreCriticidade = 2;
        else if (criticidadeVal.includes("Moderado")) scoreCriticidade = 1;
        else if (criticidadeVal.includes("Baixo")) scoreCriticidade = 0;

        const badgeCriticidade = document.getElementById('evalNotaCriticidade');
        if (badgeCriticidade) {
            badgeCriticidade.textContent = scoreCriticidade;
        }

        const evalSummaryCriticidade = document.getElementById('evalSummaryCriticidade');
        if (evalSummaryCriticidade) {
            evalSummaryCriticidade.innerHTML = criticidadeVal ? `<strong>Grau:</strong> ${escapeHtml(criticidadeVal)}` : 'Nenhum grau selecionado.';
        }

        // 3. RDS Summary & Auto-Calculation (0 to 2)
        const rdsVal = document.getElementById('relevanciaReducaoDesigualdade').value;
        const rdsToggle = document.getElementById('relevanciaAgendaMulher').checked;
        let scoreRDS = 0;
        if (rdsToggle) {
            scoreRDS += 1;
            if (rdsVal.includes("Alto")) scoreRDS += 1;
            else if (rdsVal.includes("Moderado")) scoreRDS += 0.5;
            else if (rdsVal.includes("Baixo")) scoreRDS += 0;
        }

        const badgeRDS = document.getElementById('evalNotaRDS');
        if (badgeRDS) {
            badgeRDS.textContent = scoreRDS.toString().replace('.', ',');
        }

        const evalSummaryRDS = document.getElementById('evalSummaryRDS');
        if (evalSummaryRDS) {
            evalSummaryRDS.innerHTML = `<strong>Foco em RDS:</strong> ${escapeHtml(rdsVal || 'Não selecionado')} <br> <strong>Atende programa:</strong> ${rdsToggle ? 'Sim' : 'Não'}`;
        }

        // 4. RDR Summary & Auto-Calculation (0 to 2)
        const rdrVal = document.getElementById('relevanciaReducaoRegional').value;
        const rdrToggle = document.getElementById('relevanciaDRS').checked;
        let scoreRDR = 0;
        if (rdrToggle) {
            scoreRDR += 1;
            if (rdrVal.includes("Alto")) scoreRDR += 1;
            else if (rdrVal.includes("Moderado")) scoreRDR += 0.5;
            else if (rdrVal.includes("Baixo")) scoreRDR += 0;
        }

        const badgeRDR = document.getElementById('evalNotaRDR');
        if (badgeRDR) {
            badgeRDR.textContent = scoreRDR.toString().replace('.', ',');
        }

        const evalSummaryRDR = document.getElementById('evalSummaryRDR');
        if (evalSummaryRDR) {
            evalSummaryRDR.innerHTML = `<strong>Foco em RDR:</strong> ${escapeHtml(rdrVal || 'Não selecionado')} <br> <strong>Atende demandas Priorizadas:</strong> ${rdrToggle ? 'Sim' : 'Não'}`;
        }

        // 5. Inovação Summary & Auto-Calculation (0 or 2)
        const inovacaoVal = document.getElementById('relevanciaInovacao').value;
        const inovacaoToggle = document.getElementById('relevanciaFomentaInovacao') ? document.getElementById('relevanciaFomentaInovacao').checked : false;
        let scoreInovacao = 0;
        if (inovacaoToggle) {
            scoreInovacao = 2;
        } else {
            scoreInovacao = 0;
        }

        const badgeInovacao = document.getElementById('evalNotaInovacao');
        if (badgeInovacao) {
            badgeInovacao.textContent = scoreInovacao;
        }

        const evalSummaryInovacao = document.getElementById('evalSummaryInovacao');
        if (evalSummaryInovacao) {
            evalSummaryInovacao.innerHTML = inovacaoToggle 
                ? `<strong>Status:</strong> Ativado <br> <strong>Grau:</strong> ${escapeHtml(inovacaoVal || 'Não selecionado')}`
                : `<strong>Status:</strong> Desativado`;
        }

        // 6. Critérios Orçamentários Summary & Auto-Calculation
        const temCusto = toggleProjetoTemCusto ? toggleProjetoTemCusto.checked : true;
        
        if (!temCusto) {
            document.getElementById('evalNotaOrcamento').textContent = 3;
        } else {
            let score = 0;
            
            // 1. Status Captação (Max 1)
            const statusCap = statusCaptacaoSelect.value;
            if (statusCap === "Sim") {
                score += 1;
            }

            // 2. Tipo de Despesa (Max 1)
            const tipoDespesa = tipoDespesaSelect.value;
            if (tipoDespesa === "Somente despesa de capital" || 
                tipoDespesa === "Mais de 50% é despesa de capital") {
                score += 1;
            }

            // 3. Recurso LOA (Max 1)
            const loaVal = recursoLOASelect.value;
            if (loaVal.includes("Sim, há recursos com previsão na LOA")) {
                score += 1;
            } else if (loaVal.includes("Não, porém não há execução financeira")) {
                score += 0.5;
            }
            
            const totalOrcamento = Math.min(score, 3);
            document.getElementById('evalNotaOrcamento').textContent = totalOrcamento.toString().replace('.', ',');
        }
        const evalSummaryOrcamento = document.getElementById('evalSummaryOrcamento');
        if (evalSummaryOrcamento) {
            if (!temCusto) {
                evalSummaryOrcamento.innerHTML = `<strong>Projeto sem Custo</strong>`;
            } else {
                const custoVal = custoTotalInput.value || 'Não informado';
                const fonteVal = fonteRecursosSelect.value || 'Não informada';
                evalSummaryOrcamento.innerHTML = `<strong>Custo:</strong> ${escapeHtml(custoVal)} <br> <strong>Fonte:</strong> ${escapeHtml(fonteVal)}`;
            }
        }

        // 7. Capacidade de Execução Summary & Auto-Calculation
        const rhVal = document.getElementById('viabilidadeRH').value;
        const techVal = document.getElementById('viabilidadeTech').value;
        let scoreExecucao = 0;
        if (rhVal.includes("Sim, a equipe necessária está integralmente disponível")) scoreExecucao += 1;
        else if (rhVal.includes("Parcialmente, mais da metade da equipe está disponível")) scoreExecucao += 0.5;
        else if (rhVal.includes("Não, menos da metade da equipe necessária está disponível")) scoreExecucao += 0;
        
        if (techVal && techVal !== "Não") scoreExecucao += 1;
        
        const badgeExecucao = document.getElementById('evalNotaExecucao');
        if (badgeExecucao) {
            badgeExecucao.textContent = scoreExecucao.toString().replace('.', ',');
        }

        const evalSummaryExecucao = document.getElementById('evalSummaryExecucao');
        if (evalSummaryExecucao) {
            evalSummaryExecucao.innerHTML = `<strong>Recursos Humanos:</strong> ${escapeHtml(rhVal || 'Não selecionado')} <br> <strong>Recursos Tecnológicos:</strong> ${escapeHtml(techVal || 'Não selecionado')}`;
        }

        // CALCULA MÉDIAS E NOTA FINAL
        const notaAlinhamento = scoreAlinhamento;
        const notaCriticidade = parseFloat(document.getElementById('evalNotaCriticidade').textContent) || 0;
        const notaRDS = scoreRDS;
        const notaRDR = scoreRDR;
        const notaInovacao = scoreInovacao;
        const notaOrcamento = parseFloat(document.getElementById('evalNotaOrcamento').textContent) || 0;
        const notaExecucao = scoreExecucao;

        const totalRelevancia = notaAlinhamento + notaCriticidade + notaRDS + notaRDR + notaInovacao;
        const totalViabilidade = notaOrcamento + notaExecucao;
        const notaFinal = ((totalRelevancia / 13) * 5.5) + ((totalViabilidade / 5) * 4.5);

        const evalProjectNameSpan = document.getElementById('evalProjectTitleName');
        if (evalProjectNameSpan && nomeInput) {
            evalProjectNameSpan.textContent = nomeInput.value.trim() || 'Nome do Projeto';
        }

        document.getElementById('evalTotalRelevancia').textContent = totalRelevancia.toFixed(1).replace('.', ',');
        document.getElementById('evalMediaImplementacao').textContent = totalViabilidade.toFixed(1).replace('.', ',');
        document.getElementById('evalNotaFinal').textContent = notaFinal.toFixed(2).replace('.', ',');
    }

    document.querySelectorAll('.eval-tree-header').forEach(header => {
        header.addEventListener('click', (e) => {
            header.classList.toggle('collapsed');
            const content = header.nextElementSibling;
            if (content && content.classList.contains('eval-tree-content')) {
                content.classList.toggle('hidden');
            }
        });
    });

    // ESTRUTURA DE DADOS DOS PLANOS PARA ONDE NO PLANO
    const TREES_BY_PLAN = {
        "Cesan": {
            name: "Cesan",
            icon: "fa-solid fa-briefcase",
            children: [
                {
                    name: "Empreendimentos gerenciáveis PMO",
                    icon: "fa-solid fa-diagram-project",
                    children: [
                        { name: "Afonso Cláudio", icon: "fa-solid fa-gears" },
                        { name: "Água Doce do Norte", icon: "fa-solid fa-gears" },
                        { name: "Águia Branca", icon: "fa-solid fa-gears" },
                        { name: "Anchieta", icon: "fa-solid fa-gears" },
                        { name: "Cariacica", icon: "fa-solid fa-gears" },
                        { name: "Guarapari", icon: "fa-solid fa-gears" },
                        { name: "**Teste** Guarapari", icon: "fa-solid fa-gears" }
                    ]
                },
                { name: "Inovação", icon: "fa-solid fa-diagram-project" }
            ]
        },
        "Realiza +": {
            name: "Realiza+",
            icon: "fa-solid fa-briefcase",
            children: [
                {
                    name: "Eixo 1: +Qualidade de vida",
                    icon: "fa-solid fa-diagram-project",
                    children: [
                        {
                            name: "Educação, Cultura, Esporte e Lazer",
                            icon: "fa-solid fa-folder",
                            children: [
                                {
                                    name: "Cultura ES",
                                    icon: "fa-solid fa-gear",
                                    children: [
                                        { name: "Cais das Artes", icon: "fa-solid fa-gear" },
                                        { name: "Centro Cultural Carmélia", icon: "fa-solid fa-gear" },
                                        { name: "TVE Revista", icon: "fa-solid fa-gear" }
                                    ]
                                },
                                { name: "EsportES", icon: "fa-solid fa-gear" },
                                { name: "Melhoria da Qualidade da Educação", icon: "fa-solid fa-gear" }
                            ]
                        },
                        { name: "Segurança Pública e Justiça", icon: "fa-solid fa-folder" },
                        { name: "Prot.Social, Saúde e Dir.Humanos", icon: "fa-solid fa-folder" }
                    ]
                },
                { name: "Eixo 2: +Des. com sustentabilidade", icon: "fa-solid fa-diagram-project" },
                { name: "Eixo 3: +Resultados", icon: "fa-solid fa-diagram-project" }
            ]
        },
        "Direção Geral": {
            name: "Direção Geral",
            icon: "fa-solid fa-briefcase",
            children: [
                {
                    name: "Planejamento Estratégico Direção Geral",
                    icon: "fa-solid fa-diagram-project",
                    children: [
                        { name: "Projetos de Gestão Direção Geral", icon: "fa-solid fa-gear" }
                    ]
                }
            ]
        },
        "PCIES": {
            name: "PCIES",
            icon: "fa-solid fa-briefcase",
            children: [
                {
                    name: "Programa Conectividade e Inovação ES",
                    icon: "fa-solid fa-diagram-project",
                    children: [
                        { name: "Expansão de Infraestrutura PCIES", icon: "fa-solid fa-gear" }
                    ]
                }
            ]
        }
    };

    function selectRowAndAncestors(clickedRow, container) {
        if (!container || !clickedRow) return;

        // 1. Desmarca todas as linhas da árvore
        container.querySelectorAll('.plano-tree-row').forEach(r => {
            r.classList.remove('selected');
            const checkIcon = r.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.className = 'fa-regular fa-square check-icon';
                checkIcon.style.color = '#cbd5e1';
            }
        });

        // 2. Destaca o item clicado (moldura/fundo cinza)
        clickedRow.classList.add('selected');

        function setChecked(row) {
            const checkIcon = row.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.className = 'fa-solid fa-square-check check-icon';
                checkIcon.style.color = '#0d9488';
            }
        }

        // 3. Marca o check verde no item clicado e em TODOS os seus ancestrais até a raiz
        setChecked(clickedRow);

        let curr = clickedRow;
        while (curr && curr !== container) {
            const wrapper = curr.closest('.plano-tree-row-wrapper');
            if (!wrapper) break;
            const parentChildrenDiv = wrapper.parentElement;
            if (parentChildrenDiv && parentChildrenDiv.classList.contains('plano-tree-children')) {
                parentChildrenDiv.classList.remove('hidden');
                const parentWrapper = parentChildrenDiv.parentElement;
                if (parentWrapper) {
                    const parentRow = parentWrapper.querySelector(':scope > .plano-tree-row');
                    if (parentRow) {
                        parentRow.classList.add('expanded');
                        setChecked(parentRow);
                        curr = parentRow;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function renderOndeNoPlanoTree(planName, selectedValue = '') {
        const container = document.getElementById('ondeNoPlanoTree');
        if (!container) return;
        container.innerHTML = '';

        const data = TREES_BY_PLAN[planName] || TREES_BY_PLAN["Realiza +"];
        if (!data) {
            container.innerHTML = '<div style="padding: 12px; color: #94a3b8; font-size: 13px; text-align: center;">Nenhum plano selecionado</div>';
            return;
        }

        let targetRowToSelect = null;

        function createNodeEl(node, level = 0) {
            const hasChildren = node.children && node.children.length > 0;
            const wrapper = document.createElement('div');
            wrapper.className = 'plano-tree-row-wrapper';

            const indentPx = level * 18 + 8;
            const isSelected = selectedValue && selectedValue.trim().toLowerCase() === node.name.trim().toLowerCase();

            const isExpanded = !!node.expanded;

            const row = document.createElement('div');
            row.className = `plano-tree-row ${isExpanded ? 'expanded' : ''}`;
            row.setAttribute('data-name', node.name);
            row.style.paddingLeft = `${indentPx}px`;

            const toggleIconHtml = hasChildren 
                ? `<i class="fa-solid fa-chevron-right toggle-icon"></i>` 
                : `<i class="fa-solid fa-chevron-right toggle-icon" style="opacity: 0.2;"></i>`;
            
            const checkIconHtml = `<i class="fa-regular fa-square check-icon" style="color: #cbd5e1;"></i>`;
            const nodeIconHtml = `<i class="${node.icon || 'fa-solid fa-folder'} node-icon"></i>`;

            row.innerHTML = `
                ${toggleIconHtml}
                ${checkIconHtml}
                ${nodeIconHtml}
                <span class="node-title">${escapeHtml(node.name)}</span>
            `;

            wrapper.appendChild(row);

            if (isSelected) {
                targetRowToSelect = row;
            } else if (!targetRowToSelect && level === 0) {
                targetRowToSelect = row;
            }

            let childrenContainer = null;
            if (hasChildren) {
                childrenContainer = document.createElement('div');
                childrenContainer.className = `plano-tree-children ${isExpanded ? '' : 'hidden'}`;
                node.children.forEach(child => {
                    childrenContainer.appendChild(createNodeEl(child, level + 1));
                });
                wrapper.appendChild(childrenContainer);
            }

            // Click handler
            row.addEventListener('click', (e) => {
                if (hasChildren && childrenContainer) {
                    childrenContainer.classList.toggle('hidden');
                    row.classList.toggle('expanded');
                }
                
                // Select clicked row and check all ancestor rows up to root
                selectRowAndAncestors(row, container);
            });

            return wrapper;
        }

        const rootEl = createNodeEl(data, 0);
        container.appendChild(rootEl);

        // Aplicar seleção inicial e expandir ancestrais apenas se selectedValue for informado
        if (selectedValue && targetRowToSelect) {
            selectRowAndAncestors(targetRowToSelect, container);
        }
    }

    // LÓGICA DE PRÉ-PROJETO E ÁRVORE ONDE NO PLANO
    const evalSelecionarPreProjeto = document.getElementById('evalSelecionarPreProjeto');
    const preProjetoBody = document.getElementById('preProjetoBody');
    const evalPlanosDisponiveis = document.getElementById('evalPlanosDisponiveis');
    const evalObservacoesPreProjeto = document.getElementById('evalObservacoesPreProjeto');

    const PLANOS_POR_ESCRITORIO = {
        'PMO-ES': ['PE 2023-2026'],
        'Cesan': ['Plano Cesan 2026-2030'],
        'IJSN': ['IJSN 23-26'],
        'DIO/ES': ['Plano DIO/ES 2023-2026']
    };

    function updatePlanoOptions(escritorioVal, planoSelectEl, selectedPlanVal = null) {
        if (!planoSelectEl) return;
        planoSelectEl.innerHTML = '';

        const planos = PLANOS_POR_ESCRITORIO[escritorioVal] || [];

        if (planos.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Selecionar Plano...';
            planoSelectEl.appendChild(opt);
            return;
        }

        planos.forEach((p) => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            if (selectedPlanVal && selectedPlanVal === p) {
                opt.selected = true;
            } else if (!selectedPlanVal && p === planos[0]) {
                opt.selected = true;
            }
            planoSelectEl.appendChild(opt);
        });

        planoSelectEl.dispatchEvent(new Event('change'));
    }

    if (evalSelecionarPreProjeto) {
        evalSelecionarPreProjeto.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            if (preProjetoBody) {
                if (isChecked) {
                    preProjetoBody.classList.remove('disabled-section');
                } else {
                    preProjetoBody.classList.add('disabled-section');
                }
            }
            if (evalPlanosDisponiveis) evalPlanosDisponiveis.disabled = !isChecked;
            if (evalObservacoesPreProjeto) evalObservacoesPreProjeto.disabled = !isChecked;
        });
    }

    if (evalPlanosDisponiveis) {
        evalPlanosDisponiveis.addEventListener('change', (e) => {
            renderOndeNoPlanoTree(e.target.value);
        });
    }

    function resetTabs() {
        const isStrat = currentOriginTab === 'estrategico';
        const barInv = document.getElementById('tabsBarInventario');
        const barStrat = document.getElementById('tabsBarEstrategico');

        if (isStrat) {
            if (barInv) barInv.classList.add('hidden');
            if (barStrat) {
                barStrat.classList.remove('hidden');
                barStrat.querySelectorAll('.tab-item').forEach((item, index) => {
                    if (index === 0) item.classList.add('active');
                    else item.classList.remove('active');
                });
            }
        } else {
            if (barStrat) barStrat.classList.add('hidden');
            if (barInv) {
                barInv.classList.remove('hidden');
                barInv.querySelectorAll('.tab-item').forEach((item, index) => {
                    if (index === 0) item.classList.add('active');
                    else item.classList.remove('active');
                });
            }
        }

        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === 'pane-properties') {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    // EVENT DELEGATION PARA TODAS AS ABAS DO FORMULÁRIO (INVENTÁRIO E ESTRATÉGICO)
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.tab-item');
        if (!item) return;

        const parentBar = item.closest('.form-tabs-bar');
        if (parentBar) {
            parentBar.querySelectorAll('.tab-item').forEach(btn => btn.classList.remove('active'));
        }
        item.classList.add('active');

        const targetId = item.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === targetId) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    });

    // GERENCIAMENTO DA ABA ETAPAS
    let currentEtapas = [];

    function renderEtapas() {
        const container = document.getElementById('etapasListContainer');
        if (!container) return;

        container.innerHTML = '';

        if (currentEtapas.length === 0) return;

        currentEtapas.forEach((etapa, idx) => {
            const card = document.createElement('div');
            card.className = 'etapa-item-card';
            card.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: 600; font-size: 13px; color: #1e293b;">${escapeHtml(etapa.nome)}</span>
                    <span style="background: #ccfbf1; color: #0d9488; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${escapeHtml(etapa.status || 'Execução')}</span>
                </div>
                <button type="button" class="btn-remove-etapa" data-idx="${idx}" style="background: transparent; border: none; color: #ef4444; cursor: pointer;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;

            card.querySelector('.btn-remove-etapa').addEventListener('click', () => {
                currentEtapas.splice(idx, 1);
                renderEtapas();
            });

            container.appendChild(card);
        });
    }

    const btnAddEtapaTop = document.getElementById('btnAddEtapaTop');
    const btnAddNewEtapaCard = document.getElementById('btnAddNewEtapaCard');

    function promptAddEtapa() {
        const nome = prompt('Digite o nome da nova Etapa:');
        if (nome && nome.trim()) {
            currentEtapas.push({
                nome: nome.trim(),
                status: 'Execução'
            });
            renderEtapas();
        }
    }

    if (btnAddEtapaTop) btnAddEtapaTop.addEventListener('click', promptAddEtapa);
    if (btnAddNewEtapaCard) btnAddNewEtapaCard.addEventListener('click', promptAddEtapa);

    // LÓGICA DE AGRUPAMENTOS COLAPSÁVEIS (ACCORDIONS)
    function updateRelevanciaAccordionStates() {
        const groups = document.querySelectorAll('.accordion-group');
        groups.forEach(group => {
            const toggle = group.querySelector('.accordion-header input[type="checkbox"]');
            if (toggle) {
                const isChecked = toggle.checked;
                const fields = group.querySelectorAll('.accordion-body select, .accordion-body input, .accordion-body textarea, .accordion-body button');
                fields.forEach(field => {
                    field.disabled = !isChecked;
                });
                if (isChecked) {
                    group.classList.remove('accordion-disabled');
                } else {
                    group.classList.add('accordion-disabled');
                }
            }
        });
    }

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            if (e.target.closest('.switch') || e.target.closest('input') || e.target.closest('.accordion-header-toggle-wrap')) return;
            const group = header.parentElement;
            group.classList.toggle('expanded');
            
            const icon = header.querySelector('.accordion-icon');
            if (group.classList.contains('expanded')) {
                icon.className = 'fa-solid fa-angle-up accordion-icon';
            } else {
                icon.className = 'fa-solid fa-angle-down accordion-icon';
            }
        });
    });

    const accordionToggles = document.querySelectorAll('.accordion-header input[type="checkbox"]');
    accordionToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            updateRelevanciaAccordionStates();
            updateEvaluationSummariesAndAverages();
        });
    });

    function resetAccordions() {
        const groups = document.querySelectorAll('.accordion-group');
        groups.forEach((group) => {
            const icon = group.querySelector('.accordion-icon');
            group.classList.remove('expanded');
            if (icon) icon.className = 'fa-solid fa-angle-down accordion-icon';
        });
    }

    // HELPER FUNCTIONS PARA RADIO BUTTONS (Sim/Não)
    function setRadioVal(name, value) {
        const radios = document.getElementsByName(name);
        radios.forEach(r => {
            r.checked = (r.value === value);
        });
    }

    function getRadioVal(name) {
        const radios = document.getElementsByName(name);
        for (let r of radios) {
            if (r.checked) return r.value;
        }
        return 'Não';
    }

    // CONTEXT MENU ELEMENTS
    const contextMenu = document.getElementById('contextMenu');
    const ctxMenuEditar = document.getElementById('ctxMenuEditar');
    const ctxMenuToggleStatus = document.getElementById('ctxMenuToggleStatus');
    const ctxMenuExcluir = document.getElementById('ctxMenuExcluir');

    let currentOriginTab = 'inventario';

    function renderBreadcrumb(viewName) {
        const nav = document.getElementById('breadcrumbNav');
        if (!nav) return;

        const isStrat = currentOriginTab === 'estrategico';

        if (viewName === 'listagem') {
            nav.innerHTML = `
                <i class="fa-solid fa-house-chimney breadcrumb-home" id="btnHomeBreadcrumb" title="Início"></i>
                <i class="fa-solid fa-chevron-right breadcrumb-sep"></i>
                <span class="breadcrumb-pill teal">Anteprojetos</span>
            `;
        } else if (viewName === 'cadastro') {
            const currentTitle = isStrat ? 'Estruturação' : 'Elaboração';

            nav.innerHTML = `
                <i class="fa-solid fa-house-chimney breadcrumb-home" id="btnHomeBreadcrumb" title="Início"></i>
                <i class="fa-solid fa-chevron-right breadcrumb-sep"></i>
                <button type="button" class="breadcrumb-pill gray" id="btnBreadcrumbInventario">Anteprojetos</button>
                <i class="fa-solid fa-chevron-right breadcrumb-sep"></i>
                <span class="breadcrumb-pill teal">${escapeHtml(currentTitle)}</span>
            `;

            const btnInv = document.getElementById('btnBreadcrumbInventario');
            if (btnInv) {
                btnInv.addEventListener('click', () => {
                    showView('listagem');
                    switchMainTab(currentOriginTab);
                });
            }
        }

        const btnHome = document.getElementById('btnHomeBreadcrumb');
        if (btnHome) {
            btnHome.addEventListener('click', () => {
                showView('listagem');
                switchMainTab(currentOriginTab);
            });
        }
    }

    // NAVEGAÇÃO ENTRE TELAS / VISÕES
    function showView(viewName) {
        renderBreadcrumb(viewName);
        if (viewName === 'listagem') {
            viewNovoProjeto.classList.add('hidden');
            viewInventarioList.classList.remove('hidden');
            editingProjectId = null;
            renderProjects();
            if (typeof switchMainTab === 'function' && paneMainInventario && paneMainInventario.classList.contains('hidden') && paneMainEstrategico && !paneMainEstrategico.classList.contains('hidden')) {
                renderStrategicProjectsView();
            }
        } else if (viewName === 'cadastro') {
            viewInventarioList.classList.add('hidden');
            viewNovoProjeto.classList.remove('hidden');
            resetTabs();
            resetAccordions();
        }
    }

    // SALVAR NO LOCALSTORAGE
    function saveState() {
        localStorage.setItem('openpmo_inventario_projetos', JSON.stringify(projects));
    }

    // RENDERIZAR LISTAGEM DE PROJETOS
    function renderProjects() {
        projectsListEl.innerHTML = '';

        const statusFilter = selectFiltroStatus.value;
        const searchQuery = inputSearchProject.value.toLowerCase().trim();

        // Filtragem
        const filtered = projects.filter(p => {
            const isCancelled = p.status === 'Cancelado';

            if (statusFilter === 'ativos' && isCancelled) return false;
            if (statusFilter === 'cancelados' && !isCancelled) return false;

            if (searchQuery) {
                const matchNome = (p.nome || '').toLowerCase().includes(searchQuery);
                const matchNomeCompleto = (p.nomeCompleto || '').toLowerCase().includes(searchQuery);
                const matchOrgao = (p.orgao || '').toLowerCase().includes(searchQuery);
                const matchStatus = (p.status || '').toLowerCase().includes(searchQuery);
                const matchId = String(p.id).includes(searchQuery);

                if (!matchNome && !matchNomeCompleto && !matchOrgao && !matchStatus && !matchId) {
                    return false;
                }
            }

            return true;
        });

        document.getElementById('currentPageSelect').innerHTML = `<option value="1">1 of 1</option>`;

        if (filtered.length === 0) {
            projectsListEl.innerHTML = `
                <div style="text-align: center; padding: 32px; color: #888; background: #fff; border: 1px dashed #d8e0e8; border-radius: 4px;">
                    <i class="fa-solid fa-folder-open" style="font-size: 28px; margin-bottom: 10px; color: #ccc;"></i>
                    <p>Nenhum projeto cadastrado no inventário.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(p => {
            const isCancelled = p.status === 'Cancelado';
            const card = document.createElement('div');
            card.className = `project-card ${isCancelled ? 'cancelled' : ''}`;
            card.dataset.id = p.id;

            card.innerHTML = `
                <div class="project-card-left">
                    <i class="fa-solid fa-gear project-icon"></i>
                    <div class="project-title-box">
                        <span class="project-title">${escapeHtml(p.nome || p.projeto || p.orgao || 'Projeto sem Nome')}</span>
                    </div>
                </div>
                <div class="project-card-right">
                    <button class="btn-card-menu" title="Opções" data-id="${p.id}">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <span class="project-id">${p.id}</span>
                </div>
            `;

            const btnMenu = card.querySelector('.btn-card-menu');
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                openContextMenu(e, p.id);
            });

            card.addEventListener('click', () => {
                openCadastroPage(p.id);
            });

            projectsListEl.appendChild(card);
        });
    }

    // ESCAPE HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    // NAVEGAR PARA TELA DE CADASTRO
    function openCadastroPage(editingId = null, prefillData = null) {
        editingProjectId = editingId;
        formNovoProjetoPage.reset();
        
        const isStrat = currentOriginTab === 'estrategico';
        document.querySelectorAll('.strategic-prop-field').forEach(el => {
            if (isStrat) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        document.querySelectorAll('.standard-prop-field').forEach(el => {
            if (isStrat) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        });
        
        if (editingId) {
            const proj = projects.find(p => p.id === editingId);
            if (proj) {
                // Aba 1
                nomeInput.value = proj.nome || '';
                nomeCompletoInput.value = proj.nomeCompleto || '';
                orgaoInput.value = proj.orgao || '';
                statusSelect.value = isStrat ? 'Estruturação' : (proj.status || 'Elaboração');
                if (Array.isArray(proj.entregas)) {
                    activeDeliveries = [...proj.entregas];
                } else if (typeof proj.entregas === 'string' && proj.entregas) {
                    activeDeliveries = proj.entregas.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 0);
                } else {
                    activeDeliveries = [];
                }
                renderDeliveries();
                dataFimInput.value = proj.dataFim || '';

                if (document.getElementById('propJustificativa')) document.getElementById('propJustificativa').value = proj.propJustificativa || '';
                if (document.getElementById('propDesafios')) document.getElementById('propDesafios').value = proj.propDesafios || '';
                if (document.getElementById('propObjetivos')) document.getElementById('propObjetivos').value = proj.propObjetivos || '';
                if (document.getElementById('propEscopo')) document.getElementById('propEscopo').value = proj.propEscopo || '';
                if (document.getElementById('propPublicoAlvo')) document.getElementById('propPublicoAlvo').value = proj.propPublicoAlvo || '';
                if (document.getElementById('propDescricao')) document.getElementById('propDescricao').value = proj.propDescricao || '';
                if (document.getElementById('propPremissas')) document.getElementById('propPremissas').value = proj.propPremissas || '';
                if (document.getElementById('propRestricoes')) document.getElementById('propRestricoes').value = proj.propRestricoes || '';

                 // Aba 2
                 if (Array.isArray(proj.relevanciaDesafios)) {
                     activeDesafios = [...proj.relevanciaDesafios];
                 } else if (proj.relevanciaDesafio) {
                     // Legado: armazena objeto ao invez de string
                     activeDesafios = [{eixo: "Eixo 1 + Qualidade de Vida", area: "Edução, Cultura, Esporte e Lazer", desafio: proj.relevanciaDesafio}];
                 } else {
                     activeDesafios = [];
                 }
                 renderSelectedChallenges();
                const proposalsSelected = [];
                if (proj.relevanciaProgGoverno === 'Sim') proposalsSelected.push('Programa de Governo');
                if (proj.relevanciaAudiencias === 'Sim') proposalsSelected.push('Audiências Públicas');
                if (proj.relevanciaG1 === 'Sim') proposalsSelected.push('Monitoramento G1');
                if (proj.relevanciaPIP === 'Sim') proposalsSelected.push('PIP');
                if (msAtendeProposta) msAtendeProposta.setSelected(proposalsSelected);
                 if (Array.isArray(proj.relevanciaODSSelecionadas)) {
                     activeODS = [...proj.relevanciaODSSelecionadas];
                 } else if (typeof proj.relevanciaDetalheODS === 'string' && proj.relevanciaDetalheODS) {
                     activeODS = [];
                     SUGGESTED_ODS.forEach(ods => {
                         if (proj.relevanciaDetalheODS.toLowerCase().includes(ods.name.toLowerCase()) || 
                             proj.relevanciaDetalheODS.includes(String(ods.id))) {
                             activeODS.push(ods.id);
                         }
                     });
                 } else {
                     activeODS = [];
                 }
                 renderSelectedODS();
                document.getElementById('relevanciaCriticidade').value = proj.relevanciaCriticidade || '';
                document.getElementById('relevanciaReducaoDesigualdade').value = proj.relevanciaReducaoDesigualdade || '';
                document.getElementById('relevanciaAgendaMulher').checked = (proj.relevanciaAgendaMulher === 'Sim');
                document.getElementById('relevanciaReducaoRegional').value = proj.relevanciaReducaoRegional || '';
                document.getElementById('relevanciaDRS').checked = (proj.relevanciaDRS === 'Sim');
                document.getElementById('relevanciaInovacao').value = proj.relevanciaInovacao || '';
                if (document.getElementById('relevanciaFomentaInovacao')) {
                    document.getElementById('relevanciaFomentaInovacao').checked = proj.relevanciaFomentaInovacao !== undefined ? (proj.relevanciaFomentaInovacao === 'Sim') : (proj.relevanciaInovacao ? !proj.relevanciaInovacao.includes('Não') : false);
                }
                updateRelevanciaAccordionStates();

                 // Aba 3
                 if (toggleProjetoTemCusto) {
                     toggleProjetoTemCusto.checked = proj.viabilidadeProjetoTemCusto !== undefined ? proj.viabilidadeProjetoTemCusto : true;
                     updateOrcamentariosState();
                 }
                 custoTotalInput.value = proj.viabilidadeCustoTotal || '';
                fonteRecursosSelect.value = proj.viabilidadeFonteRecursos || '';
                descricaoFontesInput.value = proj.viabilidadeDescricaoFontes || '';
                statusCaptacaoSelect.value = proj.viabilidadeStatusCaptacao || '';
                tipoDespesaSelect.value = proj.viabilidadeTipoDespesa || '';
                recursoLOASelect.value = proj.viabilidadeRecursoLOA || '';
                valorLOAInput.value = proj.viabilidadeValorLOA || '';
                acaoOrcamentoInput.value = proj.viabilidadeAcaoOrcamento || '';
                planoOrcamentoInput.value = proj.viabilidadePlanoOrcamento || '';
                document.getElementById('viabilidadeRH').value = proj.viabilidadeRH || '';
                document.getElementById('viabilidadeTech').value = proj.viabilidadeTech || '';

                 // Aba 4 - Avaliação
                 document.getElementById('evalNotaAlinhamento').textContent = proj.evalNotaAlinhamento !== undefined ? proj.evalNotaAlinhamento : 0;
                 document.getElementById('evalNotaCriticidade').textContent = proj.evalNotaCriticidade !== undefined ? proj.evalNotaCriticidade : 0;
                 document.getElementById('evalNotaRDS').textContent = proj.evalNotaRDS !== undefined ? proj.evalNotaRDS.toString().replace('.', ',') : '0';
                 document.getElementById('evalNotaRDR').textContent = proj.evalNotaRDR !== undefined ? proj.evalNotaRDR.toString().replace('.', ',') : '0';
                 document.getElementById('evalNotaInovacao').textContent = proj.evalNotaInovacao !== undefined ? proj.evalNotaInovacao : 0;
                 document.getElementById('evalNotaOrcamento').textContent = proj.evalNotaOrcamento !== undefined ? proj.evalNotaOrcamento.toString().replace('.', ',') : 0;
                 document.getElementById('evalNotaExecucao').textContent = proj.evalNotaExecucao !== undefined ? proj.evalNotaExecucao.toString().replace('.', ',') : 0;

                 // Pré-projeto / Anteprojeto
                 if (document.getElementById('evalSelecionarPreProjeto')) {
                     document.getElementById('evalSelecionarPreProjeto').checked = !!proj.evalSelecionarPreProjeto;
                     document.getElementById('evalSelecionarPreProjeto').dispatchEvent(new Event('change'));
                 }
                 if (document.getElementById('evalPlanosDisponiveis')) {
                     const planVal = proj.evalPlanosDisponiveis || '';
                     document.getElementById('evalPlanosDisponiveis').value = planVal;
                     renderOndeNoPlanoTree(planVal, proj.evalOndeNoPlano || '');
                 }
                 if (document.getElementById('evalObservacoesPreProjeto')) {
                     document.getElementById('evalObservacoesPreProjeto').value = proj.evalObservacoesPreProjeto || '';
                 }

                 userOverridden = {};
                 updateEvaluationSummariesAndAverages();
            }
        } else {
            // Valores padrão para novo projeto
            nomeInput.value = prefillData && prefillData.nome ? prefillData.nome : '';
            nomeCompletoInput.value = prefillData && prefillData.nomeCompleto ? prefillData.nomeCompleto : '';
            orgaoInput.value = prefillData && prefillData.orgao ? prefillData.orgao : 'SEAG';
            statusSelect.value = isStrat ? 'Estruturação' : 'Elaboração';
            if (prefillData && Array.isArray(prefillData.entregas)) {
                activeDeliveries = [...prefillData.entregas];
            } else {
                activeDeliveries = [];
            }
            renderDeliveries();
            dataFimInput.value = '';

            if (document.getElementById('propJustificativa')) document.getElementById('propJustificativa').value = '';
            if (document.getElementById('propDesafios')) document.getElementById('propDesafios').value = '';
            if (document.getElementById('propObjetivos')) document.getElementById('propObjetivos').value = '';
            if (document.getElementById('propEscopo')) document.getElementById('propEscopo').value = '';
            if (document.getElementById('propPublicoAlvo')) document.getElementById('propPublicoAlvo').value = '';
            if (document.getElementById('propDescricao')) document.getElementById('propDescricao').value = '';
            if (document.getElementById('propPremissas')) document.getElementById('propPremissas').value = '';
            if (document.getElementById('propRestricoes')) document.getElementById('propRestricoes').value = '';

             activeDesafios = [];
             renderSelectedChallenges();
            if (msAtendeProposta) msAtendeProposta.clear();
             activeODS = [];
             renderSelectedODS();
            document.getElementById('relevanciaCriticidade').value = '';
            document.getElementById('relevanciaReducaoDesigualdade').value = '';
            document.getElementById('relevanciaAgendaMulher').checked = false;
            document.getElementById('relevanciaReducaoRegional').value = '';
            document.getElementById('relevanciaDRS').checked = false;
            document.getElementById('relevanciaInovacao').value = '';
            if (document.getElementById('relevanciaFomentaInovacao')) {
                document.getElementById('relevanciaFomentaInovacao').checked = false;
            }
            updateRelevanciaAccordionStates();

            if (toggleProjetoTemCusto) {
                toggleProjetoTemCusto.checked = true;
                updateOrcamentariosState();
            }
            custoTotalInput.value = '';
            fonteRecursosSelect.value = '';
            descricaoFontesInput.value = '';
            statusCaptacaoSelect.value = '';
            tipoDespesaSelect.value = '';
            recursoLOASelect.value = '';
            valorLOAInput.value = '';
            acaoOrcamentoInput.value = '';
            planoOrcamentoInput.value = '';
            document.getElementById('viabilidadeRH').value = '';
            document.getElementById('viabilidadeTech').value = '';

             // Aba 4 - Avaliação
             document.getElementById('evalNotaAlinhamento').textContent = 0;
             document.getElementById('evalNotaCriticidade').textContent = 0;
             document.getElementById('evalNotaRDS').textContent = 0;
             document.getElementById('evalNotaRDR').textContent = 0;
             document.getElementById('evalNotaInovacao').textContent = 0;
             document.getElementById('evalNotaOrcamento').textContent = 0;
             if (document.getElementById('evalSelecionarPreProjeto')) {
                 const shouldPreSelect = prefillData && prefillData.evalSelecionarPreProjeto !== undefined ? prefillData.evalSelecionarPreProjeto : false;
                 document.getElementById('evalSelecionarPreProjeto').checked = shouldPreSelect;
                 document.getElementById('evalSelecionarPreProjeto').dispatchEvent(new Event('change'));
             }
             if (document.getElementById('evalPlanosDisponiveis')) {
                 const planVal = (prefillData && prefillData.evalPlanosDisponiveis) ? prefillData.evalPlanosDisponiveis : '';
                 const nodeVal = (prefillData && prefillData.evalOndeNoPlano) ? prefillData.evalOndeNoPlano : '';
                 document.getElementById('evalPlanosDisponiveis').value = planVal;
                 renderOndeNoPlanoTree(planVal, nodeVal);
             }
             if (document.getElementById('evalObservacoesPreProjeto')) {
                 document.getElementById('evalObservacoesPreProjeto').value = '';
             }

             userOverridden = {};
             updateEvaluationSummariesAndAverages();
             resetTabs();
         }

        showView('cadastro');
    }

    // SUBMIT DO FORMULÁRIO (SALVAR CADASTRO)
    formNovoProjetoPage.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = nomeInput.value.trim();
        const nomeCompleto = nomeCompletoInput.value.trim();
        const status = statusSelect.value;
        const orgao = orgaoInput.value;
        const entregas = activeDeliveries.map(d => d.trim()).filter(d => d !== '');
        const dataFim = dataFimInput.value;

        const propJustificativa = document.getElementById('propJustificativa') ? document.getElementById('propJustificativa').value : '';
        const propDesafios = document.getElementById('propDesafios') ? document.getElementById('propDesafios').value : '';
        const propObjetivos = document.getElementById('propObjetivos') ? document.getElementById('propObjetivos').value : '';
        const propEscopo = document.getElementById('propEscopo') ? document.getElementById('propEscopo').value : '';
        const propPublicoAlvo = document.getElementById('propPublicoAlvo') ? document.getElementById('propPublicoAlvo').value : '';
        const propDescricao = document.getElementById('propDescricao') ? document.getElementById('propDescricao').value : '';
        const propPremissas = document.getElementById('propPremissas') ? document.getElementById('propPremissas').value : '';
        const propRestricoes = document.getElementById('propRestricoes') ? document.getElementById('propRestricoes').value : '';

        // Dados Aba 2
        const relevanciaDesafios = activeDesafios;
        const proposalsSelected = msAtendeProposta ? msAtendeProposta.getSelected() : [];
        const relevanciaProgGoverno = proposalsSelected.includes('Programa de Governo') ? 'Sim' : 'Não';
        const relevanciaAudiencias = proposalsSelected.includes('Audiências Públicas') ? 'Sim' : 'Não';
        const relevanciaG1 = proposalsSelected.includes('Monitoramento G1') ? 'Sim' : 'Não';
        const relevanciaPIP = proposalsSelected.includes('PIP') ? 'Sim' : 'Não';
        const relevanciaODSSelecionadas = activeODS;
        const relevanciaODS = relevanciaODSSelecionadas.length > 0 ? 'Sim' : 'Não';
        const relevanciaCriticidade = document.getElementById('relevanciaCriticidade').value;
        const relevanciaReducaoDesigualdade = document.getElementById('relevanciaReducaoDesigualdade').value;
        const relevanciaAgendaMulher = document.getElementById('relevanciaAgendaMulher').checked ? 'Sim' : 'Não';
        const relevanciaReducaoRegional = document.getElementById('relevanciaReducaoRegional').value;
        const relevanciaDRS = document.getElementById('relevanciaDRS').checked ? 'Sim' : 'Não';
        const relevanciaInovacao = document.getElementById('relevanciaInovacao').value;
        const relevanciaFomentaInovacao = document.getElementById('relevanciaFomentaInovacao') && document.getElementById('relevanciaFomentaInovacao').checked ? 'Sim' : 'Não';

        // Dados Aba 3
        const viabilidadeProjetoTemCusto = toggleProjetoTemCusto ? toggleProjetoTemCusto.checked : true;
        const viabilidadeCustoTotal = custoTotalInput.value.trim();
        const viabilidadeFonteRecursos = fonteRecursosSelect.value;
        const viabilidadeDescricaoFontes = descricaoFontesInput.value.trim();
        const viabilidadeStatusCaptacao = statusCaptacaoSelect.value;
        const viabilidadeTipoDespesa = tipoDespesaSelect.value;
        const viabilidadeRecursoLOA = recursoLOASelect.value;
        const viabilidadeValorLOA = valorLOAInput.value.trim();
        const viabilidadeAcaoOrcamento = acaoOrcamentoInput.value.trim();
        const viabilidadePlanoOrcamento = planoOrcamentoInput.value.trim();
        const viabilidadeRH = document.getElementById('viabilidadeRH').value;
        const viabilidadeTech = document.getElementById('viabilidadeTech').value;

         // Dados Aba 4
         const evalNotaAlinhamento = parseFloat(document.getElementById('evalNotaAlinhamento').textContent) || 0;
         const evalNotaCriticidade = parseFloat(document.getElementById('evalNotaCriticidade').textContent) || 0;
         const evalNotaRDS = parseFloat(document.getElementById('evalNotaRDS').textContent.replace(',', '.')) || 0;
         const evalNotaRDR = parseFloat(document.getElementById('evalNotaRDR').textContent.replace(',', '.')) || 0;
         const evalNotaInovacao = parseFloat(document.getElementById('evalNotaInovacao').textContent) || 0;
         const evalNotaOrcamento = parseFloat(document.getElementById('evalNotaOrcamento').textContent.replace(',', '.')) || 0;
         const evalNotaExecucao = parseFloat(document.getElementById('evalNotaExecucao').textContent.replace(',', '.')) || 0;

         // Dados Pré-projeto
         const evalSelecionarPreProjeto = document.getElementById('evalSelecionarPreProjeto') ? document.getElementById('evalSelecionarPreProjeto').checked : false;
         const evalPlanosDisponiveis = document.getElementById('evalPlanosDisponiveis') ? document.getElementById('evalPlanosDisponiveis').value : '';
         const evalObservacoesPreProjeto = document.getElementById('evalObservacoesPreProjeto') ? document.getElementById('evalObservacoesPreProjeto').value : '';
         let evalOndeNoPlano = '';
         const selectedNode = document.querySelector('.onde-no-plano-tree .selected');
         if (selectedNode) {
             evalOndeNoPlano = selectedNode.getAttribute('data-value') || selectedNode.textContent.trim();
         }

        // Validamos apenas os campos requeridos da primeira aba (Propriedades)
        if (!nome) {
            alert('Por favor, preencha o campo Nome na aba Propriedades.');
            return;
        }
        if (!orgao) {
            alert('Por favor, selecione o Órgão na aba Propriedades.');
            return;
        }

        if (editingProjectId) {
            const proj = projects.find(p => p.id === editingProjectId);
            if (proj) {
                proj.nome = nome;
                proj.nomeCompleto = nomeCompleto;
                proj.status = status;
                proj.orgao = orgao;
                proj.entregas = entregas;
                proj.dataFim = dataFim;
                proj.propJustificativa = propJustificativa;
                proj.propDesafios = propDesafios;
                proj.propObjetivos = propObjetivos;
                proj.propEscopo = propEscopo;
                proj.propPublicoAlvo = propPublicoAlvo;
                proj.propDescricao = propDescricao;
                proj.propPremissas = propPremissas;
                proj.propRestricoes = propRestricoes;
                
                // Aba 2
                proj.relevanciaDesafios = relevanciaDesafios;
                proj.relevanciaProgGoverno = relevanciaProgGoverno;
                proj.relevanciaAudiencias = relevanciaAudiencias;
                proj.relevanciaG1 = relevanciaG1;
                proj.relevanciaPIP = relevanciaPIP;
                proj.relevanciaODS = relevanciaODS;
                proj.relevanciaODSSelecionadas = relevanciaODSSelecionadas;
                proj.relevanciaCriticidade = relevanciaCriticidade;
                proj.relevanciaReducaoDesigualdade = relevanciaReducaoDesigualdade;
                proj.relevanciaAgendaMulher = relevanciaAgendaMulher;
                proj.relevanciaReducaoRegional = relevanciaReducaoRegional;
                proj.relevanciaDRS = relevanciaDRS;
                proj.relevanciaInovacao = relevanciaInovacao;
                proj.relevanciaFomentaInovacao = relevanciaFomentaInovacao;

                // Aba 3
                proj.viabilidadeProjetoTemCusto = viabilidadeProjetoTemCusto;
                proj.viabilidadeCustoTotal = viabilidadeCustoTotal;
                proj.viabilidadeFonteRecursos = viabilidadeFonteRecursos;
                proj.viabilidadeDescricaoFontes = viabilidadeDescricaoFontes;
                proj.viabilidadeStatusCaptacao = viabilidadeStatusCaptacao;
                proj.viabilidadeTipoDespesa = viabilidadeTipoDespesa;
                proj.viabilidadeRecursoLOA = viabilidadeRecursoLOA;
                proj.viabilidadeValorLOA = viabilidadeValorLOA;
                proj.viabilidadeAcaoOrcamento = viabilidadeAcaoOrcamento;
                proj.viabilidadePlanoOrcamento = viabilidadePlanoOrcamento;
                proj.viabilidadeRH = viabilidadeRH;
                proj.viabilidadeTech = viabilidadeTech;

                 // Aba 4
                 proj.evalNotaAlinhamento = evalNotaAlinhamento;
                 proj.evalNotaCriticidade = evalNotaCriticidade;
                 proj.evalNotaRDS = evalNotaRDS;
                 proj.evalNotaRDR = evalNotaRDR;
                 proj.evalNotaInovacao = evalNotaInovacao;
                 proj.evalNotaOrcamento = evalNotaOrcamento;
                 proj.evalNotaExecucao = evalNotaExecucao;
                 // Pré-projeto / Anteprojeto
                 proj.evalSelecionarPreProjeto = evalSelecionarPreProjeto;
                 proj.evalEscritorio = document.getElementById('evalEscritorioSelect') ? document.getElementById('evalEscritorioSelect').value : '';
                 proj.evalPlanosDisponiveis = evalPlanosDisponiveis;
                 proj.evalObservacoesPreProjeto = evalObservacoesPreProjeto;
                 proj.evalOndeNoPlano = evalOndeNoPlano;
            }
        } else {
            const maxId = projects.reduce((max, p) => p.id > max ? p.id : max, 210);
            const id = maxId + 1;

            projects.push({
                id,
                nome,
                nomeCompleto,
                status,
                orgao,
                entregas,
                dataFim,
                propJustificativa,
                propDesafios,
                propObjetivos,
                propEscopo,
                propPublicoAlvo,
                propDescricao,
                propPremissas,
                propRestricoes,
                // Aba 2
                relevanciaDesafios,
                relevanciaProgGoverno,
                relevanciaAudiencias,
                relevanciaG1,
                relevanciaPIP,
                relevanciaODS,
                relevanciaODSSelecionadas,
                relevanciaCriticidade,
                relevanciaReducaoDesigualdade,
                relevanciaAgendaMulher,
                relevanciaReducaoRegional,
                relevanciaDRS,
                relevanciaInovacao,
                relevanciaFomentaInovacao,
                // Aba 3
                viabilidadeProjetoTemCusto,
                viabilidadeCustoTotal,
                viabilidadeFonteRecursos,
                viabilidadeDescricaoFontes,
                viabilidadeStatusCaptacao,
                viabilidadeTipoDespesa,
                viabilidadeRecursoLOA,
                viabilidadeValorLOA,
                viabilidadeAcaoOrcamento,
                viabilidadePlanoOrcamento,
                viabilidadeRH,
                viabilidadeTech,
                 // Aba 4
                 evalNotaAlinhamento,
                 evalNotaCriticidade,
                 evalNotaRDS,
                 evalNotaRDR,
                 evalNotaInovacao,
                 evalNotaOrcamento,
                 evalNotaExecucao,
                 // Pré-projeto
                 evalSelecionarPreProjeto,
                 evalPlanosDisponiveis,
                 evalObservacoesPreProjeto,
                 evalOndeNoPlano
            });
        }

        saveState();
        showView('listagem');
    });

    // CLIQUE EM DESFAZER CADASTRO
    btnPageCancel.addEventListener('click', () => {
        showView('listagem');
    });

    // CONTEXT MENU
    function openContextMenu(e, projId) {
        currentSelectedCardId = projId;
        const proj = projects.find(p => p.id === projId);

        if (proj) {
            ctxMenuToggleStatus.innerHTML = proj.status === 'Cancelado' 
                ? '<i class="fa-solid fa-circle-check"></i> Reativar Projeto'
                : '<i class="fa-solid fa-ban"></i> Marcar como Cancelado';
        }

        const rect = e.target.getBoundingClientRect();
        contextMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
        contextMenu.style.left = `${rect.left + window.scrollX - 160}px`;
        contextMenu.classList.remove('hidden');
    }

    function hideContextMenu() {
        contextMenu.classList.add('hidden');
        currentSelectedCardId = null;
    }

    // CLIQUE NO MENU CONTEXTUAL
    ctxMenuEditar.addEventListener('click', () => {
        if (currentSelectedCardId) {
            const idToEdit = currentSelectedCardId;
            hideContextMenu();
            openCadastroPage(idToEdit);
        }
    });

    ctxMenuToggleStatus.addEventListener('click', () => {
        if (currentSelectedCardId) {
            const proj = projects.find(p => p.id === currentSelectedCardId);
            if (proj) {
                proj.status = proj.status === 'Cancelado' ? 'Em Andamento' : 'Cancelado';
                saveState();
                renderProjects();
            }
            hideContextMenu();
        }
    });

    ctxMenuExcluir.addEventListener('click', () => {
        if (currentSelectedCardId) {
            if (confirm('Tem certeza que deseja remover este projeto do inventário?')) {
                projects = projects.filter(p => p.id !== currentSelectedCardId);
                saveState();
                renderProjects();
            }
            hideContextMenu();
        }
    });

    // ESTRUTURA GERAL PE 2023-2026 PARA O MODAL PROJETO EXISTENTE
    const PE_TREE_DATA = {
        name: "PE 2023-2026",
        icon: "fa-solid fa-sitemap",
        expanded: true,
        children: [
            {
                name: "Realiza+",
                icon: "fa-solid fa-briefcase",
                expanded: true,
                children: [
                    {
                        name: "Eixo 1: +Qualidade de vida",
                        icon: "fa-solid fa-diagram-project",
                        expanded: true,
                        children: [
                            {
                                name: "Educação, Cultura, Esporte e Lazer",
                                icon: "fa-solid fa-folder",
                                children: [
                                    {
                                        name: "Cultura ES",
                                        icon: "fa-solid fa-gear",
                                        children: [
                                            { name: "Cais das Artes", icon: "fa-solid fa-gear" },
                                            { name: "Centro Cultural Carmélia", icon: "fa-solid fa-gear" },
                                            { name: "TVE Revista", icon: "fa-solid fa-gear" }
                                        ]
                                    },
                                    { name: "EsportES", icon: "fa-solid fa-gear" },
                                    { name: "Melhoria da Qualidade da Educação", icon: "fa-solid fa-gear" }
                                ]
                            },
                            { name: "Segurança Pública e Justiça", icon: "fa-solid fa-folder" },
                            { name: "Prot.Social, Saúde e Dir.Humanos", icon: "fa-solid fa-folder" }
                        ]
                    },
                    { name: "Eixo 2: +Des. com sustentabilidade", icon: "fa-solid fa-diagram-project" },
                    { name: "Eixo 3: +Resultados", icon: "fa-solid fa-diagram-project" }
                ]
            }
        ]
    };

    const CESAN_TREE_DATA = {
        name: "Cesan",
        icon: "fa-solid fa-briefcase",
        expanded: true,
        children: [
            {
                name: "Empreendimentos gerenciáveis PMO",
                icon: "fa-solid fa-diagram-project",
                children: [
                    { name: "Afonso Cláudio", icon: "fa-solid fa-gears" },
                    { name: "Água Doce do Norte", icon: "fa-solid fa-gears" },
                    { name: "Águia Branca", icon: "fa-solid fa-gears" },
                    { name: "Anchieta", icon: "fa-solid fa-gears" },
                    { name: "Cariacica", icon: "fa-solid fa-gears" },
                    { name: "Guarapari", icon: "fa-solid fa-gears" }
                ]
            },
            { name: "Inovação", icon: "fa-solid fa-diagram-project" }
        ]
    };

    const IJSN_TREE_DATA = {
        name: "IJSN",
        icon: "fa-solid fa-briefcase",
        expanded: true,
        children: [
            {
                name: "Estudos Socioeconômicos",
                icon: "fa-solid fa-diagram-project",
                children: [
                    { name: "Indicadores de Pobreza e Desigualdade", icon: "fa-solid fa-gears" },
                    { name: "Pesquisa de Emprego e Renda", icon: "fa-solid fa-gears" }
                ]
            },
            { name: "Geoprocessamento e Cartografia", icon: "fa-solid fa-diagram-project" }
        ]
    };

    const DIO_TREE_DATA = {
        name: "Direção Geral",
        icon: "fa-solid fa-briefcase",
        expanded: true,
        children: [
            {
                name: "Planejamento Estratégico Direção Geral",
                icon: "fa-solid fa-diagram-project",
                expanded: true,
                children: [
                    { name: "Projetos de Gestão Direção Geral", icon: "fa-solid fa-gear" }
                ]
            }
        ]
    };

    let modalSelectedLocation = { plan: 'Realiza +', location: 'Cultura ES' };

    function renderModalTree() {
        const container = document.getElementById('modalOndeNoPlanoTree');
        if (!container) return;
        container.innerHTML = '';

        const escritorio = modalEscritorioSelect ? modalEscritorioSelect.value : '';
        const plano = modalPlanoSelect ? modalPlanoSelect.value : '';

        let targetData = PE_TREE_DATA;
        if (escritorio === 'Cesan' || plano.includes('Cesan')) {
            targetData = CESAN_TREE_DATA;
        } else if (escritorio === 'IJSN' || plano.includes('IJSN')) {
            targetData = IJSN_TREE_DATA;
        } else if (escritorio === 'DIO/ES' || plano.includes('DIO')) {
            targetData = DIO_TREE_DATA;
        } else {
            targetData = PE_TREE_DATA;
        }

        function createNodeEl(node, level = 0) {
            const hasChildren = node.children && node.children.length > 0;
            const wrapper = document.createElement('div');
            wrapper.className = 'plano-tree-row-wrapper';

            const indentPx = level * 18 + 8;
            const isExpanded = !!node.expanded;

            const row = document.createElement('div');
            row.className = `plano-tree-row ${isExpanded ? 'expanded' : ''}`;
            row.setAttribute('data-name', node.name);
            row.style.paddingLeft = `${indentPx}px`;

            const toggleIconHtml = hasChildren 
                ? `<i class="fa-solid fa-chevron-right toggle-icon"></i>` 
                : `<i class="fa-solid fa-chevron-right toggle-icon" style="opacity: 0.2;"></i>`;
            
            const checkIconHtml = `<i class="fa-regular fa-square check-icon" style="color: #cbd5e1;"></i>`;
            const nodeIconHtml = `<i class="${node.icon || 'fa-solid fa-folder'} node-icon"></i>`;

            row.innerHTML = `
                ${toggleIconHtml}
                ${checkIconHtml}
                ${nodeIconHtml}
                <span class="node-title">${escapeHtml(node.name)}</span>
            `;

            wrapper.appendChild(row);

            let childrenContainer = null;
            if (hasChildren) {
                childrenContainer = document.createElement('div');
                childrenContainer.className = `plano-tree-children ${isExpanded ? '' : 'hidden'}`;
                node.children.forEach(child => {
                    childrenContainer.appendChild(createNodeEl(child, level + 1));
                });
                wrapper.appendChild(childrenContainer);
            }

            row.addEventListener('click', (e) => {
                const toggleBtn = e.target.closest('.toggle-icon');
                if (toggleBtn && childrenContainer) {
                    childrenContainer.classList.toggle('hidden');
                    row.classList.toggle('expanded');
                    return;
                }
                
                selectRowAndAncestors(row, container);

                // Detect selected plan
                let pName = 'Realiza +';
                if (node.name.includes('Cesan')) pName = 'Cesan';
                else if (node.name.includes('Direção')) pName = 'Direção Geral';
                else if (node.name.includes('PCIES')) pName = 'PCIES';
                else if (node.name.includes('Realiza')) pName = 'Realiza +';
                else {
                    let parent = row.closest('.plano-tree-children');
                    while (parent) {
                        const pRow = parent.previousElementSibling;
                        if (pRow) {
                            const title = pRow.getAttribute('data-name') || '';
                            if (title.includes('Cesan')) { pName = 'Cesan'; break; }
                            if (title.includes('Direção')) { pName = 'Direção Geral'; break; }
                            if (title.includes('PCIES')) { pName = 'PCIES'; break; }
                            if (title.includes('Realiza')) { pName = 'Realiza +'; break; }
                        }
                        parent = parent.parentElement ? parent.parentElement.closest('.plano-tree-children') : null;
                    }
                }

                modalSelectedLocation = { plan: pName, location: node.name };
            });

            return wrapper;
        }

        const rootEl = createNodeEl(targetData, 0);
        container.appendChild(rootEl);

        const defaultTarget = container.querySelector('.plano-tree-row');
        if (defaultTarget) {
            selectRowAndAncestors(defaultTarget, container);
        }
    }

    // EVENTOS DE ABERTURA DE TELA DE CADASTRO E MODAL PROJETO EXISTENTE
    btnQuickAdd.addEventListener('click', () => openCadastroPage());
    addProjectTrigger.addEventListener('click', () => openCadastroPage());
    
    const popoverNovo = document.getElementById('popoverNovo');
    if (popoverNovo) {
        popoverNovo.addEventListener('click', (e) => {
            e.stopPropagation();
            openCadastroPage();
        });
    }

    const popoverProjetoExistente = document.getElementById('popoverProjetoExistente');
    const modalProjetoExistente = document.getElementById('modalProjetoExistente');
    const btnCloseModalProjetoExistente = document.getElementById('btnCloseModalProjetoExistente');
    const btnCancelModalProjetoExistente = document.getElementById('btnCancelModalProjetoExistente');
    const btnConfirmModalProjetoExistente = document.getElementById('btnConfirmModalProjetoExistente');

    const modalEscritorioSelect = document.getElementById('modalEscritorioSelect');
    const modalPlanoSelect = document.getElementById('modalPlanoSelect');

    if (modalEscritorioSelect) {
        modalEscritorioSelect.addEventListener('change', (e) => {
            updatePlanoOptions(e.target.value, modalPlanoSelect);
            renderModalTree();
        });
    }

    if (modalPlanoSelect) {
        modalPlanoSelect.addEventListener('change', () => {
            renderModalTree();
        });
    }

    if (popoverProjetoExistente) {
        popoverProjetoExistente.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modalProjetoExistente) {
                modalProjetoExistente.classList.remove('hidden');
                renderModalTree();
            }
        });
    }

    if (btnCloseModalProjetoExistente) {
        btnCloseModalProjetoExistente.addEventListener('click', () => {
            modalProjetoExistente.classList.add('hidden');
        });
    }
    if (btnCancelModalProjetoExistente) {
        btnCancelModalProjetoExistente.addEventListener('click', () => {
            modalProjetoExistente.classList.add('hidden');
        });
    }

    if (btnConfirmModalProjetoExistente) {
        btnConfirmModalProjetoExistente.addEventListener('click', () => {
            modalProjetoExistente.classList.add('hidden');
            
            const locName = modalSelectedLocation.location || '';
            let nome = locName;
            let nomeCompleto = locName;
            let orgao = 'SEAG';
            let entregas = [];

            if (locName === 'Cais das Artes' || locName.includes('Cais')) {
                nome = 'Cais das Artes';
                nomeCompleto = 'Cais das Artes';
                orgao = 'SECULT';
                entregas = ['Conclusão da construção do Cais das Artes'];
            } else if (locName === 'Centro Cultural Carmélia' || locName.includes('Carmélia') || locName.includes('Carmelia')) {
                nome = 'Centro Cultural Carmélia';
                nomeCompleto = 'Centro Cultural Carmélia';
                orgao = 'CARMELIA';
                entregas = ['Reforma da Cobertura e Fachada'];
            } else if (locName && !['PE 2023-2026', 'Realiza+', 'Cesan', 'Direção Geral', 'PCIES'].includes(locName)) {
                entregas = [locName];
            }

            openCadastroPage(null, {
                nome: nome,
                nomeCompleto: nomeCompleto,
                orgao: orgao,
                entregas: entregas,
                evalSelecionarPreProjeto: false,
                evalPlanosDisponiveis: modalSelectedLocation.plan,
                evalOndeNoPlano: ''
            });
        });
    }

    addProjectDropArea.addEventListener('click', (e) => {
        if (!e.target.closest('#addProjectTrigger') && !e.target.closest('#popoverProjetoExistente') && !e.target.closest('#popoverNovo')) {
            openCadastroPage();
        }
    });

    // FILTROS
    selectFiltroStatus.addEventListener('change', renderProjects);
    inputSearchProject.addEventListener('input', renderProjects);

    // BUSCA NO TOPO
    btnTopSearch.addEventListener('click', () => {
        searchBarWrapper.classList.toggle('hidden');
        if (!searchBarWrapper.classList.contains('hidden')) {
            inputSearchProject.focus();
        }
    });

    // OCULTAR CONTEXT MENU AO CLICAR FORA
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && !e.target.closest('.btn-card-menu')) {
            hideContextMenu();
        }
    });

    // GERENCIAMENTO DAS ABAS DA TELA PRINCIPAL (INVENTÁRIO / PROJETO ESTRATÉGICO)
    const tabMainInventario = document.getElementById('tabMainInventario');
    const tabMainEstrategico = document.getElementById('tabMainEstrategico');
    const paneMainInventario = document.getElementById('paneMainInventario');
    const paneMainEstrategico = document.getElementById('paneMainEstrategico');

    function switchMainTab(tab) {
        currentOriginTab = tab;
        if (tab === 'inventario') {
            if (tabMainInventario) tabMainInventario.classList.add('active');
            if (tabMainEstrategico) tabMainEstrategico.classList.remove('active');
            if (paneMainInventario) paneMainInventario.classList.remove('hidden');
            if (paneMainEstrategico) paneMainEstrategico.classList.add('hidden');
            renderProjects();
        } else {
            if (tabMainEstrategico) tabMainEstrategico.classList.add('active');
            if (tabMainInventario) tabMainInventario.classList.remove('active');
            if (paneMainEstrategico) paneMainEstrategico.classList.remove('hidden');
            if (paneMainInventario) paneMainInventario.classList.add('hidden');
            renderStrategicProjectsView();
        }
        renderBreadcrumb('listagem');
    }

    if (tabMainInventario) {
        tabMainInventario.addEventListener('click', () => switchMainTab('inventario'));
    }
    if (tabMainEstrategico) {
        tabMainEstrategico.addEventListener('click', () => switchMainTab('estrategico'));
    }

    function renderStrategicProjectsView() {
        const tbody = document.getElementById('strategicProjectsTableBody');
        const kpiCount = document.getElementById('kpiTotalEstrategicos');
        if (!tbody) return;

        tbody.innerHTML = '';

        const list = projects.filter(p => p.status !== 'Cancelado');
        if (kpiCount) kpiCount.textContent = list.length;

        if (list.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 28px; color: #94a3b8;">
                        <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; color: #cbd5e1; display: block;"></i>
                        Nenhum projeto estratégico registrado no inventário.
                    </td>
                </tr>
            `;
            return;
        }

        list.forEach(p => {
            const tr = document.createElement('tr');
            const plano = p.evalPlanosDisponiveis || 'Realiza +';
            const onde = p.evalOndeNoPlano || '';
            const statusText = 'Estruturação';
            const statusBadge = `<span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 11px; display: inline-block;">${escapeHtml(statusText)}</span>`;

            tr.innerHTML = `
                <td style="font-weight: 600; color: #1e293b;">${escapeHtml(p.nome || 'Projeto sem nome')}</td>
                <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; color: #475569;">${escapeHtml(p.orgao || 'SEAG')}</span></td>
                <td><i class="fa-solid fa-briefcase" style="color: #0d9488; margin-right: 6px;"></i> ${escapeHtml(plano)}${onde ? ' &rsaquo; ' + escapeHtml(onde) : ''}</td>
                <td>${statusBadge}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn-card-menu btn-edit-strat" data-id="${p.id}" title="Opções" style="background: transparent; border: none; color: #64748b; padding: 6px 12px; font-size: 16px; cursor: pointer; transition: color 0.15s ease;">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </td>
            `;

            const btnEdit = tr.querySelector('.btn-edit-strat');
            if (btnEdit) {
                btnEdit.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openContextMenu(e, p.id);
                });
            }

            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                openCadastroPage(p.id);
            });

            tbody.appendChild(tr);
        });
    }

    // CARREGAMENTO INICIAL
    showView('listagem');
});
