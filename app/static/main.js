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


const App = createApp()

BaseInput.addEventListener('change', function() {
  return App.handleFiles(this, 'base_img')
}, false)

CompInput.addEventListener('change', function() {
  return App.handleFiles(this, 'comp_imgs')
}, false)

BaseUpload.addEventListener('click', (e) => {
  e.preventDefault()
  BaseInput.click()
}, false)

CompUpload.addEventListener('click', (e) => {
  e.preventDefault()
  CompInput.click()
}, false)

UploadBtn.addEventListener('click', function() {
  return App.getComposite()
}, false)

function createApp() {
  class App {
    constructor() {
      this.resultImg = null
      this.downloadLink = null
      this.opsData = {}
      this.images = {
        base_img: null,
        comp_imgs: []
      }
    }
    // composite API call logic
    async getComposite() {
      const valid = this.validateInputs()
      if (!valid) return

      UploadBtn.innerText = "creating..."
      UploadBtn.setAttribute('disabled', true)
      const payload = JSON.stringify({
        ops: Object.values(this.opsData)
      })
      const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }
      try {
        const res = await fetch('/composite', request)
       if (!res.ok) {
         const message = await res.text().then(data => JSON.parse(data))
         throw new Error(message.detail)
       }
       await this.handleCompositeResult(res)
      } catch(err) {
        console.error(err)
        ErrorOutput.innerText = err
      } finally {
        UploadBtn.innerText = "create composite"
        UploadBtn.removeAttribute('disabled')
      }
    }

    validateInputs() {
      ErrorOutput.innerText = ''
      if (!this.images.base_img || this.images.comp_imgs.length === 0) {
        ErrorOutput.innerText = 'Both a base image and at least one composite image must be uploaded.'
        return false
      }
      if (Object.values(this.opsData).some(val => val.length === 0)) {
        ErrorOutput.innerText = 'All composite images must have a selected operator value.'
        return false
      }
      return true
    }

    async handleCompositeResult(res) {
      const blob = await res.blob()
      const objectURL = URL.createObjectURL(blob)
      //const data = await res.json()
      //const objectURL = data.url
      if (!this.resultImg) this.resultImg = this.initResultImg()
      this.resultImg.addEventListener('load', this.resultImgLoad)
      this.resultImg.src = objectURL
      this.downloadLink.href = objectURL
    }

    resultImgLoad(e) {
      let result = e.path[0]
      result.setAttribute('width', 'auto')
      result.setAttribute('style', 'object-fit: cover')
      Canvas.setAttribute('width', result.width)
      Canvas.setAttribute('height', result.height)
      ctx.drawImage(result, 0, 0);
    }

    initResultImg() {
      let link = document.createElement("a")
      link.setAttribute('id', 'download-link')
      link.setAttribute('download', 'image.png')
      link.innerText = 'download image'
      let div = document.getElementById('sidebar-wrapper')
      div.insertBefore(link, ErrorOutput)
      this.downloadLink = document.getElementById('download-link')
      let img = document.createElement("img")
      img.setAttribute('id', 'result-img')
      return img
    }

    // image file upload logic
    handleFiles(context, imgKey){
      try {
        const files = Array.from(context.files)
        const urlReader = this.getImgUrlReader(imgKey)
        const blobReader = this.getImgBlobReader(imgKey)
        let file = files[0]
        urlReader.readAsDataURL(file)
        blobReader.readAsArrayBuffer(file)
      } catch(err) {
        console.log('handleFiles err: ', err)
        throw err
      }
    }

    getImgUrlReader(imgKey){
      const baseImg = document.getElementById('base_img')
      const reader = new FileReader()
      reader.onload = (e) => {
        let img = (imgKey === 'base_img')
          ? baseImg
          : new Image()
        let canvasBaseImg = new Image()
        if (imgKey === 'base_img') {
          canvasBaseImg.addEventListener('load', (e) => {
            let result = e.path[0]
            result.setAttribute('width', 'auto')
            result.setAttribute('style', 'object-fit: cover')

            if (Canvas.hasAttribute('style')) {
              Canvas.removeAttribute('style')
            }
            Canvas.setAttribute('width', result.width)
            Canvas.setAttribute('height', result.height)
            ctx.drawImage(canvasBaseImg, 0, 0);
          })
        }
        img.src = e.target.result
        img.setAttribute('style', 'display: inline-block; width: 100px; height: auto')
        if (imgKey === 'base_img') {
          canvasBaseImg.src = e.target.result
          return
        }
        this.initImageSelect(img)
      }
      return reader
    }

    getImgBlobReader(imgKey) {
      const reader = new FileReader()
      const callback = (e) => {
        let blob = new Blob([e.target.result])
        let val = this.images[`${imgKey}`]
        if (Array.isArray(val)) {
          this.uploadImgBlob('add\
          \\
          \


          u8', blob)
          val.push(blob)
          return
        }
        this.images[`${imgKey}`] = blob
        this.uploadImgBlob('base', this.images.base_img)

      }
      reader.onload = callback
      return reader
    }

    async uploadImgBlob(imgKey, blob){
      try {
        const res = await fetch(`/${imgKey}`, {
          method: 'POST',
          body: blob
        })
        if (!res.ok) {
          if (res.status == 413) {
            throw new Error(res.statusText)
          }
          let message = await res.text()
          message = JSON.parse(message)
          throw new Error(message.detail)
        }
        return res
      } catch(err){
        console.log('err', err)
        ErrorOutput.innerText = err
        throw err
      }
    }

    initImageSelect(img) {
      let key = `op${Math.random().toString().slice(8)}`;
      const wrapper = document.createElement('div')
      wrapper.setAttribute('class', 'wrapper')
      const { newSelect, newCloseBtn } = this.createSelect(key)
      wrapper.append(newCloseBtn, img, newSelect)
      Sidebar.appendChild(wrapper)
      this.opsData[`${key}`] = ''
      newSelect.addEventListener('change', (e) => {
        this.handleSelect(e, key)
      }, false)
      newCloseBtn.addEventListener('click', (e) => {
        this.handleRemove(e, key)
      }, false)
    }

    // select dropdown handlers + adding/removing select elements
    createSelect(key) {
      const newSelect = document.createElement("select")
      const newCloseBtn = document.createElement('div')
      newSelect.innerHTML = Select.innerHTML
      newSelect.setAttribute('id', key)
      newCloseBtn.setAttribute('class', 'row')
      newCloseBtn.append('x')
      return { newSelect, newCloseBtn }
    }

    handleSelect(e, key){
      this.opsData[`${key}`] = e.target.value
    }

    handleRemove(e, key){
      const index = Object.keys(this.opsData).findIndex(k => k === `${key}`)
      if (index === -1) {
        throw new Error('handleRemove: index = -1')
      } else {
        return removeImgBlob(index).then(res => {
          //console.log('res', res)
          this.images.comp_imgs.splice(index, 1)
          delete this.opsData[`${key}`]
          const child = Sidebar.querySelector(`#${key}`)
          const parent = child.parentNode
          parent.remove()
        }).catch(err => {
          console.error(err)
          ErrorOutput.innerText = err
        })
      }
    }
  }
  return new App()
}



async function removeImgBlob(index, key){
  try {
    const res = await fetch(`/remove`, {
      method: 'POST',
      body: JSON.stringify({ index })
    })
    return handleRes(res)
  } catch(err){
    throw err
  }
}

async function handleRes(res){
  if (!res.ok) {
    let message = await res.text()
    message = JSON.parse(message)
    throw new Error(message.detail)
  }
  return res
}
