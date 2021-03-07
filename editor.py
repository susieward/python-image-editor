from wand.image import Image
from wand.drawing import Drawing

async def composite_img(base_img, top_imgs, ops):
    base = Image(blob = base_img).clone()
    comp_imgs = list(map(lambda i: Image(blob = i).clone(), top_imgs))

    with Drawing() as draw:
        for i,op in enumerate(ops):
            top = comp_imgs[i]
            draw.composite(operator = op, left = 0, top = 0,
                width = base.width, height = base.height, image = top)
        draw(base)
        base.morphology(method = 'smooth', kernel = 'blur')
        #base.enhance()
        jpeg_bin = base.make_blob('jpeg')
        if jpeg_bin:
            return jpeg_bin
        else:
            return None
    #return jpeg_bin
