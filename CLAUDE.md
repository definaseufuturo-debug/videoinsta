# videoinsta: produção e postagem automática da @mindloop_u

Este repositório gera vídeos animados (desenhados por código), narrados com voz neural e sincronizados palavra a palavra, e os publica como Reels na @mindloop_u pelo Windsor.ai e como Shorts no YouTube (`pipeline/yt_post.sh`, workflow `yt-post.yml`, segredos `YT_CLIENT_ID`, `YT_CLIENT_SECRET` e `YT_REFRESH_TOKEN`). O canal cristão do YouTube (**JesusIsLove**, `yt_post.sh` com canal `cristao`, segredo `YT_REFRESH_TOKEN_CRISTAO`) tem fila própria (`--conta jesusislove`) e só posta bonequinhos de pais e filhos; os Reels do @e_cosdafe não vão mais para o YouTube (desde 02/11/2026).

- **Dono:** Jonas, que fala português.
- **Conta:** Instagram `mindloop_u`, id `17841442746650307`, connector `instagram`.

## Estrutura
- `videos/`: MP4 finais. São públicos via `https://raw.githubusercontent.com/definaseufuturo-debug/videoinsta/main/videos/<arquivo>`, que é a URL que o Instagram baixa.
- `fila.json`: fila de postagens (agendados e reserva). Mexa nela só por `pipeline/fila.py`.
- `calendario.md`: horários, linha editorial e fila de temas.
- `pipeline/`:
  - `setup.sh`: instala dependências e baixa a voz. Rode uma vez por sessão.
  - `novo.sh <slug>`: cria `producoes/<slug>` a partir do template.
  - `build.sh <slug> [--frames t1,t2]`: gera a narração, o áudio e o vídeo (`producoes/<slug>/build/video.mp4`).
  - `template/`: projeto base. `src/anim.js` é a animação em canvas e `narration/script.json` é o roteiro.
  - `exemplos/`: animações reais já publicadas (`motor`, `apuracao`, `caneta`, e as de mapa `mapa`, `estados` e `capitais`). Leia pelo menos uma inteira antes de escrever outra. Para MAPA, parta de `exemplos/estados` (mapa coroplético, ranking e CTA de sigla) com `assets/br.json`.
- `log/postagens.md`: registro de cada execução. Sempre acrescente uma linha.

## Tarefa A: POSTAR (rodada nos horários de postagem)
1. `python3 pipeline/fila.py proximo`.
   - Se vier `{"nada": true}`, registre no log e encerre.
2. Chame o Windsor `execute_action` com connector `instagram` e account `17841442746650307`:
   - se `tipo` for `video`: action `create_video_post`, com params `{video_url, caption, share_to_feed: true, thumb_offset}` vindos do JSON;
   - se `tipo` for `carrossel`: action `create_carousel_post`, com params `{image_urls, caption}` vindos do JSON.
   O `proximo` normal só devolve vídeos. Os carrosséis saem pela tarefa de carrossel com `fila.py proximo --so-carrossel`, que nunca usa a reserva.
3. Se der certo: `python3 pipeline/fila.py marcar <id> <media_id>`.
   Se der erro: `python3 pipeline/fila.py falhou <id> "<erro>"`. Tente de novo uma única vez, depois de 1 minuto.
3b. **YouTube (só vídeos, só depois do Instagram dar certo).** Salve o `caption` num arquivo temporário e rode `bash pipeline/yt_post.sh <id> videos/<arquivo do video_url> <arquivo da legenda> "<título>"`.
   - Título: uma pergunta ou frase curta e forte sobre o tema, de até 80 caracteres, sem emoji (o script acrescenta " #Shorts").
   - Se der `postado`: `python3 pipeline/fila.py marcar_yt <id> <video_id>`.
   - Se der erro: registre no log e siga. Não tente de novo e não mexa no post do Instagram. Se o erro for de cota (`quotaExceeded`), pule o YouTube até o dia seguinte.
   - Carrossel não vai para o YouTube.
4. Acrescente uma linha em `log/postagens.md`: `- AAAA-MM-DD HH:MM | <id> | <origem> | ok <media_id> | yt <video_id>` (ou `ERRO ...` em cada parte).
5. Faça commit e push (`git pull --rebase` antes).
6. Nunca poste duas vezes no mesmo horário. Nunca poste fora da fila.

## Tarefa B2: PRODUZIR MINDLOOP EM BONEQUINHOS (de madrugada, 2 vídeos do dia) — VALE DESDE 31/10/2026
A @mindloop_u virou "a mente em bonequinhos" (ver o topo de `calendario.md`). Todo dia: almoço (12:00 dias úteis, 13:00 fim de semana) e noite (19:00 / 20:00), os dois em bonequinhos de palito, 30 s, sem narração.
1. Tema: os 2 próximos `[ ]` da "Fila de temas mente" do `calendario.md`.
2. Leia inteiros os exemplos `pipeline/exemplos/palito-amanha/`, `palito-venda/` e `palito-depois/` (anim.js, audio.py, export_cues.js). Crie com `pipeline/novo.sh AAAA-MM-DD-<slug> template_cristao` (o template serve para os dois perfis), apague os .json de `assets/`, escreva `src/anim.js` + `audio.py`, `build/timeline.json` = `{"duration":30,"fps":30,"words":[],"clips":[]}`, rode `node export_cues.js && python3 audio.py && node render.js`. O `audio.py` faz só sons de cena reais (`pipeline/sfx.py`) e a música entra depois com `pipeline/trilha.py mixar` pelo clima (ver "SOM DE CADA VÍDEO").
3. Checagem visual obrigatória pela folha de quadros (bonecos grandes e visíveis, textos sem sobreposição, headline legível).
4. Copie para `videos/<slug>.mp4`, legenda conforme o calendário, `python3 pipeline/fila.py adicionar <slug> <slug>.mp4 legenda.txt AAAA-MM-DDTHH:MM <thumb_ms>` (capa no quadro da headline inteira), marque `[x]`, apague `producoes/<slug>/build`, commit e push a cada vídeo.
5. As Tarefas B (abaixo), C (EM ALTA) e D (CARROSSEL) estão PAUSADAS.

## (PAUSADA) Tarefa B: PRODUZIR "como funciona"
Pausada desde 31/10/2026.

1. **Tema.** Pegue o próximo `[ ]` da coluna certa para a noite de hoje (seg/qua/sex MAPA, ter/qui RAIO-X, sáb/dom corpo/escala/quiz). O almoço (EM ALTA) é feito de manhã pela Tarefa C, para pegar o assunto ainda quente.
   - Pesquise e confira os fatos (2 ou mais fontes) e anote as fontes no `script.json` (`_comment`).
2. **Roteiro.** Rode `pipeline/novo.sh AAAA-MM-DD-<slug>` e escreva o `narration/script.json`:
   - 6 a 7 clips, 45 a 55 s no total, com `speed` entre 1,10 e 1,15;
   - vozes `pm_alex` ou `pf_dora`, alternando;
   - siglas pronunciadas pelo mapa `say`;
   - a primeira frase é um gancho forte, com número, pergunta ou choque;
   - a última frase é o CTA: pergunta para comentar e um motivo para seguir. Prefira o gancho de série ("amanhã: X, segue pra não perder") ao "segue pra mais", porque converte mais seguidores;
   - duração ideal de 35 a 45 s. Os vídeos mais curtos retêm melhor;
   - `thumb_offset` (capa): use o instante em que o título ou número principal da cena 1 já está inteiro na tela, nunca um quadro de transição ou de contagem pela metade.
2b. **Voz (padrão: Fish Audio).**
   - No `script.json`, adicione `"fish": {"voice": "<id>", "speed": 1.18, "model": "s2.1-pro-free"}`.
   - Alterne entre as 4 vozes, sem repetir a mesma voz no mesmo dia. Veja em `log/postagens.md` e nos `script.json` recentes quais foram usadas por último:
     - masculina: `c9d3da0bdf61417d929dc67966e4befe`;
     - jovem: `b1cab1f57b8d41aeb225d7d8bafc0806`;
     - voz 3: `a7f67c4e2d94440aad9c5a82365d9d92`;
     - voz 4: `a0a26a57cac94ea4918f05a2393b4259`.
   - Rode `pipeline/fish.sh <slug>`. Ele envia o pedido ao GitHub Actions, que usa o segredo `FISH_API_KEY`, espera e copia os áudios para `producoes/<slug>/fish/`. Depois siga com `pipeline/build.sh`.
   - Se a Fish der erro (sem crédito, fora do ar ou tempo esgotado), apague a chave `"fish"` do `script.json` e use a voz Kokoro (`pm_alex`/`pf_dora`). Registre o motivo no log.
3. **Animação.** Escreva `src/anim.js`, com uma cena por clip, presa às palavras via `wt('cN','palavra')`.
   - Reaproveite as primitivas do template: `txt`, `rtxt`, `chip`, `stampMark`, `bg`, `soft` e as legendas.
   - Use só tipos de som que existem no dicionário `H` de `tools/audio.py`.
   - Não use emoji no canvas, porque a fonte não tem. Use ✓ × ≠ ▲ Σ ou desenhe o ícone.
4. **Checagem visual (obrigatória).**
   - Rode `pipeline/build.sh <slug> --frames ...` com 15 a 20 instantes.
   - Monte uma folha de quadros: `ffmpeg -pattern_type glob -i 'build/frames/t_*.png' -vf scale=270:480,tile=7x3 sheet.png`.
   - Olhe a folha com Read. Corrija sobreposições, textos que aparecem antes da hora e cenas vazias.
   - Depois rode `pipeline/build.sh <slug>`. O resultado precisa ter menos de 30 MB. Se passar, comprima com 2-pass.
5. **Publicar na fila.**
   - Copie para `videos/<slug>.mp4`.
   - Escreva a legenda num .txt:
     - gancho e 2 a 3 frases;
     - o aviso "🎨 Animação e narração feitas com IA.";
     - para saúde: "📚 Conteúdo educativo, não substitui orientação médica.";
     - CTA de comentar e seguir a @mindloop_u;
     - 6 a 8 hashtags.
   - Rode `python3 pipeline/fila.py adicionar <slug> <slug>.mp4 legenda.txt AAAA-MM-DDTHH:MM`, com o horário do slot.
   - Marque o tema como `[x]` no `calendario.md`.
6. Faça commit e push depois de cada vídeo (não espere os 3). Apague `producoes/<slug>/build` antes do commit, porque ele já está no .gitignore.
7. Se um vídeo falhar, deixe o horário vazio. A tarefa de postar usa a reserva.

## (PAUSADA desde 31/10/2026) Tarefa C: EM ALTA
1. Rode `pipeline/trends.sh`. Ele lista o que o Brasil mais está buscando agora (Google Trends), com a manchete de cada assunto. Complete com WebSearch das notícias de hoje.
2. Escolha **um** assunto que esteja na boca do povo **e** que dê para explicar no formato "como funciona" ou com dados. Exemplos:
   - "por que o dólar subiu";
   - "como funciona a regra X que mudou hoje";
   - "o que é o fenômeno do tempo que está em todo lugar";
   - um jogo histórico explicado em números;
   - um lançamento de tecnologia por dentro.
   Prefira o de maior volume de busca entre os que encaixam.
3. Não entram:
   - tragédias com vítimas;
   - crimes envolvendo pessoas identificáveis;
   - fofoca e vida pessoal de famosos;
   - boatos não confirmados;
   - política partidária opinativa.
   Também valem as Regras de conteúdo abaixo (sem rosto, marca ou escudo de time: desenhe tudo genérico).
4. Confira os fatos em 2 ou mais fontes. Depois produza como na Tarefa B, com vídeo de 35 a 45 s. O horário é 12:00 nos dias úteis e 13:00 no fim de semana. Se o horário já tiver vídeo na fila, use `fila.py` para substituir só se o assunto novo for claramente mais quente.
5. No log, registre qual assunto foi escolhido e por quê.

## (PAUSADA desde 31/10/2026) Tarefa D: CARROSSEL
1. Tema: pegue o próximo `[ ]` da seção "Carrossel" do `calendario.md`, alternando entre "guia pra salvar" e "ranking/mapa". Confira os fatos em 2 ou mais fontes.
2. Crie `carrosseis/AAAA-MM-DD-<slug>/gerar.js` partindo de `pipeline/exemplos/carrossel-mapa/gerar.js`. Ele desenha os cards com @napi-rs/canvas, em 1080×1350, e salva JPEG `01.jpg`, `02.jpg`… Para rodar, ligue o `node_modules` da raiz com um symlink.
   - **Quantidade:** de 6 a 10 cards.
   - **Capa:** gancho forte, mais "ARRASTA →".
   - **Meio:** uma ideia por card.
   - **Último card:** CTA "SALVA E SEGUE" com pergunta para comentar.
   - **Rodapé de todo card:** `@mindloop_u` e a fonte.
   - **Estilo:** papel quadriculado (dados e mapas) ou fundo escuro do "como funciona" (guias e passos).
   - **Texto:** sem emoji nos cards, porque a fonte não tem. Letras grandes e legíveis no celular.
3. Monte uma folha com todos os cards e olhe com Read. Corrija textos cortados e sobreposições.
4. Escreva `legenda.txt`:
   - "Arrasta pro lado →";
   - resumo;
   - avisos (fonte, educativo e, se for saúde, orientação médica);
   - "💾 Salva…";
   - 6 a 8 hashtags.
5. Rode `python3 pipeline/fila.py adicionar_carrossel <id> carrosseis/<pasta> carrosseis/<pasta>/legenda.txt AAAA-MM-DDT16:00`. Depois marque `[x]` no calendário e faça commit e push.

## Regras de conteúdo (sempre)
- **Propriedade intelectual:** nenhuma marca, logo, produto de marca, personagem famoso ou rosto de pessoa real. Desenhe versões genéricas.
- **Saúde:** só fatos com fonte. Sem promessa de cura ou resultado, sem dose e sem "use X". Mencione a necessidade de orientação médica.
- **Política:** só explicação neutra de como algo funciona, com dados oficiais. Cores neutras, sem fotos de candidatos e sem opinião.
- **Formato:** 1080x1920, H.264 + AAC, até 30 MB, de 35 a 60 s, legenda queimada palavra a palavra.
- **Commits:** terminam com `Co-Authored-By: Claude <noreply@anthropic.com>`.

# Perfil cristão @e_cosdafe (segunda conta)

- **Conta:** Instagram `e_cosdafe`, id `17841451042007480`. **Não usa o Windsor.** Posta pela API oficial da Meta via GitHub Actions: `pipeline/ig_post.sh <job.json>` (workflow `ig-post.yml`, segredo `IG_TOKEN_CRISTAO`, token de usuário do sistema que não expira; vai pelo graph.facebook.com pela Página ligada à conta).
- **Fila:** `fila_cristao.json`, sempre por `python3 pipeline/fila.py <comando> --conta cristao`. Vídeos em `videos/cristao/`.
- **Calendário e regras:** `cristao/calendario.md` (desde 02/11/2026: **Instagram @e_cosdafe** = 2 Reels por dia SEM bonequinhos, 07:00 Palavra da Manhã e 19:00 formato do dia: seg/qui mapa, ter personagem, qua/sáb curiosidades e dados, sex estudo bíblico, dom quiz. **YouTube JesusIsLove** = 1 Short por dia às 12:00, só bonequinhos de pais e filhos, fila `fila_jesusislove.json`, vídeos em `videos/jesusislove/`).
- **Base:** `pipeline/novo.sh <slug> template_cristao`. Antes de escrever, leia inteiro o exemplo do formato: devocional = `pipeline/exemplos/devocional-cinetico/` (estilo TEXTO CINÉTICO desde 29/10/2026: copie o anim.js inteiro e edite só o bloco CONFIG — destaques, referência e paleta; apague os .json de `assets/`); mapa = `pipeline/exemplos/biblia-exodo/` e `biblia-paulo/`; bonequinhos = `pipeline/exemplos/palito-venda/` e `palito-depois/` (anim.js + audio.py + export_cues.js; sem narração: não usa fish/tts, roda `node export_cues.js && python3 audio.py && node render.js` com um `build/timeline.json` de `{"duration":30,"fps":30,"words":[],"clips":[]}`).
  - Mapa da região: `python3 pipeline/geo_regiao.py <lon0> <lon1> <lat0> <lat1> producoes/<slug>/assets/regiao.json` e, no anim.js, carregue esse arquivo e use `K = Math.cos(lat_ref * Math.PI / 180)` (o `lat_ref` vem no JSON). Para o Mediterrâneo inteiro, existe `assets/med.json` (K = cos 37°).
  - Os comandos de build da Tarefa B valem iguais (`pipeline/fish.sh`, `pipeline/build.sh`, folha de quadros obrigatória).

## Tarefa E: PRODUZIR CRISTÃO (de madrugada, 3 vídeos do dia) — desde 02/11/2026
Todo dia: **Instagram 07:00** Palavra da Manhã (devocional/reflexão) + **Instagram 19:00** formato do dia (seg/qui MAPA, ter PERSONAGEM, qua/sáb CURIOSIDADES E DADOS, sex ESTUDO BÍBLICO, dom QUIZ) + **YouTube 12:00** bonequinhos de pais e filhos. Veja o que já está na fila (`fila.py status --conta cristao` e `--conta jesusislove`) e produza só o que falta, começando pelo que sai primeiro. Commit e push depois de cada vídeo.
1. Tema: o próximo `[ ]` da fila certa de `cristao/calendario.md`. Confira no texto bíblico e em mais uma fonte (atlas/enciclopédia). Anote referências no `_comment`.
2. Roteiro (`narration/script.json`): **Devocional:** 30 a 40 s, Fish `speed` ~1.05, formato de 6 passos do calendário. **Mapa:** 35 a 50 s, gancho com número do texto na 1ª frase, último clip com pergunta para comentar + gancho da série. **Personagem / curiosidade / estudo / quiz:** 30 a 45 s, texto cinético a partir de `pipeline/exemplos/devocional-cinetico/` (copie o anim.js e edite o CONFIG; números grandes na tela; quiz com contagem de 3 s antes de cada resposta), gancho forte no 1º segundo e CTA que pede comentário (regras "para viralizar" do calendário). **Bonequinhos (YouTube):** sem roteiro falado; formato de 6 passos dos bonequinhos e guia "COMO FAZER PAIS E FILHOS QUE PEGA" do calendário (30 s exatos).
3. Voz Fish por formato: **devocional e estudo = voz 3** (`a7f67c4e2d94440aad9c5a82365d9d92`); **mapa, personagem, curiosidades e quiz = voz 4** (`a0a26a57cac94ea4918f05a2393b4259`). Fallback Kokoro como na Tarefa B.
4. Animação, checagem visual (folha de quadros) e build como na Tarefa B. `thumb_offset` no quadro em que o número/título da cena 1 está inteiro (bonequinhos: headline inteira).
5. **Instagram:** copie para `videos/cristao/<slug>.mp4`; legenda: gancho + 2 frases com a referência bíblica (devocional: o versículo entre aspas), "🎨 Animação e narração feitas com IA.", "Rota tradicional aproximada" se for o caso, CTA de comentar e seguir a @e_cosdafe, 6 a 8 hashtags. `python3 pipeline/fila.py adicionar <slug> <slug>.mp4 legenda.txt AAAA-MM-DDT<07:00|19:00> <thumb_ms> --conta cristao`.
   **YouTube:** copie para `videos/jesusislove/<slug>.mp4`; legenda/descrição: pergunta que obriga a escolher + 1 versículo + "Marca quem precisa ver isso 👇" + "🎨 Animação feita com IA." + 5 a 7 hashtags; na 1ª linha da legenda ponha `TITULO: <título de até 80 caracteres, sem emoji>`. `python3 pipeline/fila.py adicionar <slug> <slug>.mp4 legenda.txt AAAA-MM-DDT12:00 <thumb_ms> --conta jesusislove`.
6. Marque `[x]` no calendário, apague `producoes/<slug>/build` e faça commit e push. Slug: `cristao-AAAA-MM-DD-<tema>` (Instagram) e `jil-AAAA-MM-DD-<tema>` (YouTube).

## Tarefa F: POSTAR CRISTÃO NO INSTAGRAM (às 06:52 e 18:52; também roda às 11:52)
1. `python3 pipeline/fila.py proximo --conta cristao`. Se vier `{"nada": true}`, pule para a Tarefa G (sem reserva por enquanto).
2. Monte o job `{"conta": "cristao", "tipo": "video", "video_url", "caption", "share_to_feed": true, "thumb_offset"}` com os campos do JSON, salve num arquivo temporário e rode `bash pipeline/ig_post.sh <arquivo>`.
3. `status` "postado" → `python3 pipeline/fila.py marcar <id> <media_id> --conta cristao`. "erro" → `fila.py falhou <id> "<erro>" --conta cristao` e tente de novo uma vez depois de 1 minuto.
3b. **Desde 02/11/2026 os Reels do Instagram NÃO vão para o YouTube.** (Os vídeos antigos da fila cristao com `youtube_id` já foram enviados; não reenvie.)
4. Linha no `log/postagens.md`: `- AAAA-MM-DD HH:MM | <id> | cristao | ok <media_id>` (ou `ERRO …`). Commit e push.

## Tarefa G: POSTAR NO YOUTUBE JESUSISLOVE (na mesma rodada, depois da Tarefa F)
1. `python3 pipeline/fila.py proximo --conta jesusislove`. Se vier `{"nada": true}`, registre no log (só se a Tarefa F também não postou nada) e encerre.
2. Salve o `caption` num arquivo temporário SEM a 1ª linha `TITULO: …` e rode `bash pipeline/yt_post.sh <id> videos/jesusislove/<arquivo do video_url> <arquivo> "<título da linha TITULO>" cristao` (se não houver linha TITULO, crie um título curto e forte, até 80 caracteres, sem emoji).
3. `postado` → `python3 pipeline/fila.py marcar <id> <video_id> --conta jesusislove` e `python3 pipeline/fila.py marcar_yt <id> <video_id> --conta jesusislove`. Erro → `fila.py falhou <id> "<erro>" --conta jesusislove`; se for `quotaExceeded`, deixe para o dia seguinte; senão tente de novo uma vez depois de 1 minuto.
4. Linha no `log/postagens.md`: `- AAAA-MM-DD HH:MM | <id> | jesusislove | yt <video_id>` (ou `ERRO …`). Commit e push.

## SOM DE CADA VÍDEO (desde 03/11/2026, vale para TODOS os formatos e perfis)
Os vídeos estavam soando todos iguais porque a música era sempre o mesmo "piano" sintético (senoides em Am F C G) e os efeitos eram bipes sintetizados. Agora:
1. **Música = trilha real escolhida pelo clima, nunca repetida.** Depois do `render.js`/`build.sh`, decida o clima do vídeo em `pipeline/clima.json` (bonequinhos: `pais_filhos/<saudade|arrependimento|ternura|gratidao|perdao|esperanca|alegria|tensao>`; mindloop: `mente/<reflexivo|melancolico|inspirador|tensao|leve>`; cristão: `devocional/…`, `mapa/viagem`, `personagem/epico`, `cristao/<curiosidade|quiz|estudo>`; achadinhos: `achadinhos/…`; Sticky Man: `stickyman/…`) e rode:
   `python3 pipeline/trilha.py mixar build/video.mp4 <grupo>/<clima> <slug> build/video_trilha.mp4 [--duck]`
   - `--duck` só em vídeo NARRADO (a música abaixa quando a voz entra). Bonequinhos sem narração: sem `--duck`.
   - O rodízio é automático (`trilhas/usados.json`): a mesma música não volta nos últimos 15 vídeos de nenhum perfil. Faça commit de `trilhas/usados.json` junto com o vídeo.
   - Se imprimir `CREDITO:`, essa linha vai na legenda do Instagram e na descrição do YouTube.
   - Se der `SEM_TRILHA`, rode `python3 pipeline/trilha.py pedir <grupo>/<clima>` (GitHub Actions completa o banco) ou use outro clima próximo. Trilha ruim ao ouvir/olhar o título: `trilha.py descartar <arquivo>`.
   - Por isso, no `audio.py` dos bonequinhos **não escreva mais a música sintética** (piano/pad): o audio.py faz só os sons de cena; a música entra pelo `trilha.py`.
2. **Sons de cena = gravações reais do banco**, não senoides. No `audio.py`:
   ```python
   import sys; sys.path.insert(0, "../../pipeline")
   from sfx import Banco
   B = Banco(SR, semente=<qualquer número diferente por vídeo>)
   B.put(put, "porta", t)          # o pico do som cai em t
   B.cama(put, "amb_chuva", 0, DUR) # ambiente de fundo do cenário
   ```
   Categorias (`python3 sfx-skill/scripts/sons.py listar`): cena = porta, porta_rangendo, passos, relogio, coracao, celular, notificacao, chaves, copo, papel, teclado, camera, moedas, bebe, criancas, suspiro, aplausos, sino_igreja, trovao, espada, ovelhas, cavalo, carro; interface = pop, whoosh, swipe, click, ding, sucesso, erro, tick, toggle, batida, impacto, riser, dinheiro; ambientes = amb_chuva, amb_vento, amb_passaros, amb_noite, amb_cidade, amb_multidao, amb_fogueira, amb_mar, amb_casa.
   - Todo vídeo de história tem **um ambiente** que combine com o cenário (casa à noite = amb_noite/amb_casa; chuva; deserto bíblico = amb_vento; cidade = amb_cidade) e **3 a 8 sons de cena** nos momentos de ação (porta batendo, passos indo embora, celular vibrando, relógio no "o tempo passou", coração na revelação). Não encha de efeito: o silêncio antes da headline vale mais.
   - Faltou um som? `python3 sfx-skill/scripts/sons.py adicionar <categoria> "<busca em inglês>"` não alcança o Openverse daqui; acrescente a categoria em `CATALOGO` do `sons.py` e dispare o workflow `sfx-banco` mudando `sfx-skill/pedido.txt`.
3. **Vídeos NARRADOS (mapa, devocional, personagem, curiosidades, estudo, quiz, "como funciona", Sticky Man):** ponha `"clima": "<grupo>/<clima>"` no `narration/script.json` e o `build.sh` já troca a batida sintética pela trilha real do banco (rodízio, mesmo volume, abaixando sob a voz). NÃO rode `trilha.py mixar` nesses vídeos (ficaria música dupla). Clima por formato:
   - mapa bíblico = `mapa/viagem`; personagem = `personagem/epico`; devocional / Palavra da Manhã = `devocional/calmo`, `devocional/adoracao` ou `devocional/esperanca` (pelo tom do texto); curiosidades = `cristao/curiosidade`; quiz = `cristao/quiz`; estudo = `cristao/estudo`;
   - mindloop narrado = `mente/…`; achadinhos = `achadinhos/…`; Sticky Man = `stickyman/leve|tensao|vitoria`.
   - Se o build imprimir `CREDITO:` (também fica em `build/credito.txt`), ponha a linha na legenda e na descrição. Se imprimir `aviso: … usando a trilha sintética`, o clima ainda não tem trilhas: siga assim e registre no log.
   - Os efeitos do `tools/audio.py` (dicionário `H`) continuam; para sons de cena específicos (sino, trovão, ovelhas, cavalo, vento do deserto nos mapas), use o `Banco` do `pipeline/sfx.py` como nos bonequinhos.

## Música e sons livres (Openverse) — busca avulsa
`bash pipeline/openverse.sh <slug> "<busca>" [music|sound_effect] [min_s] [max_s] [n]` busca no Openverse via GitHub Actions (`openverse.yml`, segredos opcionais `OPENVERSE_CLIENT_ID` e `OPENVERSE_CLIENT_SECRET`) e traz os arquivos para `openverse/out/<slug>/`, com `resultados.json`. Só licenças cc0, pdm e by. Se a licença for BY, ponha o campo `credito` na legenda do Instagram e na descrição do YouTube. Ouça antes de usar.
- A música por clima agora sai do banco pronto (`pipeline/trilha.py`, seção "SOM DE CADA VÍDEO"). Use o `openverse.sh` só para buscar algo específico que o banco não tem.
