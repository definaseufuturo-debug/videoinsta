"""Banco de efeitos sonoros CC0 e mixagem com o pico de cada som no frame do movimento.

Cada som é baixado uma vez, cortado, normalizado e medido: o banco guarda o instante do pico
(o momento mais alto do som). Na hora de usar, o som começa antes do movimento o suficiente
para o pico cair exatamente no frame.

Uso:
  sons.py kenney                      baixa os pacotes CC0 da Kenney (interface e impacto) e monta as categorias
  sons.py banco [--categorias whoosh,dinheiro] [--refazer]
                                      busca efeitos CC0 no Openverse (whoosh, dinheiro, impacto, riser)
  sons.py adicionar <categoria> "<busca em inglês>" [--max 1.5] [--volume 0.4]
  sons.py importar <categoria> <arquivo>... --fonte "<origem e licença>"
  sons.py trocar <categoria> <n>      troca a variação n de uma categoria do Openverse pelo próximo resultado
  sons.py listar
  sons.py remotion <pasta do projeto> copia o banco e o componente TrilhaSons para um projeto Remotion
  sons.py mixar <vídeo ou áudio> <sons.json> <saída>
                                      mistura os efeitos num vídeo pronto. sons.json: [{"em": 1.25, "som": "pop"}, ...]

Banco: <pasta da skill>/banco/banco.json e banco/sfx/<categoria>-<n>.wav
Openverse: https://api.openverse.org (sem chave; 20 buscas por minuto e 200 por dia). Kenney: https://kenney.nl (CC0).
"""
import argparse, json, os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.parse, urllib.request, wave, zipfile

import imageio_ffmpeg
import numpy as np

SKILL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PASTA = os.path.join(SKILL, 'banco')
PASTA_SFX = os.path.join(PASTA, 'sfx')
BANCO = os.path.join(PASTA, 'banco.json')
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TAXA = 44100
API = 'https://api.openverse.org/v1/audio/'
AGENTE = {'User-Agent': 'Mozilla/5.0 (efeitos-sonoros)'}
# Títulos que indicam música, loop ou ambiente, não efeito
EVITAR = ('loop', 'music', 'ambien', 'song', 'beat', 'melody', 'drone', 'atmos')

# Openverse. categoria: (busca, duração máxima em s, volume padrão na mixagem com a voz)
CATALOGO = {
    'whoosh': ('whoosh', 1.6, 0.45),           # troca de cena, entrada rápida
    'dinheiro': ('cash register', 1.8, 0.45),  # venda, faturamento
    'impacto': ('impact', 2.0, 0.5),           # batida grave (dramático, use pouco)
    'riser': ('riser', 3.5, 0.35),             # subida antes de uma virada (dramático, use pouco)
}

# Kenney (CC0). pacote: {categoria: (volume, duração máxima, [arquivos])}
KENNEY = {
    'interface-sounds': {
        'click': (0.55, 0.4, ['click_001', 'click_002', 'click_004']),
        'ding': (0.4, 1.5, ['glass_001', 'glass_002', 'glass_003', 'glass_004']),
        'sucesso': (0.4, 2.0, ['confirmation_001', 'confirmation_002', 'confirmation_003', 'confirmation_004']),
        'swipe': (0.4, 1.0, ['maximize_001', 'maximize_002', 'maximize_003', 'maximize_004']),
        'toggle': (0.45, 0.5, ['toggle_001', 'toggle_002', 'toggle_003', 'toggle_004']),
        'tick': (0.35, 0.3, ['tick_001', 'tick_002']),
        'pop': (0.5, 0.6, ['drop_001', 'drop_002', 'drop_003', 'drop_004']),
        'erro': (0.35, 1.0, ['error_001', 'error_002', 'error_003', 'error_004']),
    },
    'impact-sounds': {
        'batida': (0.45, 0.8, ['impactSoft_medium_000', 'impactSoft_medium_001', 'impactSoft_medium_002', 'impactSoft_medium_003']),
    },
}


def carregar():
    if os.path.exists(BANCO):
        with open(BANCO) as f:
            return json.load(f)
    return {}


def salvar(banco):
    os.makedirs(PASTA, exist_ok=True)
    with open(BANCO, 'w') as f:
        json.dump(dict(sorted(banco.items())), f, ensure_ascii=False, indent=2)
        f.write('\n')


# ---------- áudio ----------
def decodificar(caminho, taxa=TAXA, canais=1):
    saida = subprocess.run(
        [FFMPEG, '-loglevel', 'error', '-i', caminho, '-ac', str(canais), '-ar', str(taxa), '-f', 'f32le', '-'],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(saida, dtype=np.float32).copy()


def processar(amostras, maximo):
    """Corta o silêncio do início, limita a duração, normaliza e mede o pico. Devolve (amostras, pico_s) ou None."""
    if amostras.size < TAXA * 0.01:  # cliques de interface têm 10 a 20 ms
        return None
    topo = np.abs(amostras).max()
    if topo < 1e-4:
        return None
    acima = np.nonzero(np.abs(amostras) > topo * 0.03)[0]
    inicio = max(0, acima[0] - int(TAXA * 0.005))
    amostras = amostras[inicio:inicio + int(TAXA * maximo)]
    fim_som = np.nonzero(np.abs(amostras) > topo * 0.01)[0][-1] + int(TAXA * 0.05)
    amostras = amostras[:fim_som]
    rampa = min(int(TAXA * 0.06), amostras.size // 4)
    if rampa:
        amostras[-rampa:] *= np.linspace(1, 0, rampa)
    amostras = amostras / np.abs(amostras).max() * 0.89  # -1 dBFS
    # Pico = janela de 10 ms com maior energia
    janela = int(TAXA * 0.01)
    n = amostras.size // janela
    if n == 0:
        return None
    energia = (amostras[: n * janela].reshape(n, janela) ** 2).mean(axis=1)
    pico = (int(energia.argmax()) + 0.5) * janela / TAXA
    return amostras, round(pico, 3)


def gravar_wav(caminho, amostras):
    pcm = (np.clip(amostras, -1, 1) * 32767).astype('<i2')
    with wave.open(caminho, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(pcm.tobytes())


def guardar(cat, nome, amostras, pico, info, destino=None):
    os.makedirs(PASTA_SFX, exist_ok=True)
    destino = destino or os.path.join(PASTA_SFX, f'{nome}-{len(cat["variacoes"]) + 1}.wav')
    gravar_wav(destino, amostras)
    v = {'arquivo': os.path.basename(destino), 'pico': pico, 'duracao': round(amostras.size / TAXA, 3), **info}
    print(f'  {v["arquivo"]}: "{v["titulo"]}" ({v["duracao"]} s, pico em {pico} s)')
    return v


# ---------- Openverse ----------
_ultima = [0.0]


def buscar(q, pagina=1):
    espera = 3.2 - (time.time() - _ultima[0])  # limite de 20 buscas por minuto
    if espera > 0:
        time.sleep(espera)
    _ultima[0] = time.time()
    url = API + '?' + urllib.parse.urlencode({'q': q, 'license': 'cc0', 'page_size': 20, 'page': pagina})
    req = urllib.request.Request(url, headers=AGENTE)
    for tentativa in range(4):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                dados = json.load(r)
            return dados.get('results', [])
        except (TimeoutError, OSError) as e:
            # 504 e falta de resposta acontecem no Openverse; 401 e 429 não adianta repetir
            if (isinstance(e, urllib.error.HTTPError) and e.code not in (500, 502, 503, 504)) or tentativa == 3:
                raise
            print(f'  busca "{q}" sem resposta, tentando de novo', file=sys.stderr)
            time.sleep(15)


def candidatos(q, maximo, usados):
    for pagina in (1, 2, 3):
        for r in buscar(q, pagina):
            dur = (r.get('duration') or 0) / 1000
            titulo = (r.get('title') or '').lower()
            if r.get('license') != 'cc0' or not r.get('url') or r['id'] in usados:
                continue
            if not (0.04 <= dur <= maximo * 2.5) or any(p in titulo for p in EVITAR):
                continue
            yield r


def baixar_openverse(r, maximo):
    with tempfile.TemporaryDirectory() as tmp:
        bruto = os.path.join(tmp, 'bruto.' + (r.get('filetype') or 'mp3'))
        req = urllib.request.Request(r['url'], headers=AGENTE)
        with urllib.request.urlopen(req, timeout=60) as resp, open(bruto, 'wb') as f:
            f.write(resp.read())
        try:
            return processar(decodificar(bruto), maximo)
        except subprocess.CalledProcessError:
            return None


def info_openverse(r):
    return {'titulo': r.get('title'), 'autor': r.get('creator'), 'pagina': r.get('foreign_landing_url'), 'licenca': 'CC0', 'id': r['id']}


def montar_openverse(banco, nome, busca, maximo, volume, variacoes=3):
    cat = banco.get(nome) or {'busca': busca, 'max': maximo, 'volume': volume, 'variacoes': [], 'descartados': []}
    usados = set(cat.get('descartados', [])) | {v['id'] for v in cat['variacoes']}
    alvo = len(cat['variacoes']) + variacoes
    for r in candidatos(busca, maximo, usados):
        if len(cat['variacoes']) >= alvo:
            break
        try:
            res = baixar_openverse(r, maximo)
        except Exception as e:  # download quebrado não pode parar o banco
            print(f'  {nome}: falhou "{r.get("title")}" ({e})', file=sys.stderr)
            continue
        if res:
            cat['variacoes'].append(guardar(cat, nome, *res, info_openverse(r)))
    cat.setdefault('busca', busca)
    banco[nome] = cat


def cmd_banco(a):
    banco = carregar()
    falhas = []
    for nome in (a.categorias.split(',') if a.categorias else list(CATALOGO)):
        if nome not in CATALOGO:
            sys.exit(f'Categoria desconhecida: {nome}. Use "adicionar" para criar uma nova.')
        # ids do Openverse não têm ':'; os importados (Kenney, arquivos locais) têm 'fonte:arquivo'
        if any(':' not in v['id'] for v in banco.get(nome, {}).get('variacoes', [])) and not a.refazer:
            print(f'  {nome}: já está no banco (use --refazer)')
            continue
        busca, maximo, volume = CATALOGO[nome]
        try:
            montar_openverse(banco, nome, busca, maximo, volume)
        except OSError as e:
            falhas.append(nome)
            print(f'  {nome}: o Openverse não respondeu ({e})', file=sys.stderr)
            continue
        salvar(banco)
    if falhas:
        sys.exit(f'Sem resposta do Openverse para: {", ".join(falhas)}. Rode de novo mais tarde; o que já baixou fica salvo.')


def cmd_adicionar(a):
    banco = carregar()
    montar_openverse(banco, a.categoria, a.busca, a.max, a.volume)
    salvar(banco)


def cmd_trocar(a):
    banco = carregar()
    cat = banco.get(a.categoria) or sys.exit(f'A categoria {a.categoria} não está no banco')
    i = a.n - 1
    if not 0 <= i < len(cat['variacoes']):
        sys.exit(f'{a.categoria} tem {len(cat["variacoes"])} variações')
    if not cat.get('busca'):
        sys.exit(f'{a.categoria} veio de um pacote baixado. Importe outro arquivo com "importar".')
    velho = cat['variacoes'][i]
    cat['descartados'] = cat.get('descartados', []) + [velho['id']]
    usados = set(cat['descartados']) | {v['id'] for v in cat['variacoes']}
    for r in candidatos(cat['busca'], cat['max'], usados):
        res = baixar_openverse(r, cat['max'])
        if res:
            cat['variacoes'][i] = guardar(cat, a.categoria, *res, info_openverse(r), destino=os.path.join(PASTA_SFX, velho['arquivo']))
            break
    salvar(banco)


# ---------- arquivos locais e Kenney ----------
def importar(banco, nome, arquivos, fonte, pagina, maximo, volume):
    cat = banco.get(nome) or {'busca': None, 'max': maximo, 'volume': volume, 'variacoes': [], 'descartados': []}
    for arq in arquivos:
        ident = f'{fonte}:{os.path.basename(arq)}'
        if any(v['id'] == ident for v in cat['variacoes']):
            continue
        res = processar(decodificar(arq), cat.get('max') or maximo)
        if not res:
            print(f'  {nome}: "{os.path.basename(arq)}" sem som aproveitável', file=sys.stderr)
            continue
        titulo = os.path.splitext(os.path.basename(arq))[0]
        cat['variacoes'].append(guardar(cat, nome, *res, {'titulo': titulo, 'autor': fonte, 'pagina': pagina, 'licenca': 'CC0', 'id': ident}))
    if cat['variacoes']:
        banco[nome] = cat


def cmd_importar(a):
    banco = carregar()
    importar(banco, a.categoria, a.arquivos, a.fonte, a.pagina, a.max, a.volume)
    salvar(banco)


def baixar_kenney(pacote, destino):
    """O site da Kenney gera um link assinado na hora: kenney.nl/download-link/<"assets/<pacote>" em hexadecimal>."""
    pagina = f'https://kenney.nl/assets/{pacote}'
    ident = f'assets/{pacote}'.encode().hex()
    req = urllib.request.Request(f'https://kenney.nl/download-link/{ident}', headers={**AGENTE, 'Referer': pagina})
    with urllib.request.urlopen(req, timeout=30) as r:
        url = json.load(r).get('url')
    if not url:
        raise RuntimeError(f'o site não devolveu o link de {pacote}')
    zip_ = os.path.join(destino, f'{pacote}.zip')
    with urllib.request.urlopen(urllib.request.Request(url, headers=AGENTE), timeout=180) as r, open(zip_, 'wb') as f:
        f.write(r.read())
    pasta = os.path.join(destino, pacote)
    with zipfile.ZipFile(zip_) as z:
        z.extractall(pasta)
    return pasta


def cmd_kenney(_):
    banco = carregar()
    with tempfile.TemporaryDirectory() as tmp:
        for pacote, cats in KENNEY.items():
            try:
                pasta = baixar_kenney(pacote, tmp)
            except Exception as e:
                print(f'  {pacote}: não consegui baixar ({e}). Baixe à mão em https://kenney.nl/assets/{pacote} e use "importar".', file=sys.stderr)
                continue
            achados = {os.path.splitext(f)[0]: os.path.join(r, f) for r, _, fs in os.walk(pasta) for f in fs if f.endswith('.ogg')}
            for nome, (volume, maximo, lista) in cats.items():
                arquivos = [achados[n] for n in lista if n in achados]
                importar(banco, nome, arquivos, f'Kenney {pacote}', f'https://kenney.nl/assets/{pacote}', maximo, volume)
            salvar(banco)


def cmd_listar(_):
    banco = carregar()
    if not banco:
        print('Banco vazio. Rode "sons.py kenney" e "sons.py banco".')
    for nome, cat in sorted(banco.items()):
        print(f'{nome} (volume {cat["volume"]}, {len(cat["variacoes"])} variações)')
        for v in cat['variacoes']:
            print(f'  {v["arquivo"]}: {v["duracao"]} s, pico {v["pico"]} s · "{v["titulo"]}" ({v["autor"]})')


# ---------- uso ----------
def escolher(banco, sons):
    """Resolve cada {em, som, volume?, variacao?} para (instante, variação, volume). Sem `variacao`, alterna as variações."""
    conta = {}
    saida = []
    for s in sons:
        cat = banco.get(s['som']) or sys.exit(f'O som "{s["som"]}" não está no banco. Categorias: {", ".join(sorted(banco))}')
        n = conta.get(s['som'], 0)
        conta[s['som']] = n + 1
        vs = cat['variacoes']
        v = vs[s['variacao'] - 1] if s.get('variacao') else vs[n % len(vs)]
        saida.append((float(s['em']), v, s.get('volume', cat['volume'])))
    return saida


def cmd_mixar(a):
    """Soma os efeitos à trilha de áudio do vídeo (ou cria uma, se o vídeo for mudo), com o pico no instante pedido."""
    banco = carregar()
    sons = escolher(banco, json.load(open(a.sons)))
    taxa = 48000
    try:
        audio = decodificar(a.entrada, taxa, 2).reshape(-1, 2)
    except subprocess.CalledProcessError:
        audio = np.zeros((0, 2), dtype=np.float32)
    if audio.size == 0:  # vídeo sem áudio: silêncio do tamanho do vídeo
        info = subprocess.run([FFMPEG, '-i', a.entrada], capture_output=True, text=True).stderr
        h, m, s = info.split('Duration: ')[1].split(',')[0].split(':')
        audio = np.zeros((int((int(h) * 3600 + int(m) * 60 + float(s)) * taxa), 2), dtype=np.float32)
    for em, v, vol in sons:
        efeito = decodificar(os.path.join(PASTA_SFX, v['arquivo']), taxa, 1) * vol * a.volume
        ini = int(round((em - v['pico']) * taxa))
        if ini < 0:
            efeito = efeito[-ini:]
            ini = 0
        fim = min(len(audio), ini + len(efeito))
        if fim > ini:
            audio[ini:fim] += efeito[: fim - ini, None]
        print(f'  {v["arquivo"]} com pico em {em:.2f} s')
    topo = float(np.abs(audio).max()) if audio.size else 0
    if topo > 0.98:
        print(f'  aviso: o áudio passou do limite ({topo:.2f}); baixe o --volume ou o volume de algum som', file=sys.stderr)
    with tempfile.TemporaryDirectory() as tmp:
        bruto = os.path.join(tmp, 'audio.f32')
        np.clip(audio, -1, 1).astype('<f4').tofile(bruto)
        entrada_audio = ['-f', 'f32le', '-ar', str(taxa), '-ac', '2', '-i', bruto]
        if a.saida.lower().endswith(('.wav', '.mp3', '.m4a')):
            cmd = [FFMPEG, '-loglevel', 'error', '-y', *entrada_audio, a.saida]
        else:
            cmd = [FFMPEG, '-loglevel', 'error', '-y', '-i', a.entrada, *entrada_audio, '-map', '0:v:0', '-map', '1:a:0',
                   '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', a.saida]
        subprocess.run(cmd, check=True)
    print(f'Pronto: {a.saida}')


def cmd_remotion(a):
    """Copia o banco para public/sfx, o índice para src/sons/banco.json e o componente para src/TrilhaSons.tsx."""
    proj = os.path.abspath(a.projeto)
    if not os.path.exists(os.path.join(proj, 'package.json')):
        sys.exit(f'{proj} não parece um projeto Remotion (falta package.json)')
    shutil.copytree(PASTA_SFX, os.path.join(proj, 'public', 'sfx'), dirs_exist_ok=True)
    os.makedirs(os.path.join(proj, 'src', 'sons'), exist_ok=True)
    shutil.copy(BANCO, os.path.join(proj, 'src', 'sons', 'banco.json'))
    comp = os.path.join(proj, 'src', 'TrilhaSons.tsx')
    if os.path.exists(comp) and not a.forcar:
        print(f'  {comp} já existe (use --forcar para substituir)')
    else:
        shutil.copy(os.path.join(SKILL, 'remotion', 'TrilhaSons.tsx'), comp)
    print(f'Banco copiado para {proj}/public/sfx e src/sons/banco.json; componente em src/TrilhaSons.tsx')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest='cmd', required=True)
    sub.add_parser('kenney').set_defaults(f=cmd_kenney)
    b = sub.add_parser('banco')
    b.add_argument('--categorias')
    b.add_argument('--refazer', action='store_true')
    b.set_defaults(f=cmd_banco)
    ad = sub.add_parser('adicionar')
    ad.add_argument('categoria')
    ad.add_argument('busca')
    ad.add_argument('--max', type=float, default=1.5)
    ad.add_argument('--volume', type=float, default=0.4)
    ad.set_defaults(f=cmd_adicionar)
    im = sub.add_parser('importar')
    im.add_argument('categoria')
    im.add_argument('arquivos', nargs='+')
    im.add_argument('--fonte', required=True)
    im.add_argument('--pagina')
    im.add_argument('--max', type=float, default=1.5)
    im.add_argument('--volume', type=float, default=0.4)
    im.set_defaults(f=cmd_importar)
    t = sub.add_parser('trocar')
    t.add_argument('categoria')
    t.add_argument('n', type=int)
    t.set_defaults(f=cmd_trocar)
    sub.add_parser('listar').set_defaults(f=cmd_listar)
    r = sub.add_parser('remotion')
    r.add_argument('projeto')
    r.add_argument('--forcar', action='store_true')
    r.set_defaults(f=cmd_remotion)
    m = sub.add_parser('mixar')
    m.add_argument('entrada')
    m.add_argument('sons')
    m.add_argument('saida')
    m.add_argument('--volume', type=float, default=1.0, help='multiplica o volume de todos os efeitos')
    m.set_defaults(f=cmd_mixar)
    a = p.parse_args()
    a.f(a)


if __name__ == '__main__':
    main()
