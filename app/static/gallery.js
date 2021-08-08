const ImagesOutput = document.getElementById('gallery-images-output')
const OutputWrapper = document.querySelector('#output-wrapper')

getImages()

async function getImages(){
  try {
    let data = await fetch('/gallery/images').then(res => res.json())
    if (data && data.length > 0) {
      data = data.reverse()
      const generator = generateImages(data)
      for await (const result of generator) {
        displayImage(result)
      }
    }
  } catch(err){
    console.error(err)
    throw err
  }
}

async function* generateImages(data) {
  let index = 0
  let item

  while (true) {
    item = data[index]
    if (!item) {
      break
    }
    const blob = await fetch(`/file/${item.file_id}`).then(res => res.blob())
    item.src = URL.createObjectURL(blob)
    yield item
    index++
  }
}

function displayImage(item){
  const div = document.createElement('div')
  div.setAttribute('style', 'display: grid; align-content: flex-start; grid-auto-rows: auto')
  const str = `<img class="gallery-img" id="${item.id}" src="${item.src}" style="max-width: 100%; height: auto;" />`
  div.innerHTML = str
  OutputWrapper.append(div)
}
/*
function displayGallery(imgs, clear = false){
  if (clear === true) {
    ImagesOutput.innerHTML = ''
  }
  const str = `<div style="display: grid; grid-template-columns: repeat(2, minmax(auto, 1fr)); grid-auto-rows: auto; grid-gap: 20px;">
    ${[...imgs.map(data => {
      return `
      <div style="display: grid; align-content: flex-start; grid-auto-rows: auto">
        <img class="gallery-img" id="${data.id}" src="${data.img.src}" style="max-width: 100%; height: auto;" />
        <span>${data.description}</span>
      </div>`
    })].join('')}
  </div>
  `
  ImagesOutput.innerHTML = str
  const galleryImgs = document.querySelectorAll('.gallery-img')
  for (const image of galleryImgs) {
    image.addEventListener('click', function(){
      let self = this
      const id = self.getAttribute('id')
      updateImage(id)
    }, false)
  }
}

/*
const str = `
<div style="display: grid; align-content: flex-start; grid-auto-rows: auto">
  <img class="gallery-img" id="${item.id}" src="${item.src}" style="max-width: 100%; height: auto;" />
  <span>${item.description}</span>
</div>`
*/

/*
var sessionImgs = sessionStorage.getItem('imgs')
var imgs = null

if(sessionImgs !== null){
  imgs = JSON.parse(sessionImgs)
}
*/

// loadGallery(null)

/*window.addEventListener('DOMContentLoaded', function(event){
  // createTable()
  loadGallery(null)
})

function loadGallery(data = null){
  if (data) {
    return displayGallery(data)
  } else {
    return getImages()
  }
}
*/
