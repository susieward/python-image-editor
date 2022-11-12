from wand.image import Image
from typing import Sequence

image_actions = [
    'vignette',
    'unsharp_mask',
    'wave',
    'wavelet_denoise'
]

class CompositeService:
    def __init__(self) -> None:
        self.base_img = None
        self.comp_imgs = []

    def reset(self):
        self.base_img = None
        self.comp_imgs = []
        print(self.base_img, self.comp_imgs)
        return

    def set_base(self, img):
        self.base_img = img

    def add_img(self, img):
        self.comp_imgs.append(img)

    def remove_img(self, index: int):
        img = self.comp_imgs[index]
        self.comp_imgs.remove(img)
        return len(self.comp_imgs)

    async def create_composite(self, ops: Sequence[str]):
        return self.composite_img(ops=ops)

    def composite_img(self, ops: Sequence[str]):
        with Image(blob=self.base_img) as base:
            for i, img in enumerate(self.comp_imgs):
                op = ops[i]
                with Image(blob=img) as comp_img:
                    comp_img.resize(width=base.width, height=base.height)
                    base.composite(comp_img, operator=op, left=0, top=0)
            return base.make_blob('jpeg')
