from wand.image import Image
from wand.drawing import Drawing

def get_images(blobs):
    imgs = list(map(lambda img: Image(blob = img), blobs))
    return imgs

async def composite_img(base_img, top_imgs, ops):
    with Drawing() as draw:
        base = Image(blob = base_img).clone()
        comp_imgs = get_images(top_imgs)
        for i, top in enumerate(comp_imgs):
            op = ops[i]
            draw.composite(operator = op, left = 0, top = 0,
                width = base.width, height = base.height, image = top)
        draw(base)
        base.morphology(method = 'smooth', kernel = 'blur')
        return base.make_blob('jpeg')
