# AI 绘画喵 - 基于 Cloudflare Workers 和 Hugging Face Inference API 的 AI 绘画应用

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/yun8862779/ai-painting)

这是一个简单的 AI 绘画应用，用户可以输入文本描述，选择 AI 模型，然后生成相应的图片。该应用部署在 Cloudflare Workers 上，并使用 Hugging Face Inference API 来调用 AI 绘画模型。

## 在线体验Demo

[[Demo](https://ap.wiiw.us.kg/)]

## 功能特性

-   **文本到图片生成:** 用户可以输入一段文本描述，应用会根据描述生成相应的图片。
-   **模型选择:** 用户可以选择不同的 AI 绘画模型，目前支持：
    -   `stabilityai/stable-diffusion-xl-base-1.0` (Stable Diffusion XL)
    -   `black-forest-labs/FLUX.1-dev` (默认，**注意：此模型可能无法生成有效图像**)
-   **历史记录:** 应用会保存用户的生成历史，用户可以查看、重新生成或删除历史记录。
-   **图片下载:** 用户可以将生成的图片下载到本地。
-   **明暗主题切换:** 用户可以切换应用的明亮或黑暗主题。
-   **响应式设计:** 应用可以在不同设备上良好地显示。
-   **键盘快捷键:** 支持 Ctrl + Enter 快捷键提交生成请求。
-   **拖放上传图片:** 支持拖放图片到图片展示区域。
-   **部署方便:** 通过 Cloudflare Workers 部署，无需管理服务器。



## 使用方法

1. 打开应用页面。
2. 在输入框中输入你想要创作的画面描述。
3. (可选) 从下拉菜单中选择一个 AI 模型。
4. 点击 "开始创作" 按钮或按下 Ctrl + Enter。
5. 等待图片生成，生成时间可能需要几秒到几分钟，具体取决于所选模型和提示词的复杂程度。
6. 图片生成后，你可以点击 "下载图片" 按钮将其保存到本地。
7. 点击 "历史记录" 按钮查看、重新生成或删除历史记录。


## 注意事项

-   **API 密钥安全:** 请妥善保管你的 Hugging Face API 密钥，不要将其公开或提交到公共代码仓库中。建议使用 Cloudflare Workers 的 Secrets 功能安全地存储密钥。
-   **Hugging Face API 使用限制:** Hugging Face 的 Inference API 可能有使用限制 (例如每月的请求次数、并发请求数等)。请参考 Hugging Face 的文档了解具体的限制和定价信息。
-   **模型选择:** 默认的 `black-forest-labs/FLUX.1-dev` 模型是一个文本生成模型，可能无法生成有效的图像。建议选择 `stabilityai/stable-diffusion-xl-base-1.0` 或其他适合的图像生成模型。
-   **超时时间:**  代码中设置了 5 分钟的超时时间。如果请求超时，会显示相应的提示信息。
