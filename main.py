from wand.image import COMPOSITE_OPERATORS
from editor import composite_img
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.mount("/static", StaticFiles(directory = "static"), name = "static")
templates = Jinja2Templates(directory = "templates")

class CompositeState:
    def __init__(self):
        self.base_img = None
        self.comp_imgs = []
        self.ops = []

    def reset(self):
        self.base_img = None
        self.comp_imgs = []
        self.ops = []
        return self

    def set_base(self, img):
        self.base_img = img
        return self

    def add_comp(self, img):
        self.comp_imgs.append(img)
        return self

    def set_ops(self, ops):
        self.ops = ops
        return self

    async def create_composite(self):
        result = await composite_img(self.base_img, self.comp_imgs, self.ops)
        return result

state = CompositeState()

@app.get('/clear')
async def clear(request: Request):
    state.reset()
    print(state.base_img, state.comp_imgs, state.ops)
    return Response(content = 'Cleared')

@app.post('/base')
async def base(request: Request):
    #global base_img
    blob = await request.body()
    state.set_base(blob)
    return Response(content = 'Uploaded base img')

@app.post('/comp')
async def comp(request: Request):
    blob = await request.body()
    state.add_comp(blob)
    return Response(content = 'Added comp img')

@app.post('/composite')
async def composite(request: Request):
    ops = await request.json()
    state.set_ops(ops)
    result = await state.create_composite()

    if result:
        return Response(content = result, headers = { "Content-Encoding": "gzip" })
    else:
        print(result)
        raise HTTPException(status_code=500)

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse('index.html', { 'operators': COMPOSITE_OPERATORS, 'request': request })
