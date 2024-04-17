const express = require('express');
const { exec } = require('child_process');

const app = express();

const port = 8090;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Message Speaker</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        function sendMessage() {
          var message = document.getElementById('message').value;
          fetch('/speak?message=' + encodeURIComponent(message))
            .then(response => response.text())
            .then(data => {
              document.getElementById('result').innerText = data;
            })
            .catch(error => console.error('Error:', error));
          return false; // Prevent form submission
        }
      </script>
    </head>
    <body>
      <h1>Enter your message</h1>
      <form onsubmit="return sendMessage();">
        <input type="text" id="message" name="message" placeholder="Type your message here" required>
        <button type="submit">Send</button>
      </form>
      <p id="result"></p>
    </body>
    </html>
  `);
});

app.get('/speak', (req, res) => {
  const userIp = req.ip || req.connection.remoteAddress;
  const message = req.query.message;
  
  console.log(`User IP: ${userIp}, Message: ${message}`);

  const shellCommand = `echo "${message}" | gtts-cli -l ko - | mpv --volume=150 -`;

  exec(shellCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.send(`Error: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

    res.send(`Message spoken: ${message}`);
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
