from PIL import Image, ImageDraw, ImageFont, ImageFilter
F="/home/claude/videoinsta/pipeline/template_cristao/assets/fonts/"
W,H=1280,720; im=Image.new("RGB",(W,H),(11,11,14)); d=ImageDraw.Draw(im)
g=Image.new("L",(W,H),0); ImageDraw.Draw(g).ellipse((500,-200,1500,900),fill=90); g=g.filter(ImageFilter.GaussianBlur(160)); im=Image.composite(Image.new("RGB",(W,H),(70,20,24)),im,g); d=ImageDraw.Draw(im)
fr=["build/th_b.png","build/th_a.png","build/th_c.png"]
pos=[(680,90,-6),(870,50,0),(1050,90,6)]
for (x,y,r),p in zip(pos,fr):
    t=Image.open(p).convert("RGB").resize((224,398)); b=Image.new("RGB",(236,410),(245,241,234)); b.paste(t,(6,6)); m=Image.new("L",b.size,255); b=b.rotate(r,expand=True,resample=Image.BICUBIC); m=m.rotate(r,expand=True,resample=Image.BICUBIC); im.paste(b,(x-b.size[0]//2+125,y),m)
def T(txt,xy,sz,col,w="Black",st=10):
    f=ImageFont.truetype(F+f"Inter-{w}.otf",sz); d.text(xy,txt,font=f,fill=col,stroke_width=st,stroke_fill=(0,0,0))
T("ELE NÃO",(50,170),112,(245,241,234)); T("ESQUECE.",(50,300),118,(224,38,43))
T("O QUE VOCÊ DISSE",(56,480),48,(245,241,234),"ExtraBold",6)
d.rounded_rectangle((50,570,470,640),radius=12,fill=(224,38,43)); T("16 HISTÓRIAS",(78,582),44,(255,255,255),"Black",0)
im.save("build/capa.jpg",quality=92)
