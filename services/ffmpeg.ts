
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // We use a CDN for the WASM files for this frontend-only implementation
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  try {
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  } catch (e) {
    console.error("FFmpeg Load Error:", e);
    throw new Error("FAILED_TO_LOAD_FFMPEG_CORE");
  }
};

export const trimVideo = async (
  videoFile: File, 
  startTime: number, 
  endTime: number,
  onProgress: (progress: number) => void
): Promise<string> => {
  const ffmpeg = await loadFFmpeg();
  
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(Math.round(progress * 100));
  });

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  // -ss (start time) -to (end time) -c copy (fast stream copy, no re-encoding)
  // If exact precision is needed, remove '-c copy' but it will be slower
  await ffmpeg.exec([
    '-i', inputName,
    '-ss', startTime.toString(),
    '-to', endTime.toString(),
    '-c', 'copy', 
    outputName
  ]);

  const data = await ffmpeg.readFile(outputName);
  const blob = new Blob([data], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
};
