import { InferenceClient } from '@huggingface/inference'
let client: any = null
const token = 'nfp_HzuZeuUw3TNbozYTwT96LixRc1W5zvaG72ab'
export async function fetchKey() {
      try {
        const response = await fetch('https://api.netlify.com/api/v1/sites/36372d26-f31d-4de3-ae82-a59acf47cca3/env', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data)
        const key = data.filter((item: any) => item.key === "huggingface_key")[0]?.values[0]?.value
        client = new InferenceClient(key)
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
       
      }
}
await fetchKey()

export async function imageToText(image_url: string) {
  //console.log(image_url)
  if (!client) {
    await fetchKey()
  }
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
   if (!client) {
    await fetchKey()
  }
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
     if (!client) {
      await fetchKey()
    }
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