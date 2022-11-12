from databases import Database
from fastapi import Depends, Request

from app.models.image import Image
from app.services.image import ImageService
from app.models.image_file import ImageFile
from app.services.image_file import ImageFileService
from app.services.composite import CompositeService

def get_db(request: Request) -> Database:
    return request.app.state.database

def image_service_dep(db: Database = Depends(get_db)) -> ImageService:
    return ImageService(Image, db=db, table='images')

def image_file_service_dep(db: Database = Depends(get_db)) -> ImageFileService:
    return ImageFileService(ImageFile, db=db, table='image_file')

def composite_service_dependency(request: Request) -> CompositeService:
    return request.app.state.composite_service
