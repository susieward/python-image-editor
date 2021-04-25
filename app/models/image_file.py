from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Sequence, Any, Dict

class BaseImageFile(BaseModel):
    mimetype: Optional[str] = Field(None, title='optional mimetype')
    data: bytes = Field(..., title='file data')

class ImageFileCreate(BaseImageFile):
    pass

class ImageFileUpdate(BaseImageFile):
    pass

class ImageFile(BaseImageFile):
    id: UUID = Field(..., title='image file id')
