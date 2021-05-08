import innet from 'innet'
import {state} from 'watch-state'

import styles from './InputFile.scss'

class InputFile {
  @state label = ''
  onInputProp

  onInput = event => {
    const file = event.target.files[0]
    this.label = file.name

    if (this.onInputProp) {
      const reader = new FileReader()

      reader.onload = () => {
        this.onInputProp(reader.result)
      }

      reader.readAsText(file)
    }
  }

  render ({label, onInput, accept, ...props}) {
    this.onInputProp = onInput

    return (
      <label class={styles.root}>
        <input
          class={styles.input}
          accept={accept}
          oninput={this.onInput}
          type='file'
          {...props}
        />
        <span class={styles.label}>
          <span class={styles.labelTitle}>
            {label}
          </span>
          <span class={styles.labelFile}>
            {() => this.label}
          </span>
        </span>
      </label>
    )
  }
}

export default InputFile