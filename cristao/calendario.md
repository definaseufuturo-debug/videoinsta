# Calendário do perfil cristão @e_cosdafe

**Identidade:** "a Bíblia no mapa". Histórias bíblicas contadas como mapa animado em pergaminho, com rota, lugares, números do próprio texto e a referência bíblica. De 35 a 50 s, em 9:16 e em português.

## Horários (Brasília), todos os dias
- **07:00: DEVOCIONAL "Palavra da Manhã".** Um versículo + contexto + aplicação, de 30 a 40 s. **Desde 29/10/2026: estilo TEXTO CINÉTICO** do exemplo `devocional-cinetico` (cor chapada por cena, palavras gigantes entrando no instante em que são faladas, destaques sublinhados, referência no rodapé, CTA "comenta amém" + botão seguir). O antigo `biblia-devocional` (pergaminho) não é mais usado no devocional.
- **12:00: REFLEXÃO EM BONEQUINHOS (palito).** Animação sem narração, 30 s, trilha sintetizada própria. Estilo dos exemplos `palito-venda` ("Tire a venda", o melhor até agora) e `palito-depois`.
- **19:00: MAPA "A Bíblia no mapa".** Série de histórias bíblicas em mapa de pergaminho (exemplos `biblia-exodo` e `biblia-paulo`).
- Os dois são postados pela API oficial da Meta (`pipeline/ig_post.sh`), uns 8 min antes do horário.

## Formato fixo
- Estilo dos exemplos `biblia-exodo` e `biblia-paulo`: papel pergaminho, mapa real (Natural Earth), rota que anda junto com a narração, multidão/viajante, placas com os números do texto.
- **Série:** cada vídeo termina puxando o próximo ("a próxima parte é…, segue pra não perder"). Siga a ordem da fila para a promessa ser cumprida.
- Cabeçalho com o título e a referência (ex.: "Êxodo 12 – 14"). Rodapé: "Rota tradicional aproximada" quando o local for debatido.

## Devocional das 07:00: formato
1. Gancho de identificação (pergunta curta sobre o sentimento: "Acordou ansioso?").
2. O versículo no pergaminho, palavra a palavra, com a referência (só 1 a 2 versículos curtos).
3. Contexto em 1 frase: quem disse, em que situação (fato do texto).
4. Virada: o que isso significa no meio daquela situação.
5. Aplicação para hoje, em 1 frase.
6. CTA: "Se essa palavra é pra você, comenta amém. E segue, pra receber uma palavra toda manhã."
No estilo cinético, o que varia é a **paleta** (uma cor por cena, no bloco CONFIG do anim.js) e as **palavras de destaque** (`accent`). O gancho (cena 1) precisa ser curto e direto, falando com a pessoa ("Acordou ansioso?"), porque é o que segura o primeiro segundo.

## Fila do devocional (07:00, pegue o próximo [ ])
- [x] Esperança: as misericórdias se renovam cada manhã (Lm 3:22-23) — 28/10
- [x] Ansiedade: não andeis ansiosos (Fp 4:6-7; Paulo escreveu preso) — 29/10 (1º no estilo texto cinético)
- [ ] Medo: não temas, eu sou contigo (Is 41:10)
- [ ] Cansaço: vinde a mim, os cansados (Mt 11:28-30)
- [ ] Propósito: pensamentos de paz, não de mal (Jr 29:11; carta aos exilados na Babilônia)
- [ ] Preocupação com o sustento: olhai as aves do céu (Mt 6:26)
- [ ] Coragem: sê forte e corajoso (Js 1:9)
- [ ] Espera: os que esperam no Senhor renovam as forças (Is 40:31)
- [ ] Paz: a minha paz vos dou (Jo 14:27; dito na véspera da cruz)
- [ ] Recomeço: se alguém está em Cristo, nova criatura é (2Co 5:17)
- [ ] Solidão: não te deixarei nem te desampararei (Dt 31:6)
- [ ] Confiança: confia no Senhor de todo o coração (Pv 3:5-6)
- [ ] Cuidado: o Senhor é o meu pastor (Sl 23:1)
- [ ] Proteção: aquele que habita no esconderijo do Altíssimo (Sl 91:1-2)
- [ ] Dor e luto: perto está o Senhor dos que têm o coração quebrantado (Sl 34:18)
- [ ] Gratidão: em tudo dai graças (1Ts 5:18)
- [ ] Sabedoria: se alguém tem falta de sabedoria, peça (Tg 1:5)
- [ ] Palavras: a resposta branda desvia o furor (Pv 15:1)
- [ ] Perdão: se confessarmos, ele é fiel para perdoar (1Jo 1:9)
- [ ] Trabalho: fazei tudo de coração, como para o Senhor (Cl 3:23)
- [ ] Alegria: a alegria do Senhor é a vossa força (Ne 8:10)
- [ ] Força: tudo posso naquele que me fortalece (Fp 4:13; contexto: contentamento)
- [ ] Fé: a fé é a certeza do que se espera (Hb 11:1)
- [ ] Amor: o amor é paciente, o amor é bondoso (1Co 13:4)
- [ ] Família: eu e a minha casa serviremos ao Senhor (Js 24:15)
- [ ] Oração: entra no teu quarto e ora em secreto (Mt 6:6)
- [ ] Generosidade: Deus ama quem dá com alegria (2Co 9:7)
- [ ] Ira: não se ponha o sol sobre a vossa ira (Ef 4:26)
- [ ] Humildade: pratique a justiça, ame a misericórdia (Mq 6:8)
- [ ] Novo dia: este é o dia que o Senhor fez (Sl 118:24)

## Reflexão em bonequinhos (12:00): formato
O que fez o "Tire a venda" render 3× mais que os outros: **metáfora visual que se entende sem som no 1º segundo**, **ação contínua** (gente caindo, andando, empurrando: nunca uma cena parada) e **tema universal**.
1. 0–2 s: a cena-metáfora já em movimento + gancho no alto em 2 a 3 linhas (espaçado, branco/vermelho).
2. 2–10 s: a multidão repete o erro (vários bonequinhos, profundidade com 2 fileiras).
3. ~10 s: UM bonequinho percebe (luz sobre ele, "!" vermelho).
4. 11–15 s: HEADLINE em tela escura, 4 pancadas, linha por linha, a última em vermelho.
5. 15–24 s: a virada: ele age e muda os outros (dominó).
6. 24–30 s: frase final gigante (branco + vermelho) + subfrase + "MARCA QUEM PRECISA VER ISSO".
Visual fixo: fundo preto, bonequinhos brancos com brilho, UM elemento vermelho simbólico (venda, corrente, pedra, máscara, bola), sem rosto, sem emoji, sem texto além dos títulos. Trilha: copie `audio.py` do exemplo e ajuste os eventos (tensão → pancadas → virada esperançosa); -14 LUFS. Legenda: pergunta direta + 1 versículo que conversa com a metáfora + "Marca quem precisa ver isso 👇".

## Fila dos bonequinhos (12:00, pegue o próximo [ ])
- [x] Tire a venda: todos vendados caem no buraco; um tira a venda e segura a fila (Mt 15:14)
- [x] Depois: o pai no celular, o filho cresce (Sl 127:3)
- [x] A porta estreita (Mt 7:13-14)
- [ ] As máscaras: todos sorrindo de máscara; ao tirar, estão chorando. "TODO MUNDO ESTÁ BEM. ATÉ TIRAR A MÁSCARA." (Gl 6:2)
- [ ] A corrente: todos acorrentados ao celular-cadeado; um quebra a dele (Jo 8:36)
- [ ] O peso: cada um carrega uma pedra (passado, culpa, opinião dos outros); um solta e fica leve (Mt 11:28)
- [ ] A escada: todos pisam uns nos outros para subir; um desce e estende a mão (Fp 2:3-4)
- [ ] A ponte: dois grupos separados por um abismo; um começa a construir sozinho (Mt 5:9)
- [ ] O espelho: cada um só enxerga o próprio reflexo/celular; um olha para o lado e vê alguém caído (Lc 10:33)
- [ ] A semente: todos desistem de regar; um continua, e a árvore cresce para todos (Gl 6:9)
- [ ] A areia e a rocha: casas na areia caindo na tempestade; uma na rocha fica (Mt 7:24-27)
- [ ] A ovelha perdida: a fila de 99 segue; um volta para buscar o que ficou para trás (Lc 15:4)
- [ ] O filho pródigo: ele volta de cabeça baixa e o pai corre até ele (Lc 15:20)
- [ ] A fila do "eu": todos com setas apontando para si; um vira a seta para o outro (Fp 2:4)
- [ ] O barulho: todos com fones e telas gritando; um tira o fone e ouve o silêncio (Sl 46:10)

## Fila do mapa (19:00, pegue o próximo [ ])
- [x] O Êxodo: do Egito ao Mar Vermelho (Êx 12–14) — postado 27/10
- [x] Do Mar Vermelho ao Sinai: Mara, Elim, o maná e Refidim (Êx 15–19) — 28/10
- [x] Por que 40 anos no deserto? Os espias e Cades-Barneia (Nm 13–14; Dt 1:2 "onze dias") — 29/10
- [ ] A travessia do Jordão e a queda de Jericó (Js 3–6)
- [ ] As 12 tribos: onde cada uma ficou na terra prometida (Js 13–19)
- [ ] Davi e Golias: o vale de Elá no mapa (1Sm 17)
- [ ] Elias: do monte Carmelo ao Horebe, 40 dias de caminhada (1Rs 18–19)
- [ ] Jonas: Nínive para um lado, Társis para o outro (Jn 1–3)
- [ ] O exílio: de Jerusalém à Babilônia (2Rs 24–25)
- [ ] A volta do exílio e os muros de Neemias em 52 dias (Ed 1; Ne 6:15)
- [ ] O caminho de Abraão: de Ur até Canaã (Gn 11–12)
- [ ] José: do poço a governador do Egito (Gn 37–41)
- [ ] Maria e José: de Nazaré a Belém (Lc 2)
- [ ] A fuga para o Egito e a volta para Nazaré (Mt 2)
- [ ] Jesus na Galileia: as cidades dos milagres em volta do lago (Evangelhos)
- [ ] A última semana de Jesus em Jerusalém, dia a dia (mapa da cidade)
- [ ] O caminho de Emaús (Lc 24)
- [ ] O Pentecostes: de onde vinham as pessoas que ouviram em sua língua (At 2:9–11)
- [ ] As 7 igrejas do Apocalipse no mapa (Ap 2–3)
- [ ] O tamanho da arca de Noé em escala (Gn 6:15)

## Regras de conteúdo do perfil cristão
- **Versículos:** cite no máximo 1 a 2 versículos por vídeo, com a referência; o resto é narração própria. Contexto só com fatos do texto ou de fonte de referência.
- **Fonte principal é o texto bíblico.** Cite capítulo e versículo no `_comment` do script.json e na legenda. Números (distâncias, quantidades, dias) só os do texto ou de fonte de referência (atlas bíblico, enciclopédia) conferida em 2 fontes.
- **Locais debatidos** (travessia do Mar Vermelho, monte Sinai, etc.): mostre a localização tradicional e diga "tradicional"/"aproximada". Não tome partido em debates acadêmicos.
- **Respeito:** sem rosto de Deus ou de Jesus; use símbolos (luz, coluna de nuvem/fogo, silhueta distante, pergaminho). Pessoas aparecem como pontos/viajantes no mapa.
- **Sem polêmica denominacional** nem política. Tom de fé, acolhedor, sem sensacionalismo ("o que a Bíblia conta").
- Sem emoji no canvas (a fonte não tem).
