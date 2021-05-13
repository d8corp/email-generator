import innet, {Ref} from 'innet'
import InputFile from 'src/components/InputFile'
import {state, cache} from 'watch-state'
import ejs from 'ejs/ejs.min'

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

function generate (template: string, table: string): string {
  const [keysStr, ...stringItems] = table.split('\n')
  const keys = keysStr.split('\t').map(k => k.trim())
  const items = stringItems.map(raw => raw.split('\t').reduce((r, v, i) => (r[keys[i]] = v, r), {}))

  return ejs.render(template, {items, keys})
}

class MainForm {
  onSubmitProp: (v: string) => any
  getValueProp: () => string

  @state keys = []

  @cache get showSelector () {
    return this.keys.length
  }

  form = new Ref()

  onSubmit = async e => {
    e.preventDefault()
    this.onSubmitProp(await this.getValue())
  }

  async getValue () {
    const formData = new FormData(this.form.value)

    const template = await readFile(formData.get('template') as File)
    const table = await readFile(formData.get('table') as File)

    return generate(template, table)
  }

  onTableSelected = table => {
    this.keys = table.split('\n')[0].split('\t')
  }

  onDownload = e => {
    e.preventDefault()
    e.stopPropagation()

    download('index.html', this.getValueProp())
  }

  render ({onSubmit, getValue}) {
    this.onSubmitProp = onSubmit
    this.getValueProp = getValue

    return (
      <form class={styles.root} onsubmit={this.onSubmit} ref={this.form}>
        <InputFile
          required
          onInput={this.onTableSelected}
          accept='text/tab-separated-values'
          label='Table'
          name='table'
        />
        <InputFile
          required
          accept='.ejs'
          label='Template'
          name='template'
        />
        <div>
          <button class={styles.button}>
            Generate
          </button>
          <button class={styles.download} onclick={this.onDownload}>
            Download
          </button>
        </div>
      </form>
    )
  }
}

export default MainForm