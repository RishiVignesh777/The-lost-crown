import { DialogueLine, DIALOGUE_DATA } from '../data/dialogue';

export class DialogueSystem {
  public isOpen = false;
  public currentLines: DialogueLine[] = [];
  public currentLineIndex = 0;
  private onCompleteCallback?: () => void;

  public startDialogue(
    keyOrLines: string | DialogueLine[],
    onComplete?: () => void
  ): { speaker: string; text: string } {
    if (typeof keyOrLines === 'string') {
      this.currentLines = DIALOGUE_DATA[keyOrLines] || [
        { speaker: 'Ancient Inscription', text: 'The ancient runes are worn by time.' }
      ];
    } else {
      this.currentLines = keyOrLines;
    }

    this.currentLineIndex = 0;
    this.onCompleteCallback = onComplete;
    this.isOpen = true;

    return this.getCurrentLine();
  }

  public getCurrentLine(): { speaker: string; text: string } {
    if (this.currentLines.length === 0 || this.currentLineIndex >= this.currentLines.length) {
      return { speaker: '', text: '' };
    }
    const line = this.currentLines[this.currentLineIndex];
    return { speaker: line.speaker, text: line.text };
  }

  public advance(): { finished: boolean; speaker: string; text: string } {
    if (!this.isOpen) return { finished: true, speaker: '', text: '' };

    this.currentLineIndex++;
    if (this.currentLineIndex < this.currentLines.length) {
      const line = this.currentLines[this.currentLineIndex];
      return { finished: false, speaker: line.speaker, text: line.text };
    } else {
      this.close();
      return { finished: true, speaker: '', text: '' };
    }
  }

  public close(): void {
    this.isOpen = false;
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = undefined;
      cb();
    }
  }
}
