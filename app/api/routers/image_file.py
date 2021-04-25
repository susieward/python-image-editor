from typing import Sequence, Optional, Dict, Any
from uuid import UUID
import json

from fastapi import APIRouter, Path, Body, Depends, HTTPException, Request, Response, File, UploadFile, Form
from starlette import status

from app.api.dependencies import image_file_service_dep
from app.services.image_file import ImageFileService
from app.models.image_file import ImageFile, ImageFileCreate, ImageFileUpdate

from app.models.response import AddResponse, UpdateResponse, DeleteResponse, HealthcheckResponse

router = APIRouter()

@router.get('/file/init', response_model=HealthcheckResponse, tags=['gallery'])
async def init_files(image_file_service: ImageFileService = Depends(image_file_service_dep)):
    return await image_file_service.create_table()

@router.get('/files', tags=['gallery'])
async def get_files(image_file_service: ImageFileService = Depends(image_file_service_dep)):
    return await image_file_service.get_list()

@router.get('/file/{id}', tags=['gallery'])
async def get_file(
    image_file_service: ImageFileService = Depends(image_file_service_dep),
    id: UUID = Path(...)
):
    image_file = await image_file_service.get(id=id)
    if not image_file:
        raise HTTPException(status_code=404, detail='Item not found')
    return Response(content = image_file, headers = { "Content-Encoding": "gzip" })

@router.post('/file', response_model=AddResponse, tags=['gallery'])
async def create_file(
    request: Request,
    image_file_service: ImageFileService = Depends(image_file_service_dep)):
    contents = await request.body()

    image_file = ImageFileCreate(data=contents)
    id = await image_file_service.create(schema=image_file)
    return AddResponse(id=id)


@router.put('/file/{id}', response_model=UpdateResponse, tags=['gallery'])
async def update_image(
    image_file_service: ImageFileService = Depends(image_file_service_dep),
    id: UUID = Path(...),
    schema: ImageFileUpdate = Body(...)
):
    image_file = await image_file_service.get(id=id)
    if not image_file:
        raise HTTPException(status_code=404, detail='Item not found')
    updated = await image_file_service.update(id=id, schema=schema)
    return UpdateResponse(updated=updated)


@router.delete('/file/{id}', response_model=DeleteResponse, tags=['gallery'])
async def delete_image(
    image_file_service: ImageFileService = Depends(image_file_service_dep),
    id: UUID = Path(...)
):
    image_file = await image_file_service.get(id=id)
    if not image_file:
        raise HTTPException(status_code=404, detail='Item not found')
    deleted = await image_file_service.delete(id=id)
    return DeleteResponse(deleted=deleted)
