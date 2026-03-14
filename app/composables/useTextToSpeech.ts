export default function useTextToSpeech() {
  const { preferredVoiceName, playbackSpeed } = useApp();

  const status = ref<"idle" | "playing" | "paused">("idle");
  const voices = ref<SpeechSynthesisVoice[]>([]);
  const progress = ref(0);
  const totalChunks = ref(0);
  const isSupported = ref(false);

  let chunks: string[] = [];
  let currentChunkIndex = 0;
  let chunkOffsets: number[] = [];
  let totalCharCount = 0;

  let animFrameId: number | null = null;
  let chunkStartTime = 0;
  let chunkStartProgress = 0;
  let chunkEndProgress = 0;
  let estimatedChunkDuration = 0;
  let cancelledForPause = false;
  let isAndroid = false;

  const CHARS_PER_SECOND = 14;

  function loadVoices() {
    const all = speechSynthesis.getVoices();
    voices.value = all.filter((v) => v.lang.startsWith("en"));
  }

  /**
   * Splits text into chunks small enough to avoid Chrome's ~15s speech cutoff.
   * Preserves sentence boundaries for natural pauses.
   */
  function splitIntoChunks(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g);

    if (!sentences) {
      const words = text.split(/\s+/);
      const result: string[] = [];
      let buffer = "";
      for (const word of words) {
        if ((buffer + " " + word).length > 200 && buffer) {
          result.push(buffer.trim());
          buffer = word;
        } else {
          buffer += " " + word;
        }
      }
      if (buffer.trim()) result.push(buffer.trim());
      return result;
    }

    const result: string[] = [];
    let buffer = "";
    for (const sentence of sentences) {
      if ((buffer + sentence).length > 250 && buffer) {
        result.push(buffer.trim());
        buffer = sentence;
      } else {
        buffer += sentence;
      }
    }
    if (buffer.trim()) result.push(buffer.trim());
    return result;
  }

  function startProgressAnimation() {
    stopProgressAnimation();

    function tick() {
      if (status.value !== "playing" || estimatedChunkDuration <= 0) return;

      const elapsed = (performance.now() - chunkStartTime) / 1000;
      const ratio = Math.min(elapsed / estimatedChunkDuration, 1);
      progress.value =
        chunkStartProgress + ratio * (chunkEndProgress - chunkStartProgress);

      if (ratio < 1) {
        animFrameId = requestAnimationFrame(tick);
      }
    }

    animFrameId = requestAnimationFrame(tick);
  }

  function stopProgressAnimation() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function speakChunk(index: number) {
    if (index >= chunks.length || status.value === "idle") {
      stopProgressAnimation();
      status.value = "idle";
      progress.value = 0;
      totalChunks.value = 0;
      currentChunkIndex = 0;
      chunks = [];
      chunkOffsets = [];
      totalCharCount = 0;
      return;
    }

    const chunkText = chunks[index]!;
    const utterance = new SpeechSynthesisUtterance(chunkText);

    if (preferredVoiceName.value) {
      const voice = voices.value.find(
        (v) => v.name === preferredVoiceName.value,
      );
      if (voice) utterance.voice = voice;
    }

    const rate = playbackSpeed.value;
    utterance.rate = rate;
    utterance.pitch = 1;

    chunkStartProgress =
      totalCharCount > 0 ? (chunkOffsets[index] ?? 0) / totalCharCount : 0;
    const nextOffset = chunkOffsets[index + 1];
    chunkEndProgress =
      totalCharCount > 0
        ? (nextOffset !== undefined ? nextOffset / totalCharCount : 1)
        : 1;
    estimatedChunkDuration = chunkText.length / (CHARS_PER_SECOND * rate);
    chunkStartTime = performance.now();

    startProgressAnimation();

    utterance.onend = () => {
      stopProgressAnimation();
      if (cancelledForPause) {
        cancelledForPause = false;
        return;
      }
      currentChunkIndex = index + 1;
      progress.value = chunkEndProgress;
      if (status.value === "playing") {
        speakChunk(currentChunkIndex);
      }
    };

    utterance.onerror = (e) => {
      stopProgressAnimation();
      if (cancelledForPause) {
        cancelledForPause = false;
        return;
      }
      if (e.error !== "interrupted" && e.error !== "canceled") {
        status.value = "idle";
        progress.value = 0;
        totalChunks.value = 0;
        chunks = [];
        chunkOffsets = [];
        totalCharCount = 0;
      }
    };

    speechSynthesis.speak(utterance);
  }

  function speak(text: string) {
    stop();
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (!cleaned) return;

    chunks = splitIntoChunks(cleaned);
    totalChunks.value = chunks.length;

    chunkOffsets = [];
    let offset = 0;
    for (const chunk of chunks) {
      chunkOffsets.push(offset);
      offset += chunk.length;
    }
    totalCharCount = offset;

    currentChunkIndex = 0;
    progress.value = 0;
    status.value = "playing";
    speakChunk(0);
  }

  function pause() {
    stopProgressAnimation();
    status.value = "paused";
    if (isAndroid) {
      cancelledForPause = true;
      speechSynthesis.cancel();
    } else {
      speechSynthesis.pause();
    }
  }

  function resume() {
    if (isAndroid) {
      status.value = "playing";
      speakChunk(currentChunkIndex);
    } else {
      speechSynthesis.resume();
      status.value = "playing";
      chunkStartTime =
        performance.now() -
        ((progress.value - chunkStartProgress) /
          (chunkEndProgress - chunkStartProgress || 1)) *
          estimatedChunkDuration *
          1000;
      startProgressAnimation();
    }
  }

  function stop() {
    speechSynthesis.cancel();
    stopProgressAnimation();
    chunks = [];
    chunkOffsets = [];
    totalCharCount = 0;
    currentChunkIndex = 0;
    progress.value = 0;
    totalChunks.value = 0;
    status.value = "idle";
  }

  function toggle(text: string) {
    if (status.value === "idle") speak(text);
    else if (status.value === "playing") pause();
    else resume();
  }

  function restartFromCurrentChunk() {
    if (chunks.length === 0 || status.value === "idle") return;
    speechSynthesis.cancel();
    stopProgressAnimation();
    status.value = "playing";
    speakChunk(currentChunkIndex);
  }

  function seekToProgress(ratio: number) {
    if (chunks.length === 0 || totalCharCount === 0) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetChar = Math.floor(clamped * totalCharCount);

    let targetIndex = 0;
    for (let i = 0; i < chunkOffsets.length; i++) {
      if ((chunkOffsets[i] ?? 0) <= targetChar) targetIndex = i;
      else break;
    }

    currentChunkIndex = targetIndex;
    progress.value = (chunkOffsets[targetIndex] ?? 0) / totalCharCount;
    speechSynthesis.cancel();
    stopProgressAnimation();
    status.value = "playing";
    speakChunk(currentChunkIndex);
  }

  onMounted(() => {
    isSupported.value = "speechSynthesis" in window;
    if (!isSupported.value) return;

    isAndroid = /android/i.test(navigator.userAgent);

    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
  });

  onBeforeUnmount(() => {
    if (!isSupported.value) return;
    stop();
    speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  });

  return {
    status: readonly(status),
    voices: readonly(voices),
    progress: readonly(progress),
    totalChunks: readonly(totalChunks),
    isSupported: readonly(isSupported),
    speak,
    pause,
    resume,
    stop,
    toggle,
    restartFromCurrentChunk,
    seekToProgress,
  };
}
