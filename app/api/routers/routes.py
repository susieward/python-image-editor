from fastapi import APIRouter, Request, Response, HTTPException, Body, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse
from wand.image import COMPOSITE_OPERATORS

from app.services.composite import CompositeService
from app.api.dependencies import composite_service_dependency
from app.models.response import RemoveVM, CompositeVM

templates = Jinja2Templates(directory = "app/templates")
router = APIRouter()

@router.get('/clear')
async def clear(composite_service: CompositeService = Depends(composite_service_dependency)):
    composite_service.reset()
    return Response(content = 'Cleared')

@router.post('/remove')
async def remove(
    remove_vm: RemoveVM = Body(...),
    composite_service: CompositeService = Depends(composite_service_dependency)
):
    index = remove_vm.index
    length = composite_service.remove_img(index)
    content = f"Removed index {index}. New length is {length}"
    return Response(content = content)

@router.post('/base')
async def set_base_img(
    request: Request,
    composite_service: CompositeService = Depends(composite_service_dependency)
):
    blob = await request.body()
    composite_service.set_base(blob)
    return Response(content = 'Uploaded base img')

@router.post('/add')
async def add_comp_img(
    request: Request,
    composite_service: CompositeService = Depends(composite_service_dependency)
):
    blob = await request.body()
    composite_service.add_img(blob)
    return Response(content = 'Added comp img')

@router.post('/composite')
async def composite(
    composite_vm: CompositeVM = Body(...),
    composite_service: CompositeService = Depends(composite_service_dependency)
):
    result = await composite_service.create_composite(ops=composite_vm.ops)
    return Response(content=result, headers = { "Content-Encoding": "gzip" })

@router.get("/")
async def index(request: Request, composite_service: CompositeService = Depends(composite_service_dependency)):
    composite_service.reset()
    return templates.TemplateResponse('index.html', { 'operators': COMPOSITE_OPERATORS, 'request': request })
