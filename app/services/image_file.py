from app.services.base import BaseApiService
from app.models.image_file import ImageFile, ImageFileCreate, ImageFileUpdate
from uuid import UUID

class ImageFileService(BaseApiService[ImageFile, ImageFileCreate, ImageFileUpdate]):
    async def create_table(self):
        drop_query = """DROP TABLE IF EXISTS image_file"""
        await self.db.execute(query=drop_query)

        query = """CREATE TABLE image_file (id uuid NOT NULL, mimetype varchar, data bytea, CONSTRAINT image_file_pk PRIMARY KEY (id))"""
        return await self.db.execute(query=query)

    async def get(self, id: UUID):
        record = await BaseApiService.get(self, id=id)
        data = record.get('data')
        return data
