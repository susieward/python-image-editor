from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Sequence, Any, Dict

class BaseImage(BaseModel):
    name: str = Field(..., title='image title')
    description: Optional[str] = Field(None, title='optional description')
    file_id: UUID = Field(..., title='image file id')

class ImageAddVM(BaseImage):
    pass

class ImageUpdateVM(BaseImage):
    pass

class Image(BaseImage):
    id: UUID = Field(..., title='image id')
