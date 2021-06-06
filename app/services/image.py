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

    async def get_file(self, record, file_service):
        file_id = record.get('file_id')
        name = record.get('name')
        file_data = await file_service.get(file_id)
        print(len(file_data))
        return file_data

        #with tempfile.SpooledTemporaryFile() as f:
            #f.write(file_data)
            #f.seek(0)
        #return f

    async def get_stream(self, file_service):
        try:
            query = f'SELECT * FROM {self.table}'
            records = await self.db.fetch_all(query=query)

               #for record in records:
                #file_id = record.get('file_id')
                #name = record.get('name')
                #file_data = await file_service.get(file_id)

                #with tempfile.SpooledTemporaryFile() as f:
                    #f.write(file_data)
                #yield f
            items = [self.get_file(record, file_service) for record in records]

            for item in asyncio.as_completed(items):
                result = await item
                yield result
            #return await asyncio.gather(*items)

            #for record in records:
                #if not record:
                    #break
                #file_id = record.get('file_id')
                #name = record.get('name')
                #img = await file_service.get(file_id)
                #yield img
        except Exception as e:
            raise e
