from wand.image import Image
from wand.drawing import Drawing

async def composite_img(base_img, comp_imgs, ops):
    base = Image(blob = base_img).clone()
    with Drawing() as draw:
        for i, img in enumerate(comp_imgs):
            comp = Image(blob = img)
            op = ops[i]
            draw.composite(operator = op, left = 0, top = 0,
                width = base.width, height = base.height, image = comp)
        draw(base)
        base.morphology(method = 'smooth', kernel = 'blur')
        return base.make_blob('jpeg')

class CompositeService:
    def __init__(self):
        self.base_img = None
        self.comp_imgs = []
        self.ops = []

    def reset(self):
        self.base_img = None
        self.comp_imgs = []
        self.ops = []
        print(self.base_img, self.comp_imgs, self.ops)

    def set_base(self, img):
        self.base_img = img

    def add_img(self, img):
        self.comp_imgs.append(img)

    def remove_img(self, index):
        img = self.comp_imgs[index]
        self.comp_imgs.remove(img)
        return len(self.comp_imgs)

    def set_ops(self, ops):
        self.ops = ops

    async def create_composite(self):
        try:
            result = await composite_img(self.base_img, self.comp_imgs, self.ops)
            return result
        except Exception as e:
            raise e
