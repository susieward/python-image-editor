from typing import Optional, Sequence, Dict, Any
from uuid import UUID, uuid4

from app.data.image import ImageData
from app.exceptions import NotFoundError
from app.models.image import Image, ImageAddVM, ImageUpdateVM


class ImageLogic:
    def __init__(self, image_data: ImageData) -> None:
        self._image_data = image_data

    async def create_table(self):
        try:
            await self._image_data.create_table()
            return { 'status': 'all good' }
        except Exception as e:
            raise(e)

    async def get_list(self) -> Sequence[Image]:
        images = await self._image_data.get_list()
        return images

    async def get(self, id: UUID) -> Optional[Image]:
        image = await self._image_data.get(id=id)

        if not image:
            raise NotFoundError(resource_type=Image.__name__, resource_id=id)

        return image

    async def add(self, image_vm: ImageAddVM) -> UUID:
        image = Image(id=uuid4(), **image_vm.dict())
        await self._image_data.add(image=image)
        return image.id

    async def update(self, id: UUID, image_vm: ImageUpdateVM) -> int:
        rows = 0
        image = await self._image_data.get(id=id)

        if image:
            for name, val in image_vm:
                setattr(image, name, val)

            rows = await self._image_data.update(id=id, image=image)

        return rows

    async def delete(self, id: UUID) -> int:
        return await self._image_data.delete(id=id)
