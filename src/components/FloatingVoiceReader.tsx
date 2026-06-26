import { forwardRef } from "react";

interface FloatingVoiceReaderProps {
  contentId?: string;
}

// Voice assistant has been disabled. This component is intentionally a no-op
// to ensure no ElevenLabs TTS requests are triggered anywhere in the app.
export const FloatingVoiceReader = forwardRef<HTMLButtonElement, FloatingVoiceReaderProps>(
  function FloatingVoiceReader(_props, _ref) {
    return null;
  }
);
