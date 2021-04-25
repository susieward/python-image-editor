// const link = `<a href="#" id="gallery-upload">upload</a>`
// Mode.insertAdjacentHTML('beforebegin', link)

const ImagesOutput = document.getElementById('gallery-images-output')
const OutputWrapper = document.querySelector('#output-wrapper')
const GalleryInput = document.getElementById('gallery-input')
const GalleryUpload = document.getElementById('gallery-upload')

getImages()

GalleryInput.addEventListener('change', function(){
  let ctx = this
  return uploadFiles(ctx)
}, false)

GalleryUpload.addEventListener('click', (e) => {
  e.preventDefault()
  GalleryInput.click()
}, false)

async function getImages(){
  try {
    const res = await fetch('/gallery/images')
    if (!res.ok) {
      let message = await res.text()
      throw new Error(message)
    }
    const data = await res.json()
    if (data.length > 0) {
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
  let index = data.length - 1

  while (index >= 0) {
    let item = data[index]
    const res = await fetch(`/file/${item.file_id}`)
    const blob = await res.blob()
    const objectURL = URL.createObjectURL(blob)
    item.src = objectURL
    index--
    yield item
  }
}

async function streamImages(){
  try {
    const res = await fetch('/gallery/images')
    if (!res.ok) {
      let message = await res.text()
      throw new Error(message)
    }
    const stream = streamIterator(res.body)

    for await (const chunk of stream) {
      console.log('chunk', chunk)
    }
  } catch(err){
    console.error(err)
    throw err
  }
}

async function* streamIterator(stream){
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      yield value;
    }
  } catch(err) {
    console.log(err)
    throw err
  } finally {
    reader.releaseLock()
  }
}

async function postImage(buffer, file){
  try {
    const fileRes = await postFile(buffer, file)
    const fileData = await fileRes.json()
    const data = {
      name: file.name,
      description: `description for ${file.name}`,
      file_id: fileData.id
    }
    const res = await fetch('/gallery/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      OutputWrapper.innerHTML = ''
      getImages()
    }
  } catch(err){
    console.error(err)
    throw err
  }
}

async function updateImage(id){
  try {
    let img = await fetch(`/gallery/image/${id}`)
    const data = {
      ...img,
      description: 'updated description again'
    }
    const res = await fetch(`/gallery/image/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    if (res.ok) {
      getImages()
    }
  } catch(err){
    console.error(err)
  }
}

async function createTables(){
  await Promise.all([
    fetch('/gallery/init'),
    fetch('/file/init')
  ])
}

// files
function uploadFiles(context){
  const files = Array.from(context.files)
  const file = files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const buffer = e.target.result
    postImage(buffer, file)
  }
  reader.readAsArrayBuffer(file)
}

async function postFile(buffer, file){
  try {
    const blob = new Blob([buffer], { type: `${file.type}` })
    // console.log('blob', blob)
    // const formData = new FormData()
    // formData.append('file', blob, `${file.name}`)
    // const headers = { 'Content-Type': 'multipart/form-data' }
    const res = await fetch('/file', {
      method: 'POST',
      body: blob
    })
    return res
  } catch(err){
    throw err
  }
}

function displayImage(item){
  const div = document.createElement('div')
  div.setAttribute('style', 'display: grid; align-content: flex-start; grid-auto-rows: auto')
  const str = `<img class="gallery-img" id="${item.id}" src="${item.src}" style="max-width: 100%; height: auto;" />`
  div.innerHTML = str
  OutputWrapper.append(div)
}

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
