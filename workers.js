// Cloudflare Workers 代码 (index.js)

// 可用的模型列表
const availableModels = {
  "flux": "black-forest-labs/FLUX.1-dev",
  "stable-diffusion-xl": "stabilityai/stable-diffusion-xl-base-1.0",
};
const defaultModel = "stable-diffusion-xl"; // 默认模型

const apiToken = "hf_xxx"; // 替换为你的 Hugging Face API 密钥

async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/") {
      try {
          const body = await request.json();
          const prompt = body.inputs;
          const selectedModel = body.model || defaultModel; // 获取用户选择的模型，如果没有选择则使用默认模型

          if (!prompt) {
              return new Response("Missing 'inputs' parameter", { status: 400 });
          }

          if (!availableModels[selectedModel]) {
              return new Response(`Invalid model selected: ${selectedModel}`, { status: 400 });
          }

          const apiEndpoint = `https://api-inference.huggingface.co/models/${availableModels[selectedModel]}`;

          // 使用自定义 fetch 函数，包含超时设置
          const fetchWithTimeout = async (resource, options) => {
              const { timeout = 300000 } = options; // 默认超时时间设置为 5 分钟 (300000 毫秒)

              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), timeout);

              const response = await fetch(resource, {
                  ...options,
                  signal: controller.signal
              });
              clearTimeout(id);

              return response;
          };

          const response = await fetchWithTimeout(apiEndpoint, {
              headers: {
                  Authorization: `Bearer ${apiToken}`,
                  "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({ inputs: prompt }),
              timeout: 300000 // 设置超时时间为 5 分钟
          });

          if (!response.ok) {
              const errorData = await response.json();
              let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
              if (errorData && errorData.error) {
                  errorMessage += `，错误信息：${errorData.error}`;
                  if (errorData.estimated_time) {
                      errorMessage += `，预计需要等待时间：${errorData.estimated_time} 秒`;
                  }
              }
              return new Response(errorMessage, { status: response.status });
          }

          const imageBlob = await response.blob();
          return new Response(imageBlob, { headers: { "Content-Type": "image/png" } });

      } catch (error) {
          if (error.name === 'AbortError') {
              return new Response('API request timed out after 5 minutes', { status: 504 }); // 504 Gateway Timeout
          }
          return new Response(`Error: ${error.message}`, { status: 500 });
      }
  }

  // 返回静态 HTML 页面 (如果不是 POST 请求)
  return new Response(htmlContent, {
      headers: {
          "Content-Type": "text/html;charset=UTF-8",
      },
  });
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

// 将 HTML、CSS 和 JavaScript 嵌入到这里
const htmlContent = `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>AI绘画喵</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="description" content="使用先进的AI技术，轻松创作独特的数字艺术作品。探索无限可能，释放你的创意潜能。">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="AI绘画">
  <link rel="icon" href="https://img.xwyue.com/i/2024/08/20/66c4aa7a716c0.png" type="image/png">
  <link rel="apple-touch-icon" href="https://img.xwyue.com/i/2024/08/20/66c4aa7a716c0.png">
  <style>
      :root {
          --primary-color: #4facfe;
          --secondary-color: #00f2fe;
          --background-color: #f5f7fa;
          --text-color: #333;
          --card-background: rgba(255, 255, 255, 0.9);
      }
      body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, var(--background-color) 0%, #c3cfe2 100%);
          color: var(--text-color);
      }
      .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          box-sizing: border-box;
      }
      .card {
          background-color: var(--card-background);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          width: 90%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
      }
      .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
      }
      h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-align: center;
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
      }
      .image-container {
          width: 100%;
          max-width: 500px;
          height: 350px;
          border-radius: 10px;
          margin-bottom: 1rem;
          background-color: rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: relative;
      }
      #aiImage {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
      }
      .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
          display: none;
      }
      .loading-spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid var(--primary-color);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
      }
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
      input[type="text"] {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
          transition: all 0.3s ease;
      }
      input[type="text"]:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
      }
      .button-group {
          display: flex;
          justify-content: space-between;
          width: 100%;
      }
      button {
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          border: none;
          outline: none;
      }
      .submit-btn {
          background: #cccccc;
          color: white;
          flex-grow: 1;
          margin-right: 10px;
      }
      .submit-btn.active {
          background: linear-gradient(to right, var(--primary-color) 0%, var(--secondary-color) 100%);
      }
      .submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
      }
      .download-btn {
          background: #2ecc71;
          color: white;
      }
      .download-btn:hover {
          background: #27ae60;
      }
      .history-btn {
          background: #3498db;
          color: white;
          margin-left: 10px;
      }
      .history-btn:hover {
          background: #2980b9;
      }
      .modal {
          display: none;
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
      }
      .modal-content {
          background-color: #fefefe;
          margin: 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
          max-width: 600px;
          border-radius: 10px;
      }
      .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
      }
      .close:hover,
      .close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
      }
      .history-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 5px;
      }
      .history-item img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          margin-right: 10px;
          border-radius: 5px;
      }
      .history-item-buttons {
          margin-left: auto;
      }
      .history-item-buttons button {
          margin-left: 5px;
          padding: 5px 10px;
          font-size: 0.8rem;
      }
      .redraw-btn {
          background-color: #3498db;
          color: white;
      }
      .delete-btn {
          background-color: #e74c3c;
          color: white;
      }
      .clear-history-btn {
          background-color: #e74c3c;
          color: white;
          margin-top: 10px;
      }
      .theme-toggle {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
      }
      .tooltip {
          position: relative;
          display: inline-block;
      }
      .tooltip .tooltiptext {
          visibility: hidden;
          width: 120px;
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -60px;
          opacity: 0;
          transition: opacity 0.3s;
      }
      .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
      }
      @media (max-width: 768px) {
          .card {
              width: 95%;
              padding: 1.5rem;
          }
          h1 {
              font-size: 2rem;
          }
          input[type="text"], button {
              font-size: 0.9rem;
          }
          .image-container {
              height: 250px;
          }
      }
      @media (max-width: 480px) {
          .card {
              width: 100%;
              border-radius: 0;
          }
          h1 {
              font-size: 1.75rem;
          }
          .button-group {
              flex-direction: column;
          }
          .submit-btn, .download-btn, .history-btn {
              margin: 5px 0;
              width: 100%;
          }
      }
      .dark-theme {
          --background-color: #2c3e50;
          --text-color: #ecf0f1;
          --card-background: rgba(44, 62, 80, 0.9);
      }
      select {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 1rem;
          transition: all 0.3s ease;
      }
      select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.2);
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="card">
          <h1>AI绘画创作平台</h1>
          <div class="image-container">
              <img id="aiImage" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==" alt="AI生成的图片">
              <div class="loading-overlay">
                  <div class="loading-spinner"></div>
              </div>
          </div>
          <select id="model">
              <option value="flux" ${defaultModel === "flux" ? "selected" : ""}>FLUX.1-dev</option>
              <option value="stable-diffusion-xl" ${defaultModel === "stable-diffusion-xl" ? "selected" : ""}>Stable Diffusion XL</option>
          </select>
          <input type="text" id="prompt" placeholder="请输入你想要创作的画面描述...">
          <div class="button-group">
              <button type="button" class="submit-btn" id="submitButton">开始创作</button>
              <button type="button" class="download-btn" id="downloadBtn" style="display: none;">下载图片</button>
              <button type="button" class="history-btn" id="historyBtn">历史记录</button>
          </div>
      </div>
  </div>
  <div id="historyModal" class="modal">
      <div class="modal-content">
          <span class="close">&times;</span>
          <h2>历史记录</h2>
          <div id="historyList"></div>
          <button id="clearHistoryBtn" class="clear-history-btn">清空历史记录</button>
      </div>
  </div>
  <button id="themeToggle" class="theme-toggle">🌙</button>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      const submitButton = document.getElementById('submitButton');
      const promptInput = document.getElementById('prompt');
      const downloadBtn = document.getElementById('downloadBtn');
      const historyBtn = document.getElementById('historyBtn');
      const modal = document.getElementById('historyModal');
      const closeBtn = document.getElementsByClassName('close')[0];
      const historyList = document.getElementById('historyList');
      const clearHistoryBtn = document.getElementById('clearHistoryBtn');
      const themeToggle = document.getElementById('themeToggle');
      let history = JSON.parse(localStorage.getItem('aiDrawingHistory')) || [];
      function updateHistory(prompt, imageUrl) {
          history.unshift({ prompt, imageUrl, timestamp: new Date().toISOString() });
          if (history.length > 10) history.pop();
          localStorage.setItem('aiDrawingHistory', JSON.stringify(history));
          renderHistory();
      }
      function renderHistory() {
          historyList.innerHTML = '';
          history.forEach((item, index) => {
              const historyItem = document.createElement('div');
              historyItem.className = 'history-item';
              historyItem.innerHTML = \`
                  <img src="\${item.imageUrl}" alt="\${item.prompt}">
                  <div>
                      <span>\${item.prompt}</span>
                      <br>
                      <small>\${new Date(item.timestamp).toLocaleString()}</small>
                  </div>
                  <div class="history-item-buttons">
                      <button class="redraw-btn tooltip" data-index="\${index}">重绘<span class="tooltiptext">使用此提示词重新生成图片</span></button>
                      <button class="delete-btn tooltip" data-index="\${index}">删除<span class="tooltiptext">从历史记录中删除此项</span></button>
                  </div>
              \`;
              historyList.appendChild(historyItem);
          });
      }
      function deleteHistoryItem(index) {
          history.splice(index, 1);
          localStorage.setItem('aiDrawingHistory', JSON.stringify(history));
          renderHistory();
      }
      function clearHistory() {
          if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
              history = [];
              localStorage.removeItem('aiDrawingHistory');
              renderHistory();
          }
      }
      async function generateImage(prompt) {
          submitButton.disabled = true;
          submitButton.textContent = '正在创作...';
          document.querySelector('.loading-overlay').style.display = 'flex';
          const selectedModel = document.getElementById('model').value;
          try {
              const response = await fetch(\`\${window.location.origin}\`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      'inputs': prompt,
                      'model': selectedModel
                  })
              });

              if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = \`请求失败：\${response.status} \${response.statusText}\`;
                if (errorData && errorData.error) {
                    errorMessage += \`，错误信息：\${errorData.error}\`;
                    if (errorData.estimated_time) {
                        errorMessage += \`，预计需要等待时间：\${errorData.estimated_time} 秒\`;
                    }
                }
                throw new Error(errorMessage);
            }
              const blob = await response.blob();
              const Image = await blobToBase64(blob);
              console.log('Base64 Image:', Image);
              document.getElementById('aiImage').src = \`\${Image}\`;
              updateHistory(prompt, Image);
              downloadBtn.style.display = 'block';
          } catch (error) {
            if (error.name === 'AbortError') {
                alert('API 请求超时 (5 分钟)，请稍后重试。');
              } else {
                console.error('Error:', error);
                alert(\`生成过程中发生错误：\${error.message}\`);
              }
          } finally {
              submitButton.textContent = '开始创作';
              submitButton.disabled = false;
              document.querySelector('.loading-overlay').style.display = 'none';
          }
      }
      promptInput.addEventListener('input', function() {
          if (this.value.trim() !== '') {
              submitButton.classList.add('active');
          } else {
              submitButton.classList.remove('active');
          }
      });
      submitButton.addEventListener('click', function (event) {
          event.preventDefault();
          if (promptInput.value.trim() === '') {
              alert('请输入描述词');
              return;
          }
          generateImage(promptInput.value.trim());
      });
      downloadBtn.addEventListener('click', function() {
          const image = document.getElementById('aiImage');
          const link = document.createElement('a');
          link.href = image.src;
          link.download = \`ai-artwork-\${new Date().toISOString()}.png\`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      });
      historyBtn.onclick = function() {
          modal.style.display = 'block';
          renderHistory();
      }
      closeBtn.onclick = function() {
          modal.style.display = 'none';
      }
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = 'none';
          }
      }
      historyList.addEventListener('click', function(event) {
          if (event.target.classList.contains('redraw-btn')) {
              const index = event.target.getAttribute('data-index');
              const prompt = history[index].prompt;
              promptInput.value = prompt;
              modal.style.display = 'none';
              generateImage(prompt);
          } else if (event.target.classList.contains('delete-btn')) {
              const index = event.target.getAttribute('data-index');
              deleteHistoryItem(index);
          }
      });
      clearHistoryBtn.addEventListener('click', clearHistory);
      themeToggle.addEventListener('click', function() {
          document.body.classList.toggle('dark-theme');
          themeToggle.textContent = document.body.classList.contains('dark-theme') ? '🌞' : '🌙';
          localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
      });
      // 检查并应用保存的主题
      if (localStorage.getItem('theme') === 'dark') {
          document.body.classList.add('dark-theme');
          themeToggle.textContent = '🌞';
      }
      const blobToBase64 = (blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
              resolve(reader.result);
          };
          reader.readAsDataURL(blob);
      });
      // 添加键盘快捷键支持
      document.addEventListener('keydown', function(event) {
          if (event.ctrlKey && event.key === 'Enter') {
              submitButton.click();
          }
      });
      // 添加拖放支持
      const dropZone = document.querySelector('.image-container');
      dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.border = '2px dashed #4facfe';
      });
      dropZone.addEventListener('dragleave', () => {
          dropZone.style.border = 'none';
      });
      dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.border = 'none';
          const file = e.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  document.getElementById('aiImage').src = e.target.result;
              };
              reader.readAsDataURL(file);
          }
      });
  });
  </script>
</body>
</html>
`;
