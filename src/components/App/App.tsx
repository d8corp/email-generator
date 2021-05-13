import innet, {Ref} from 'innet'
import MainForm from 'src/components/MainForm'
import {Jodit} from 'jodit'
// import {state} from 'watch-state'

// import styles from './App.scss'

class App {
  textarea = new Ref()
  editor

  mounted () {
    this.editor = new Jodit(this.textarea.value, {
      buttons: 'source,|,undo,redo,|,bold,italic,underline,strikethrough,|,brush,font,fontsize,paragraph,|,align,|,ul,ol,indent,outdent,|,superscript,subscript,|,hr,table,link,image,video,file,symbol,|,find,fullsize,preview,print'
    })
  }

  render () {
    return (
      <>
        <MainForm getValue={() => this.editor.value} onSubmit={v => this.editor.value = v} />
        <textarea ref={this.textarea} />
      </>
    )
  }
}

export default App
