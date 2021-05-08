import innet, {Ref} from 'innet'
import InputFile from 'src/components/InputFile'
import {state} from 'watch-state'

import styles from './MainForm.scss'

function readFile (file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => resolve(fileReader.result as string)
    fileReader.onerror = e => reject(e)
    fileReader.readAsText(file)
  })
}

function download (filename, text) {
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

function generate (template: string, table: string, splitBy = '', splitterTemplate = '{value}', header = '', footer = ''): string {
  let content = ''

  const [keysStr, ...cols] = table.split('\n')
  const keys = keysStr.split('\t')
  const reg = new RegExp(keys.map(key => `(\\{${key}\\})`).join('|'), 'g')

  if (splitBy) {
    const raw = {}
    const rawKeys = []
    const splitterIndex = keys.indexOf(splitBy)
    const typeReg = /(\{key\})|(\{value\})/g

    for (const col of cols) {
      const calList = col.split('\t')
      const splitKey = calList[splitterIndex]

      if (splitKey in raw) {
        raw[splitKey].push(calList)
      } else {
        rawKeys.push(splitKey)
        raw[splitKey] = [calList]
      }
    }

    rawKeys.sort()

    for (const key of rawKeys) {
      let temp = ''

      for (const calList of raw[key]) {
        temp += template.replaceAll(reg, key => calList[keys.indexOf(key.slice(1, -1))])
      }

      content += splitterTemplate.replaceAll(typeReg, k => k === '{value}' ? temp : k === '{key}' ? key : k)
    }

  } else {
    for (const col of cols) {
      const calList = col.split('\t')
      content += template.replaceAll(reg, key => calList[keys.indexOf(key.slice(1, -1))])
    }
  }

  return `${header}${content}${footer}`
}

class MainForm {
  onSubmitProp: (v: string) => any

  @state keys = []
  @state splitterSelected

  form = new Ref()

  onSubmit = async e => {
    e.preventDefault()
    this.onSubmitProp(await this.getValue())
  }

  async getValue () {
    const formData = new FormData(this.form.value)

    const header = await readFile(formData.get('header') as File)
    const footer = await readFile(formData.get('footer') as File)
    const template = await readFile(formData.get('template') as File)
    const table = await readFile(formData.get('table') as File)
    const splitter = (await readFile(formData.get('splitter') as File)) || '{value}'
    const splitBy = formData.get('splitBy') as string

    return generate(template, table, splitBy, splitter, header, footer)
  }

  onTableSelected = table => {
    this.keys = table.split('\n')[0].split('\t')
  }

  onSplitterSelected = () => {
    this.splitterSelected = true
  }
  onDownload = async e => {
    e.preventDefault()
    e.stopPropagation()

    const formData = new FormData(this.form.value)

    const html = await readFile(formData.get('html') as File)
    const content = await this.getValue()

    if (html) {
      download('index.html', html.replace(/\{content\}/, content))
    } else {
      download('index.html', content)
    }
  }

  render ({onSubmit}) {
    this.onSubmitProp = onSubmit

    return (
      <form class={styles.root} onsubmit={this.onSubmit} ref={this.form}>
        <InputFile
          accept='text/html'
          label='Header'
          name='header'
        />
        <InputFile
          accept='text/html'
          label='Footer'
          name='footer'
        />
        <InputFile
          onInput={this.onSplitterSelected}
          accept='text/html'
          label='Splitter'
          name='splitter'
        />
        <InputFile
          required
          accept='text/html'
          label='Template'
          name='template'
        />
        <InputFile
          required
          onInput={this.onTableSelected}
          accept='text/tab-separated-values'
          label='Table'
          name='table'
        />
        {() => this.splitterSelected && this.keys.length ? (
          <select name='splitBy' class={styles.select}>
            {() => this.keys.map(key => <option value={key}>{key}</option>)}
          </select>
        ) : null}
        <button class={styles.button}>
          Generate
        </button>
        <InputFile
          accept='text/html'
          label='HTML'
          name='html'
        />
        <button class={styles.download} onclick={this.onDownload}>
          Download
        </button>
      </form>
    )
  }
}

export default MainForm