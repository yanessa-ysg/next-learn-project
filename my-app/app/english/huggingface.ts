import { InferenceClient } from '@huggingface/inference'
const KEY = ''
const client = new InferenceClient(KEY)

export async function imageToText(image_url: string) {
  //console.log(image_url)
  const chatCompletion = await client.chatCompletion({
    model: "google/gemma-3-27b-it:nebius",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: "Identify the English text in the image and output it in English",
                },
                {
                    type: "image_url",
                    image_url: {
                        url:  image_url,
                    },
                },
            ],
        },
    ],
  });
  return chatCompletion.choices[0].message
}
export async function  tts(inputs: string) {
  console.log("输入的文本是：" + inputs)
  const output = await client.textToSpeech({
       provider: "replicate",
        model: "hexgrad/Kokoro-82M",
        inputs
  });
  console.log(output);
  const arrayBuffer = await output.arrayBuffer()
  return arrayBuffer
  // await speechToText(output, inputs)
}

export async function speechToText (blob: Blob, inputText: string) {
    if(!blob) {
        return
    } 
    const output = await client.automaticSpeechRecognition({
      data: blob,
      model: "openai/whisper-large-v3",
      // provider: "replicate", //replicate、hf-inference 提供商是免费的， fal提供商是收费的
      provider: "hf-inference",
    });
     console.log(output);
     if (inputText) {
      if (trimText(inputText) === trimText(output.text)) {
        console.log("识别正常")
      } else {
        console.log("识别失败")
         console.log(trimText(inputText))
        console.log(trimText(output.text))
      }
     }
}

  function trimText(text: string) {
    return text.trim().toLowerCase().trim().replaceAll(" ", "").replaceAll(".", "").replaceAll(",", "")
  }