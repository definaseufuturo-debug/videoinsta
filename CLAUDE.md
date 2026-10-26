# videoinsta: produção e postagem automática da @mindloop_u

Este repositório gera vídeos animados (desenhados por código), narrados com voz neural e sincronizados palavra a palavra, e os publica como Reels na @mindloop_u pelo Windsor.ai.

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
2. Chame o Windsor `execute_action` com:
   - connector `instagram`, account `17841442746650307`, action `create_video_post`;
   - params `{video_url, caption, share_to_feed: true, thumb_offset}` vindos do JSON.
3. Se der certo: `python3 pipeline/fila.py marcar <id> <media_id>`.
   Se der erro: `python3 pipeline/fila.py falhou <id> "<erro>"`. Tente de novo uma única vez, depois de 1 minuto.
4. Acrescente uma linha em `log/postagens.md`: `- AAAA-MM-DD HH:MM | <id> | <origem> | ok <media_id>` (ou `ERRO ...`).
5. Faça commit e push (`git pull --rebase` antes).
6. Nunca poste duas vezes no mesmo horário. Nunca poste fora da fila.

## Tarefa B: PRODUZIR (de madrugada, faz os 3 vídeos do dia)
Para cada horário do dia (veja os horários em `calendario.md`):

1. **Tema.** Pegue o próximo `[ ]` da coluna certa.
   - No horário de almoço (EM ALTA), pesquise com WebSearch as notícias de hoje no Brasil e escolha um assunto em alta que dê para explicar em "como funciona" de forma neutra.
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
   - Alterne as vozes entre os vídeos do dia:
     - masculina: `c9d3da0bdf61417d929dc67966e4befe`;
     - jovem: `b1cab1f57b8d41aeb225d7d8bafc0806`.
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

## Regras de conteúdo (sempre)
- **Propriedade intelectual:** nenhuma marca, logo, produto de marca, personagem famoso ou rosto de pessoa real. Desenhe versões genéricas.
- **Saúde:** só fatos com fonte. Sem promessa de cura ou resultado, sem dose e sem "use X". Mencione a necessidade de orientação médica.
- **Política:** só explicação neutra de como algo funciona, com dados oficiais. Cores neutras, sem fotos de candidatos e sem opinião.
- **Formato:** 1080x1920, H.264 + AAC, até 30 MB, de 35 a 60 s, legenda queimada palavra a palavra.
- **Commits:** terminam com `Co-Authored-By: Claude <noreply@anthropic.com>`.
