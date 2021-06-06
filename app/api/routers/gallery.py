from typing import Sequence, Optional, Dict, Any
from uuid import UUID
import json

from fastapi import APIRouter, Path, Body, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.templating import Jinja2Templates
from starlette import status

from app.api.dependencies import image_service_dep, image_file_service_dep
from app.services.image import ImageService
from app.services.image_file import ImageFileService
from app.models.image import Image, ImageAddVM, ImageUpdateVM

from app.models.response import AddResponse, UpdateResponse, DeleteResponse, HealthcheckResponse

templates = Jinja2Templates(directory = "app/templates")
router = APIRouter()

@router.get("/")
async def gallery_index(request: Request):
    return templates.TemplateResponse('gallery.html', { 'request': request })

@router.get('/init', response_model=HealthcheckResponse, tags=['gallery'])
async def init(image_service: ImageService = Depends(image_service_dep)):
    return await image_service.create_table()

@router.get('/image-stream', tags=['gallery'])
async def get_image_stream(image_service: ImageService = Depends(image_service_dep), file_service: ImageFileService = Depends(image_file_service_dep)):
    try:
        async def generate():
            results = image_service.get_stream(file_service=file_service)
            async for result in results:
                #print(len(result))
                yield result
        return StreamingResponse(generate(), headers = { 'Content-Encoding': 'gzip'})
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.get('/images', tags=['gallery'])
async def get_images(image_service: ImageService = Depends(image_service_dep), file_service: ImageFileService = Depends(image_file_service_dep)):
    try:
        return await image_service.get_list()
    except Exception as e:
        print(e)
        msg = f"{e}"
        raise HTTPException(status_code=500, detail = msg)

@router.get('/image/{id}', response_model=Image, tags=['gallery'])
async def get_image(
    image_service: ImageService = Depends(image_service_dep),
    id: UUID = Path(...)
):
    image = await image_service.get(id=id)
    if not image:
        raise HTTPException(status_code=404, detail='Item not found')
    return image

@router.post('/image', response_model=AddResponse, status_code=status.HTTP_201_CREATED, tags=['gallery'])
async def create_image(
    image_service: ImageService = Depends(image_service_dep),
    schema: ImageAddVM = Body(...)
):
    id = await image_service.create(schema=schema)
    return AddResponse(id=id)


@router.put('/image/{id}', response_model=UpdateResponse, tags=['gallery'])
async def update_image(
    image_service: ImageService = Depends(image_service_dep),
    id: UUID = Path(...),
    schema: ImageUpdateVM = Body(...)
):
    image = await image_service.get(id=id)
    if not image:
        raise HTTPException(status_code=404, detail='Item not found')
    updated = await image_service.update(id=id, schema=schema)
    return UpdateResponse(updated=updated)


@router.delete('/image/{id}', response_model=DeleteResponse, tags=['gallery'])
async def delete_image(
    image_service: ImageService = Depends(image_service_dep),
    id: UUID = Path(...)
):
    image = await image_service.get(id=id)
    if not image:
        raise HTTPException(status_code=404, detail='Item not found')
    deleted = await image_service.delete(id=id)
    return DeleteResponse(deleted=deleted)
