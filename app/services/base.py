from typing import Optional, Sequence, Dict, Any, Type, TypeVar, Generic
from uuid import UUID, uuid4
import asyncio
import json

from databases import Database
from app.exceptions import NotFoundError

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class BaseApiService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db: Database, table: str):
        self.model = model
        self.db = db
        self.table = table

    async def get_list(self):
        query = f'SELECT * FROM {self.table}'
        return await self.db.fetch_all(query=query)

    async def get(self, id: UUID) -> Optional[ModelType]:
        data = await self.db.fetch_one(
            query=f'SELECT * FROM {self.table} WHERE id = :id;',
            values={'id': id}
        )
        return data

    async def create(self, schema: CreateSchemaType) -> UUID:
        obj = self.model(id=uuid4(), **schema.dict())
        mapped_dict = dict(obj)
        add_fields = mapped_dict.keys()
        values = {k: v for k, v in mapped_dict.items() if k in add_fields}

        await self.db.execute(
            query=f'''
                INSERT INTO {self.table}({', '.join(add_fields)})
                VALUES({', '.join(f':{add_field}' for add_field in add_fields)});
            ''',
            values=values
        )
        return obj.id

    async def delete(self, id: UUID) -> int:
        return await self.db.fetch_val(
            query=f'''
                WITH delete_item as (
                    DELETE FROM {self.table}
                    WHERE id = :id RETURNING *
                )
                SELECT COUNT(*) as deleted FROM delete_item;
            ''',
            values = {'id': id},
            column='deleted'
        )

    async def update(self, id: UUID, schema: UpdateSchemaType) -> int:
        obj = self.model(id=id, **schema.dict())

        for k, val in schema:
            setattr(obj, k, val)

        mapped_dict = dict(obj)
        update_fields = {k: k for k in mapped_dict.keys() if k != 'id'}
        values = {k: v for k, v in mapped_dict.items() if k in update_fields}
        values['id'] = id
        update_stmt = ', '.join(f'{update_field} = :{update_field}' for update_field in update_fields)

        res = await self.db.fetch_val(
            query=f'''
                WITH update_item as (
                    UPDATE {self.table} SET {update_stmt}
                    WHERE id = :id RETURNING *
                ) SELECT COUNT(*) as updated FROM update_item;
            ''',
            values=values,
            column='updated'
        )
        return res
