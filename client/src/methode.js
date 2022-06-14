import Chatkit from '@pusher/chatkit-client';
import axios from 'axios';

function toggleEmojiPicker() {
  this.setState({
    showEmojiPicker: !this.state.showEmojiPicker,
  });
}

function addEmoji(emoji) {
  const { newMessage } = this.state;
  const text = `${newMessage}${emoji.native}`;

  this.setState({
    newMessage: text,
    showEmojiPicker: false,
  });
}



export {  toggleEmojiPicker, addEmoji };
