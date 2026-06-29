export function speak(text: string, lang = "fr-FR"): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.05;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
