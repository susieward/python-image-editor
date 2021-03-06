(async () => {
  await fetch('/clear', { method: 'GET' })
})()

const Mode = document.getElementById('mode')
const Body = document.querySelector('body')

var localDarkMode = localStorage.getItem('darkMode')
var darkMode = false

if(localDarkMode !== null){
  darkMode = JSON.parse(localDarkMode)
  setCurrentTheme(darkMode)
}

Mode.addEventListener('click', (e) => {
  darkMode = !darkMode
  setCurrentTheme(darkMode)
  localStorage.setItem('darkMode', JSON.stringify(darkMode))
})

function setCurrentTheme(isDarkMode){
  const theme = (isDarkMode === true) ? 'theme-dark' : 'theme-light'
  return Body.setAttribute('class', `${theme}`)
}

const BaseInput = document.getElementById('base-input')
const CompInput = document.getElementById('comp-input')
const BaseUpload = document.getElementById('base-upload')
const CompUpload= document.getElementById('comp-upload')
const ImagesOutput = document.getElementById('images-output')

const Footer = document.getElementById('footer')
const Sidebar = document.getElementById('sidebar')
const SidebarContainer = document.getElementById('sidebar-container')

const Select = document.getElementById('select1')
const UploadBtn = document.getElementById('upload-btn')
const ErrorOutput = document.getElementById('error')
Footer.innerHTML = `&copy; Susie Ward ${new Date().getFullYear()}`

const Canvas = document.getElementById('canvas')
const ctx = Canvas.getContext('2d')
ctx.imageSmoothingQuality = "high"

var resultImg = null
var downloadLink = null
var data = {}
var images = {
  base_img: null,
  top_imgs: []
}

BaseInput.addEventListener('change', function(){
  let ctx = this
  return handleFiles(ctx, 'base_img')
}, false)

CompInput.addEventListener('change', function(){
  let ctx = this
  return handleFiles(ctx, 'top_imgs')
}, false)

BaseUpload.addEventListener('click', (e) => {
  e.preventDefault()
  BaseInput.click()
}, false)

CompUpload.addEventListener('click', (e) => {
  e.preventDefault()
  CompInput.click()
}, false)

UploadBtn.addEventListener('click', getComposite, false)


// composite API call logic
async function getComposite(){
  try {
    const selectEls = [...Sidebar.querySelectorAll('select')]
    ErrorOutput.innerText = ''
    if(!images.base_img || images.top_imgs.length === 0){
      ErrorOutput.innerText = 'Both a base image and at least one composite image must be uploaded.'
      return
    }
    if(Object.entries(data).length < selectEls.length){
      return ErrorOutput.innerText = 'All composite images must have a selected operator value.'
    }

    UploadBtn.innerText = "creating..."
    UploadBtn.setAttribute('disabled', true)

    const res = await fetch('/composite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.values(data))
    })

    const blob = await res.blob()
    const objectURL = URL.createObjectURL(blob)

    if(!resultImg){
      let link = document.createElement("a")
      link.setAttribute('id', 'download-link')
      link.setAttribute('download', 'image.png')
      link.innerText = 'save image'
      let div = document.getElementById('sidebar-wrapper')
      div.insertBefore(link, ErrorOutput)
      downloadLink = document.getElementById('download-link')
      let img = document.createElement("img")
      img.setAttribute('id', 'result-img')
      resultImg = img
    }

    resultImg.addEventListener('load', (e) => {
      let result = e.path[0]
      result.setAttribute('width', 'auto')
      result.setAttribute('style', 'object-fit: cover')
      Canvas.setAttribute('width', result.width)
      Canvas.setAttribute('height', result.height)
      ctx.drawImage(resultImg, 0, 0);
    })

    resultImg.src = objectURL
    downloadLink.href = objectURL

    UploadBtn.innerText = "create composite"
    UploadBtn.removeAttribute('disabled')
  } catch(err){
    ErrorOutput.innerText = err.message
    UploadBtn.innerText = "create composite"
    UploadBtn.removeAttribute('disabled')
    throw err
  }
}

// image file upload logic
async function handleFiles(context, imgKey){
  try {
    const files = Array.from(context.files)
    const urlReader = getImgUrlReader(imgKey)
    const blobReader = getImgBlobReader(imgKey)
    await Promise.all(files.map(async file => {
      urlReader.readAsDataURL(file);
      return await blobReader.readAsArrayBuffer(file)
    }))
  } catch(err){
    console.log('handleFiles err: ', err)
    throw err
  }
}


function getImgUrlReader(imgKey){
  const baseImg = document.getElementById('base_img')
  const reader = new FileReader()
  reader.onload = (e) => {
    let img = (imgKey === 'base_img')
      ? baseImg
      : new Image()
    let canvasBaseImg = new Image()
    if(imgKey === 'base_img'){
      canvasBaseImg.addEventListener('load', (e) => {
        let result = e.path[0]
        result.setAttribute('width', 'auto')
        result.setAttribute('style', 'object-fit: cover')

        if(Canvas.hasAttribute('style')){
          Canvas.removeAttribute('style')
        }
        Canvas.setAttribute('width', result.width)
        Canvas.setAttribute('height', result.height)
        ctx.drawImage(canvasBaseImg, 0, 0);
      })
    }
    img.src = e.target.result
    img.setAttribute('style', 'display: inline-block; width: 100px; height: auto')
    if(imgKey === 'base_img'){
      canvasBaseImg.src = e.target.result
      return
    }
    initImageSelect(img)
  }
  return reader
}


function getImgBlobReader(imgKey){
  const reader = new FileReader()
  reader.onload = async (e) => {
    let blob = new Blob([e.target.result])
    let val = images[`${imgKey}`]
    if(Array.isArray(val)){
      val.push(blob)
      return await uploadImgBlob(imgKey, blob).catch(err => {
        throw err
      })
    }
    images[`${imgKey}`] = blob
    return await uploadImgBlob(imgKey, blob).catch(err => {
      throw err
    })
  }
  return reader
}

async function uploadImgBlob(imgKey, blob){
  return fetch(`/upload/${imgKey}`, {
    method: 'POST',
    body: blob
  })
}

function initImageSelect(img){
  let key = `op${Math.random().toString().slice(8)}`;
  const wrapper = document.createElement('div')
  wrapper.setAttribute('class', 'wrapper')
  const { newSelect, newCloseBtn } = createSelect(key)
  wrapper.append(newCloseBtn, img, newSelect)
  Sidebar.appendChild(wrapper)
  data[`${key}`] = ''
  newSelect.addEventListener('change', (e) => {
    handleSelect(e, key)
  }, false)
  newCloseBtn.addEventListener('click', (e) => {
    handleRemove(e, key)
  }, false)
}


// select dropdown handlers + adding/removing select elements
function createSelect(key){
  const newSelect = document.createElement("select")
  const newCloseBtn = document.createElement('div')
  newSelect.innerHTML = Select.innerHTML
  newSelect.setAttribute('id', key)
  newCloseBtn.setAttribute('class', 'row')
  newCloseBtn.append('x')
  return { newSelect, newCloseBtn }
}

function handleSelect(e, key){
  data[`${key}`] = e.target.value
}

function handleRemove(e, key){
  const index = Object.keys(data).findIndex(k => k === `${key}`)
  if(index === -1){
    throw new Error('handleRemove: index = -1')
  } else {
    return removeImgBlob(index, key).then(res => {
      const child = Sidebar.querySelector(`#${key}`)
      const parent = child.parentNode
      parent.remove()
    }).catch(err => {
      console.log(err)
      throw err
    })
  }
}

// remove image + data reference
async function removeImgBlob(index, key){
  try {
    const res = await fetch(`/remove/${index}`, { method: 'GET'})
    if(res.ok){
      images.top_imgs.splice(index, 1)
      delete data[`${key}`]
    }
  } catch(err){
    console.log('removeImgBlob', err)
    throw new Error(`removeImgBlob err: ${err}`)
  }
}
