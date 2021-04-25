from app.services.base import BaseApiService
from app.models.image import Image, ImageAddVM, ImageUpdateVM
from io import BytesIO
import tempfile
import asyncio

class ImageService(BaseApiService[Image, ImageAddVM, ImageUpdateVM]):
    async def create_table(self):
        drop_query = """DROP TABLE IF EXISTS images"""
        await self.db.execute(query=drop_query)

        query = """CREATE TABLE images (id uuid NOT NULL, name varchar NOT NULL, description varchar, file_id uuid NOT NULL, CONSTRAINT images_pk PRIMARY KEY (id))"""
        return await self.db.execute(query=query)

    async def get_stream(self, file_service):
        try:
            query = f'SELECT * FROM {self.table}'
            records = await self.db.fetch_all(query=query)

            for record in records:
                if not record:
                    break
                file_id = record.get('file_id')
                name = record.get('name')
                img = await file_service.get(file_id)
                yield img
        except Exception as e:
            raise e
