const Footer = document.getElementById('footer')
Footer.innerHTML = `&copy; Susie Ward ${new Date().getFullYear()}`
const BaseInput = document.getElementById('base-input')
const CompInput = document.getElementById('comp-input')
const BaseUpload = document.getElementById('base-upload')
const CompUpload= document.getElementById('comp-upload')
const ImagesOutput = document.getElementById('images-output')

const Sidebar = document.getElementById('sidebar')
const SidebarContainer = document.getElementById('sidebar-container')

const Select = document.getElementById('select1')
const UploadBtn = document.getElementById('upload-btn')
const ErrorOutput = document.getElementById('error')

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

window.addEventListener('DOMContentLoaded', initListeners)

function initListeners() {
  BaseInput.addEventListener('change', function() {
    return handleFiles(this, 'base_img')
  }, false)

  CompInput.addEventListener('change', function() {
    return handleFiles(this, 'top_imgs')
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
}

// composite API call logic
async function getComposite(){
  // const selectEls = [...Sidebar.querySelectorAll('select')]
  const isValid = validate()
  if (!isValid) return

  UploadBtn.innerText = "creating..."
  UploadBtn.setAttribute('disabled', true)
  const payload = JSON.stringify(Object.values(data))
  try {
    let res = await fetch('/composite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    })
    res = await handleRes(res)
    const blob = await res.blob()
    const objectURL = URL.createObjectURL(blob)
    if (!resultImg) resultImg = initResultImg()
    resultImg.addEventListener('load', handleResultImgLoad)
    resultImg.src = objectURL
    downloadLink.href = objectURL
  } catch(err) {
    console.log('err', err)
    ErrorOutput.innerText = err
  } finally {
    UploadBtn.innerText = "create composite"
    UploadBtn.removeAttribute('disabled')
  }
}

function validate() {
  ErrorOutput.innerText = ''
  if (!images.base_img || images.top_imgs.length === 0) {
    ErrorOutput.innerText = 'Both a base image and at least one composite image must be uploaded.'
    return false
  }
  if (Object.values(data).some(val => val.length === 0)) {
    ErrorOutput.innerText = 'All composite images must have a selected operator value.'
    return false
  }
  return true
}

function handleResultImgLoad(e) {
  let result = e.path ? e.path[0] : e.target
  result.setAttribute('width', 'auto')
  result.setAttribute('style', 'object-fit: cover')
  Canvas.setAttribute('width', result.width)
  Canvas.setAttribute('height', result.height)
  ctx.drawImage(resultImg, 0, 0);
}

function initResultImg() {
  let link = document.createElement("a")
  link.setAttribute('id', 'download-link')
  link.setAttribute('download', 'image.png')
  link.innerText = 'download image'
  let div = document.getElementById('sidebar-wrapper')
  div.insertBefore(link, ErrorOutput)
  downloadLink = document.getElementById('download-link')
  let img = document.createElement("img")
  img.setAttribute('id', 'result-img')
  return img
}

// image file upload logic
function handleFiles(context, imgKey) {
  try {
    const files = Array.from(context.files)
    const urlReader = getImgUrlReader(imgKey)
    const blobReader = getImgBlobReader(imgKey)
    let file = files[0]
    urlReader.readAsDataURL(file)
    blobReader.readAsArrayBuffer(file)
  } catch(err){
    console.log('handleFiles err: ', err)
  }
}

function getImgUrlReader(imgKey){
  const baseImg = document.getElementById('base_img')
  const reader = new FileReader()
  reader.onload = (e) => {
    let img = (imgKey === 'base_img') ? baseImg : new Image()
    let canvasBaseImg = new Image()
    if (imgKey === 'base_img') {
      canvasBaseImg.addEventListener('load', (e) => {
        return handleCanvasBaseImgLoad(e, canvasBaseImg)
      })
    }
    img.src = e.target.result
    img.setAttribute('style', 'display: inline-block; width: 100px; height: auto')
    if (imgKey === 'base_img') {
      canvasBaseImg.src = e.target.result
      return
    }
    initImageSelect(img)
  }
  return reader
}

function handleCanvasBaseImgLoad(e, canvasBaseImg) {
  let result = e.path ? e.path[0] : e.target
  result.setAttribute('width', 'auto')
  result.setAttribute('style', 'object-fit: cover')
  if (Canvas.hasAttribute('style')) Canvas.removeAttribute('style')
  Canvas.setAttribute('width', result.width)
  Canvas.setAttribute('height', result.height)
  ctx.drawImage(canvasBaseImg, 0, 0)
}

function getImgBlobReader(imgKey) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    let blob = new Blob([e.target.result])
    let val = images[`${imgKey}`]
    if (Array.isArray(val)) {
      uploadImgBlob('comp', blob)
      val.push(blob)
      return
    }
    images[`${imgKey}`] = blob
    uploadImgBlob('base', images.base_img)
  }
  return reader
}

async function uploadImgBlob(imgKey, blob) {
  try {
    const res = await fetch(`/${imgKey}`, {
      method: 'POST',
      body: blob
    })
    if (!res.ok) {
      if (res.status == 413) {
        throw new Error(res.statusText)
      }
      return await handleRes(res)
    }
    return res
  } catch(err) {
    console.log('err', err)
    ErrorOutput.innerText = err
  }
}

function initImageSelect(img) {
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
function createSelect(key) {
  const newSelect = document.createElement("select")
  const newCloseBtn = document.createElement('div')
  newSelect.innerHTML = Select.innerHTML
  newSelect.setAttribute('id', key)
  newCloseBtn.setAttribute('class', 'row')
  newCloseBtn.append('x')
  return { newSelect, newCloseBtn }
}

function handleSelect(e, key) {
  data[`${key}`] = e.target.value
}

function handleRemove(e, key) {
  const index = Object.keys(data).findIndex(k => k === `${key}`)
  if (index === -1) {
    throw new Error('handleRemove: index = -1')
  } else {
    return removeImgBlob(index).then(res => {
      //console.log('res', res)
      images.top_imgs.splice(index, 1)
      delete data[`${key}`]
      const child = Sidebar.querySelector(`#${key}`)
      const parent = child.parentNode
      parent.remove()
    }).catch(err => {
      console.log('handleRemove:', err)
      ErrorOutput.innerText = err
    })
  }
}

async function removeImgBlob(index, key) {
  try {
    const res = await fetch(`/remove`, {
      method: 'POST',
      body: JSON.stringify({ index: `${index}`})
    })
    return await handleRes(res)
  } catch(err){
    throw err
  }
}

async function handleRes(res) {
  if (!res.ok) {
    let message = await res.text()
    message = JSON.parse(message)
    throw new Error(message.detail)
  }
  return res
}
