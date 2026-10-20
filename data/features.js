// Funcionalidades do jogo. Editar aqui quando uma mecânica nova é implementada.
window.FEATURES = [
 {icon:"⚔️",color:"red",title:"Combate",items:["Ataque virado para o rato, dash com cooldown, stamina e corrida","8 tipos de inimigo (orcs e esqueletos) com armas iguais às do jogador","Arqueiros, esqueleto mago com cajado, arco com setas craftable","Críticos, enhancements nos itens, níveis 1–99 e arquétipos nos inimigos"]},
 {icon:"🌲",color:"green",title:"Mundo",items:["Grelha 3×3 de áreas de 240×180 tiles, gerada por seed, com streaming","Estradas, rios, lagos, planaltos de terra com patamares","18 espécies de árvores que renascem ao fim de 4 horas de jogo","Ciclo dia/noite de 10 minutos, mapa e minimapa"]},
 {icon:"🏘️",color:"orange",title:"Vila",items:["Casas de vários tamanhos com interiores, baús e camas","Taberna, ferreiro com forja e loja, torre do wizard (Recall Stone)","Um aldeão por casa, com rotina diária e chat","Lojas em grelha com Comprar e Vender"]},
 {icon:"🎒",color:"blue",title:"Itens e crafting",items:["Inventário de 40 slots com arrastar, hotbar de 10","Crafting em grelha por categorias","Colocáveis (bancada, tochas, camas, muralhas), rodáveis com R","Armaduras em ferro e 4 metais (defesa 1/3/5/8/12)"]},
 {icon:"📈",color:"purple",title:"Skills",items:["Vida, velocidade, woodcutting, mining, força","Archery, Dodge, Resistência e Magic","Tabela de XP de 1 a 99 (1/10 da do RuneScape)"]},
 {icon:"🐴",color:"yellow",title:"Cavalos e água",items:["Estábulo com stableman, cavalo próprio montável","Andar na água: só a cabeça à vista em água funda","Água animada, lagos e rios"]},
 {icon:"🕳️",color:"cyan",title:"Dungeons",items:["Uma dungeon por área, em labirinto","Inimigos, tochas e baú de recompensa","Marcadas a azul escuro no mapa"]},
 {icon:"🤝",color:"pink",title:"Multijogador",items:["Host autoritativo por ENet, até 4 jogadores","Personagens que viajam entre mundos","Inimigos, itens, aldeões e hora partilhados","Steamworks fica para o fim"]},
 {icon:"🛠️",color:"teal",title:"Ferramentas e qualidade",items:["mob_editor e item_editor (Python + Tkinter, sem Godot)","3 slots de mundo e 3 de personagem, gravação automática","Mais de 50 testes automáticos","Keybindings de teclado e comando, opções de vídeo, PT/EN"]}
];
// Capturas das mecânicas mais relevantes.
window.SHOTS = [
 {f:"vila_casas",t:"A vila",d:"Praça com fogueira, casas, taberna, HUD e minimapa."},
 {f:"casas_variantes",t:"Casas",d:"Telhados, paredes e tamanhos variados."},
 {f:"interiores_169",t:"Interiores",d:"Quartos com cama, janela, mobília e decoração nas paredes."},
 {f:"crafting_categorias",t:"Crafting",d:"Receitas por categoria no menu do inventário."},
 {f:"enhancements_inventario",t:"Enhancements",d:"Itens com qualidade, críticos e tooltip detalhado."},
 {f:"stats_dodge",t:"Skills",d:"Níveis, XP e estatísticas derivadas."},
 {f:"equipamento_metais",t:"Armaduras",d:"Capacete, peitoral e botas em cinco metais."},
 {f:"inimigos_nivel",t:"Nível dos inimigos",d:"Espadas cruzadas com o nível ao lado da barra de vida."},
 {f:"dungeon_entrada",t:"Entrada da dungeon",d:"A mina na floresta."},
 {f:"dungeon_dentro",t:"Dentro da dungeon",d:"Escuridão, tochas e inimigos."},
 {f:"agua_lago",t:"Andar na água",d:"Em água funda só a cabeça fica à vista."},
 {f:"elevacao_depois_perto",t:"Planaltos",d:"Paredes de terra com colisão e patamares."},
 {f:"cavalo_montado",t:"Cavalos",d:"Montar nas quatro direções."},
 {f:"stableman",t:"Estábulo",d:"O stableman e os cavalos."},
 {f:"bau_aberto",t:"Baús",d:"Mover pilhas entre o baú e o inventário."},
 {f:"recall_efeito",t:"Recall Stone",d:"Efeito de regresso à vila."},
 {f:"tocha_nova",t:"Tochas",d:"Colocáveis animados que iluminam."},
 {f:"oclusao_arvore",t:"Oclusão",d:"O que tapa o jogador fica semitransparente."},
 {f:"personagens_lista",t:"Personagens",d:"Slots de personagem no menu."}
];
