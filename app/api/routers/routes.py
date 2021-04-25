from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.templating import Jinja2Templates
from wand.image import COMPOSITE_OPERATORS
from app.services.composite import CompositeService

templates = Jinja2Templates(directory = "app/templates")

router = APIRouter()
composite_service = CompositeService()

@router.get('/clear')
async def clear(request: Request):
    composite_service.reset()
    return Response(content = 'Cleared')

@router.post('/remove')
async def remove(request: Request):
    try:
        data = await request.json()
        index = int(data.get('index'))
        length = composite_service.remove_img(index)
        content = f"Removed index {index}. New length is {length}"
        return Response(content = content)
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.post('/base')
async def base(request: Request):
    try:
        blob = await request.body()
        composite_service.set_base(blob)
        return Response(content = 'Uploaded base img')
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.post('/comp')
async def comp(request: Request):
    try:
        blob = await request.body()
        composite_service.add_img(blob)
        return Response(content = 'Added comp img')
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.post('/composite')
async def composite(request: Request):
    try:
        ops = await request.json()
        composite_service.set_ops(ops)
        result = await composite_service.create_composite()
        return Response(content = result, headers = { "Content-Encoding": "gzip" })
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.get("/")
async def index(request: Request):
    composite_service.reset()
    return templates.TemplateResponse('index.html', { 'operators': COMPOSITE_OPERATORS, 'request': request })
