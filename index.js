// Google Cloud Text-to-Speech 및 필요한 모듈을 임포트합니다.
const textToSpeech = require('@google-cloud/text-to-speech');
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');

// Google Cloud Text-to-Speech 클라이언트를 생성합니다.
const ttsClient = new textToSpeech.TextToSpeechClient();

// Express 애플리케이션을 생성합니다.
const app = express();
const port = 8090;

// Text-to-Speech 함수를 정의합니다.
async function synthesizeText(text) {
  const request = {
    input: { text: text },
    voice: { languageCode: 'ko-KR', ssmlGender: 'Standard-A' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await ttsClient.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  const filename = 'output.mp3';
  await writeFile(filename, response.audioContent, 'binary');
  return filename;
}

// 기본 라우트를 설정합니다.
app.get('/', async (req, res) => {
  const message = req.query.message;

  try {
    // Text-to-Speech를 사용해 오디오 파일을 생성합니다.
    const filename = await synthesizeText(message);

    // 생성된 오디오 파일을 mpv를 사용해 재생합니다.
    exec(`mpv --no-video ${filename}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.send(`Error: ${error}`);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);

      // 재생이 완료된 후 파일을 삭제합니다.
      fs.unlinkSync(filename);
      
      // 사용자에게 응답을 보냅니다.
      res.send(`Executed TTS and played message: ${message}`);
    });
  } catch (error) {
    console.error(`Error at TTS: ${error}`);
    res.send(`Error while processing TTS: ${error.message}`);
  }
});

// 서버를 8090 포트에서 실행합니다.
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

