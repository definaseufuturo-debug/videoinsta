"""Sons de cena GRAVADOS (banco CC0 em sfx-skill/banco) para usar dentro do audio.py das produções.

Troque os sons sintetizados (senoides) por gravações reais:

    import sys; sys.path.insert(0, "../../pipeline")
    from sfx import Banco
    B = Banco(SR, semente=doc.get("seed", 7))      # SR do audio.py (48000)
    B.put(put, "porta", t0)                        # o PICO do som cai exatamente em t0
    B.put(put, "passos", t0, g=0.8, pan=-0.3)
    B.cama(put, "amb_chuva", 0, DUR, g=0.6)        # ambiente de fundo em loop, com fade
    B.categorias()                                 # o que existe no banco

`put` é a função do audio.py: put(x, t0, g=1.0, pan=0.0). Cada chamada sorteia uma variação diferente da anterior,
então o mesmo evento não soa idêntico duas vezes. O volume padrão de cada categoria vem do banco ('volume')."""
import json, os, random, wave
import numpy as np

PASTA = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sfx-skill", "banco"))


class Banco:
    def __init__(self, sr=48000, semente=None):
        self.sr = sr
        self.rng = random.Random(semente)
        with open(os.path.join(PASTA, "banco.json")) as f:
            self.banco = json.load(f)
        self._cache, self._ultima = {}, {}

    def categorias(self):
        return sorted(k for k, v in self.banco.items() if v.get("variacoes"))

    def _ler(self, arq):
        if arq not in self._cache:
            with wave.open(os.path.join(PASTA, "sfx", arq)) as w:
                sr0, n = w.getframerate(), w.getnframes()
                x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float64) / 32768
                if w.getnchannels() > 1:
                    x = x.reshape(-1, w.getnchannels()).mean(1)
            if sr0 != self.sr:
                x = np.interp(np.arange(0, len(x), sr0 / self.sr), np.arange(len(x)), x)
            self._cache[arq] = x
        return self._cache[arq]

    def som(self, nome, variacao=None):
        """(amostras mono, instante do pico em s, volume padrão). Sorteia sem repetir a última variação."""
        cat = self.banco.get(nome)
        if not cat or not cat.get("variacoes"):
            raise KeyError(f'som "{nome}" não está no banco. Existem: {", ".join(self.categorias())}')
        vs = cat["variacoes"]
        if variacao:
            v = vs[variacao - 1]
        else:
            opcoes = [v for v in vs if v["arquivo"] != self._ultima.get(nome)] or vs
            v = self.rng.choice(opcoes)
        self._ultima[nome] = v["arquivo"]
        return self._ler(v["arquivo"]), v["pico"], cat.get("volume", 0.5)

    def put(self, put, nome, t, g=1.0, pan=0.0, variacao=None):
        x, pico, vol = self.som(nome, variacao)
        t0 = t - pico
        if t0 < 0:
            x, t0 = x[int(-t0 * self.sr):], 0.0
        put(x, t0, g * vol, pan)

    def cama(self, put, nome, t0, t1, g=1.0, fade=1.5, pan=0.0):
        """Ambiente contínuo de t0 a t1: emenda variações com crossfade de 0,5 s e fade no começo e no fim."""
        n = int((t1 - t0) * self.sr)
        if n <= 0:
            return
        out, xf, i = np.zeros(n), int(0.5 * self.sr), 0
        vol = self.banco[nome].get("volume", 0.25)
        while i < n:
            x, _, _ = self.som(nome)
            x = x[: n - i + xf].copy()
            k = min(xf, len(x) // 3)
            if k:
                x[:k] *= np.linspace(0, 1, k)
                x[-k:] *= np.linspace(1, 0, k)
            out[i: i + len(x)] += x[: n - i]
            i += max(1, len(x) - k)
        f = min(int(fade * self.sr), n // 2)
        if f:
            out[:f] *= np.linspace(0, 1, f)
            out[-f:] *= np.linspace(1, 0, f)
        put(out, t0, g * vol, pan)
