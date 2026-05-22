// Placeholder — voice input via Web Speech API not yet implemented in this build.
// See docs/case-coach-md.md (Voice System section) for the original artifact implementation.

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export default function VoiceInput({ onTranscript: _onTranscript, disabled: _disabled }: Props) {
  return null;
}
