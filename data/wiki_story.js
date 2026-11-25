// A história do Pixel Fantasy, para o separador «História» da wiki (wiki.js, renderStory).
// Escrito à mão (não é gerado pelo jogo): a fonte é a nota 08-historia da vault. As secções com
// Cada secção tem parágrafos (paras) e/ou pontos (points: [título, texto]); aparecem todas abertas.
// img/alt: a ilustração do capítulo (img/story/<id>.png, 1440x816, fundo transparente; feitas no PixelLab e recortadas pelo
// make_recorte.py da vault, raw/pixel_fantasy/custom_assets/historia_ilustracoes/).
window.WIKI_STORY = {
  updated: '2026-11-25',
  lead: 'A história planeada para o jogo. Ainda não está toda no jogo e pode mudar. Contém spoilers: conta tudo, incluindo o fim.',
  sections: [
    {
      id: 'premissa', title: 'Premissa',
      img: 'img/story/premissa.png', alt: 'O escudeiro, de costas, com a pedra de regresso na mão, diante do portão da vila; por cima da floresta o céu rasga-se a vermelho.',
      paras: [
        'O jogador é um escudeiro. Serve o cavaleiro de uma vila cercada no meio da floresta, e a vida é simples: cortar lenha, fazer recados, aprender o ofício.',
        'Um dia abrem-se portais e deles saem criaturas de outros mundos. O cavaleiro morre a segurar o portão. O escudeiro herda-lhe a pedra de regresso, e o mago da vila ergue sobre a muralha um feitiço que não deixa entrar nenhum monstro, mas que lhe custa um pouco mais a cada noite.',
        'Para lá da muralha, cada bioma tem um portal guardado por um dos cinco guerreiros de elite do mago do portal. O escudeiro sai para os derrubar, um a um.',
      ],
    },
    {
      id: 'lema', title: 'O lema',
      paras: [
        'Às vezes é preciso aceitar a perda e saber seguir em frente, mesmo que isso implique abandonar alguma coisa que já nos fez muito bem.',
        'E às vezes é preciso dar um passo atrás para dar dois para a frente.',
      ],
    },
    {
      id: 'personagens', title: 'Personagens',
      points: [
        ['O escudeiro', 'o jogador. Serve o cavaleiro da vila.'],
        ['O cavaleiro da vila', 'viúvo há pouco tempo. Morre no primeiro ataque, a segurar o portão.'],
        ['O mago da vila', 'o dono da torre e da loja de poções. Perdeu a filha, que era a sua aprendiz e a mulher do cavaleiro. É ele que protege a vila.'],
        ['O mago do portal', 'o antagonista. Abriu os portais e comanda os cinco de elite.'],
        ['Os cinco de elite', 'um por bioma, cada um a guardar um portal. O Rei Esqueleto é um deles.'],
        ['O dragão', 'o que espera do outro lado do último portal.'],
      ],
    },
    {
      id: 'antes', title: 'Antes do jogo: o futuro que correu mal',
      img: 'img/story/antes.png', alt: 'O mago ajoelhado, com a pedra junto ao peito, enquanto figuras de sombra lhe são arrancadas das costas.',
      paras: [
        'O mago do portal é o mago da vila, vindo de um futuro em que nunca aceitou a morte da filha.',
        'Nesse futuro, anos depois de a perder, pega na pedra de regresso que ela fez para o marido e tenta que a magia do regresso a traga de volta. Para conseguir fazer o ritual arranca de si tudo o que o fazia hesitar: o Medo, a Dúvida, a Piedade, a Culpa e a Memória do que é a morte. Esses pedaços ganham corpo. São os cinco de elite.',
        'O ritual falha da maneira que uma pedra de regresso falharia. Em vez de trazer a filha até ele, puxa-o a ele para o dia em que a perdeu. Quem não larga a perda não volta à pessoa: volta ao dia da perda. Chega no instante a seguir, tarde demais para a salvar.',
        'A chegada abre um rasgão pequeno, que ninguém nota. Ele esconde-se e passa semanas, ou meses, a tentar puxá-la por ali. Cada tentativa alarga o rasgão, até ao dia em que cede e os portais se abrem. É aí que o jogo começa.',
      ],
    },
    {
      id: 'elite', title: 'Os cinco de elite',
      img: 'img/story/elite.png', alt: 'Guerreiros de armadura em fila, com o Rei Esqueleto ao centro, diante de um arco de pedra com um portal vermelho.',
      paras: [
        'Os cinco obedecem ao mago em tudo menos numa coisa: cada um guarda o portal do seu bioma meio fechado. São a parte dele que ainda o trava.',
        'Ele não os consegue matar, porque são precisamente o que o faz parar: sempre que levanta a mão contra um, hesita. Por isso espalhou-os pelo mundo, um por bioma, para não os ouvir.',
        'O Rei Esqueleto é a Memória do que é a morte: um rei morto que sabe que os mortos não voltam.',
      ],
    },
    {
      id: 'ato2', title: 'A grande melhoria',
      img: 'img/story/ato2.png', alt: 'Festa na praça da vila: bancas, lanternas vermelhas e aldeões a dançar à volta da fonte.',
      paras: [
        'O jogador lê tudo ao contrário: vê cinco generais a guardar portais e vai matá-los. A cada elite que cai, a horda desse bioma dispersa, a vila respira, as bancas voltam, há festa.',
        'As pistas estão lá, mas só fazem sentido depois. Os elites nunca atacam a vila, que é a casa dele e dela. Ao morrer, nenhum ameaça: pedem. «Sem mim, ele deixa de ter medo.» E os cinco pedaços estão inteiros no mago da vila, que é medroso, hesitante, piedoso e culpado.',
      ],
    },
    {
      id: 'ato3', title: 'A queda',
      img: 'img/story/ato3.png', alt: 'Um portal enorme aberto no céu por cima da vila, a cúpula do feitiço a estalar e o vulto de um mago encapuzado, de costas.',
      paras: [
        'Com o quinto elite morto, o mago do portal já não tem dúvida, medo, piedade nem culpa, e pela primeira vez abre o portal por inteiro. O feitiço da muralha quebra e a vila é invadida.',
        'O mago do portal aparece então pela primeira vez, e é o mago da vila, mais velho. O jogador fez, de boa-fé, aquilo que o vilão nunca conseguiu fazer sozinho.',
      ],
    },
    {
      id: 'ato4', title: 'O fim',
      img: 'img/story/ato4.png', alt: 'Um dragão vermelho de asas abertas baixa a cabeça para o escudeiro, que lhe mostra a pedra a brilhar.',
      paras: [
        'Do portal sai o dragão, e o mago acredita que é a filha a voltar. É, de certa forma: é a alma dela, puxada à força por uma magia sem medo, dúvida, piedade, culpa nem memória da morte, e por isso sem nada disso. O dragão é a filha feita à imagem daquilo em que o pai se tornou.',
        'No ponto mais baixo, o mago oferece ao escudeiro o mesmo negócio: o cavaleiro de volta. O jogador recusa, e derrota o mago e depois o dragão, que hesita diante da pedra de regresso, a prenda dela para o marido.',
        'O dragão cai mas não morre, e o portal continua aberto. A pedra é a âncora: prende a alma dela deste lado e segura os portais. O mago, de novo inteiro, diz o que ela é, mas não é capaz de a partir. É o jogador que a parte. Os portais apagam-se todos, a filha aparece em paz por um instante e parte, e só então o pai a chora.',
        'Sem pedra, o escudeiro volta para a vila a pé, pelos biomas já em paz. O mago da vila, que não fazia uma pedra desde que perdeu a aprendiz, faz-lhe uma nova e melhor, que cura por inteiro quem a usa. Ao fazê-la segue em frente, e o futuro que produziu o mago do portal deixa de existir. A vila abre os portões.',
      ],
    },
    {
      id: 'pedra', title: 'A pedra de regresso',
      img: 'img/story/pedra.png', alt: 'Duas mãos abertas com a pedra de regresso a estalar, e luz dourada a sair das fendas.',
      paras: [
        'A magia do regresso é antiga e é deste mundo: uma pedra guarda um sítio e traz quem a usa de volta a ele. Era o ofício do mago da vila, e o que a filha aprendia com ele. A pedra do cavaleiro foi feita por ela, para ele voltar sempre a casa.',
        'A pedra acompanha o jogador o jogo todo e faz-lhe sempre bem. No fim tem de a partir. Largá-la é aceitar que não se volta atrás, o contrário do que o mago fez. É o passo atrás; a pedra nova são os dois passos em frente.',
      ],
    },
    {
      id: 'aberto', title: 'Por decidir',
      points: [
        ['Os nomes', 'o mago ainda não tem nome.'],
        ['Os cinco de elite', 'que pedaço é cada um e em que bioma está. Só o Rei Esqueleto está atribuído, e hoje o jogo tem dois biomas: a floresta e o deserto.'],
        ['A filha', 'como morreu.'],
      ],
    },
  ],
};
