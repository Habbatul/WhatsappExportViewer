### WhatsApp Exported .txt Viewer


## About The Project

This web application (PWA) allows you to display WhatsApp chat logs saved in .txt format in a more readable format, similar to the original WhatsApp (note: the styling will not be identical). The app is built using vanilla JavaScript and CSS, so no special setup is required to run it locally. 

**Update** : I've added a datepicker from jQuery for date input. You can check the minimum library I'm using in the jQuery folder in this repo, url : https://github.com/jquery/jquery-ui/blob/main/ui/widgets/datepicker.js
**Update** : I've added a Synthesis Speech with web API, check this : https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis?retiredLocale=id

### Features

- **Keyword Filter**: Filter messages based on keywords.
- **Date Filter**: Filter messages based on dates.
- **Text-to-Speech (TTS)**: Press/Klick the balloon chat you desire for Text-to-Speech (TTS) on the message in that balloon chat (this project using indonesian language speech).
- **PWA**: This application can be installed as an app on your Android phone.
- **Lazy Loading**: Loads data as you scroll, ensuring the app remains lightweight and efficient.
- **DOM Fragment**: Utilizes DOM fragments for better performance.
- **Date Indicator**: A date indicator above the chat container shows the date of the current chat view. The date indicator is displayed below the chat group of that particular date. You can also hold on a chat bubble to see the exact date of that chat.

### Current Limitations

- Currently, the app only supports displaying chats in text format.
- The Text-to-Speech (TTS) feature is not supported in all browsers, and for Android, you need to set the speech from the device and adjust it to the language supported by this project (this project using indonesian language speech) to use this feature. I recommend watching the following video to activate the speech synthesis api on the Android browser : https://youtu.be/5oXOMJC-rQQ?si=AvuUGdvwZC77n-fG

### Contribute

Feel free to fork this project and create a pull request (PR) to contribute.
