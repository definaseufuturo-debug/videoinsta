import numpy as np, wave
from scipy.signal import butter, lfilter
sr=44100; D=30; n=sr*D; t=np.arange(n)/sr; out=np.zeros(n); rs=np.random.default_rng(3)
def lp(x,f,o=2): b,a=butter(o,f/(sr/2)); return lfilter(b,a,x)
def hp(x,f): b,a=butter(2,f/(sr/2),'high'); return lfilter(b,a,x)
def note(f,t0,dur,g=0.3):
    i=int(t0*sr); L=int(dur*sr); L=min(L,n-i)
    if L<=0: return
    tt=np.arange(L)/sr; env=np.exp(-tt*2.2)*np.minimum(1,tt/0.005)
    s=sum(np.sin(2*np.pi*f*k*tt)/k**1.6 for k in range(1,6))
    out[i:i+L]+=g*s*env
A3,C4,E4,F3,A4,G3,B3,D4,C5,E5,G4,F4=220,261.6,329.6,174.6,440,196,246.9,293.7,523.3,659.3,392,349.2
# piano: Am - F - C - G, arpejos lentos (70 bpm, 1 acorde a cada ~3.4 s)
prog=[(A3,C4,E4,A4),(F3,A3,C4,F4),(C4/2*2*0.5*2,E4,G4,C5),(G3,B3,D4,G4)]
bar=60/70*4
k=0; t0=0.3
while t0<D-1:
    ch=prog[k%4]
    for j,f in enumerate(ch): note(f,t0+j*bar/4,3.5,0.12+0.03*(t0>12))
    note(ch[0]/2,t0,4.5,0.16)
    t0+=bar; k+=1
# cordas (pad) crescendo de 12 s até 28 s
pad=np.zeros(n)
for f in [110,220,261.6,329.6,440]:
    pad+=np.sin(2*np.pi*f*t+np.sin(2*np.pi*5*t)*0.002*f)+0.5*np.sin(2*np.pi*f*1.003*t)
pad=lp(pad,1200,2)*np.clip((t-11)/17,0,1)**1.5*0.05
out+=pad
# passos da multidão (0-19 s), som abafado e ritmado
for k2 in np.arange(0.2,19,0.16):
    i=int(k2*sr); L=int(0.06*sr); tt=np.arange(L)/sr
    out[i:i+L]+= 0.05*lp(rs.normal(0,1,L),400)*np.exp(-tt*60)*(1-np.clip((k2-15)/4,0,1))
# vento na subida (19-26 s)
w=lp(rs.normal(0,1,n),900)*np.clip((t-19)/1.5,0,1)*np.clip((26.5-t)/1.5,0,1)*0.12
out+=w
# brilho final + corte
sw=np.clip((t-25.5)/3.5,0,1)**2*np.clip((29.6-t)/0.2,0,1)
out+=0.06*sw*(np.sin(2*np.pi*880*t)+np.sin(2*np.pi*1318.5*t)+np.sin(2*np.pi*1046.5*t))
out*=np.clip((29.9-t)/0.4,0,1)
out=np.tanh(out*1.6); out/=np.max(np.abs(out))*1.1
st=np.stack([out,np.roll(out,12)],1)
with wave.open('audio.wav','wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(sr); f.writeframes((st*32767).astype(np.int16).tobytes())
print('ok')
