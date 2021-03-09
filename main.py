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
        print(self.base_img, self.comp_imgs, self.ops)

    def set_base(self, img):
        self.base_img = img

    def add_img(self, img):
        self.comp_imgs.append(img)

    def remove_img(self, index):
        img = self.comp_imgs[index]
        self.comp_imgs.remove(img)
        return len(self.comp_imgs)

    def set_ops(self, ops):
        self.ops = ops

    async def create_composite(self):
        try:
            result = await composite_img(self.base_img, self.comp_imgs, self.ops)
            return result
        except Exception as e:
            raise e

state = CompositeState()

@app.get('/clear')
async def clear(request: Request):
    state.reset()
    return Response(content = 'Cleared')

@app.post('/remove')
async def remove(request: Request):
    try:
        data = await request.json()
        index = int(data.get('index'))
        length = state.remove_img(index)
        content = f"Removed index {index}. New length is {length}"
        return Response(content = content)
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@app.post('/base')
async def base(request: Request):
    try:
        blob = await request.body()
        state.set_base(blob)
        return Response(content = 'Uploaded base img')
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@app.post('/comp')
async def comp(request: Request):
    try:
        blob = await request.body()
        state.add_img(blob)
        return Response(content = 'Added comp img')
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@app.post('/composite')
async def composite(request: Request):
    try:
        ops = await request.json()
        state.set_ops(ops)
        result = await state.create_composite()
        return Response(content = result, headers = { "Content-Encoding": "gzip" })
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@app.get("/")
async def index(request: Request):
    state.reset()
    return templates.TemplateResponse('index.html', { 'operators': COMPOSITE_OPERATORS, 'request': request })
