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

imgs = { "base_img": None, "top_imgs": [] }
ops = []

@app.get('/clear')
async def clear(request: Request):
    global imgs
    imgs['base_img'] = None
    imgs['top_imgs'] = []
    return Response(content = 'Cleared')

@app.post('/upload/{key}')
async def get_blob(request: Request, key):
    global imgs
    global ops
    blob = await request.body()
    if key == 'top_imgs':
       imgs[f'{key}'].append(blob)
    else:
        imgs[f'{key}'] = blob
    return Response(content = f'Uploaded key: {key}, top_imgs length: {len(imgs["top_imgs"])}, ops length: {len(ops)}')

@app.get('/remove/{index}')
async def remove(request: Request, index):
    global imgs
    global ops
    i = int(index)
    img = imgs['top_imgs'][i]
    imgs['top_imgs'].remove(img)

    if len(ops) > 0:
        op = ops[i]
        if op in ops:
            ops.remove(op)
            return Response(content = 'Removed')
        else:
            raise HTTPException(status_code=404, detail="Index not found")
    else:
        raise HTTPException(status_code=500, detail="ops length = 0")

@app.post('/composite')
async def composite(request: Request):
    global ops
    global imgs
    ops = await request.json()

    if imgs['base_img'] is not None and len(imgs['top_imgs']) == len(ops):
        base_img = imgs['base_img']
        top_imgs = imgs['top_imgs']
        result = composite_img(base_img, top_imgs, ops)
        return Response(content = result, headers = { "Content-Encoding": "gzip" })
    else:
        raise HTTPException(status_code=500, detail= f"Top images length: {len(imgs['top_imgs'])}, ops = {ops}")

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse('index.html', { 'operators': COMPOSITE_OPERATORS, 'request': request })
