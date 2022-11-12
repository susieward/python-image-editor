from uuid import UUID
from pydantic import BaseModel, Field
from typing import Sequence


class RemoveVM(BaseModel):
    index: int = Field(...)

class CompositeVM(BaseModel):
    ops: Sequence[str] = Field(...)



class HealthcheckResponse(BaseModel):
    status: str = Field('available', title='health check status')

    class Config:
        schema_extra = {
            'example': {
                'status': 'available',
            }
        }


class AddResponse(BaseModel):
    id: UUID = Field(..., title='unique id')

    class Config:
        schema_extra = {
            'example': {
                'id': '123ebf7a-0ced-4b46-a7a9-0d153e9d9413',
            }
        }


class UpdateResponse(BaseModel):
    updated: int = Field(..., title='number updated')

    class Config:
        schema_extra = {
            'example': {
                'updated': 1,
            }
        }


class DeleteResponse(BaseModel):
    deleted: int = Field(..., title='number deleted')

    class Config:
        schema_extra = {
            'example': {
                'deleted': 1,
            }
        }
