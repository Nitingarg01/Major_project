import axios from 'axios';

const name = 'Microsoft';
const apiUrl = `https://api.api-ninjas.com/v1/logo?name=${name}`;

axios.get(apiUrl, {
  headers: {
    'X-Api-Key': process.env.API_NINJA_API_KEY // 🔐 Replace with your actual API key
  }
})
.then(response => {
  console.log(response.data); // ✅ Logo info
})
.catch(error => {
  if (error.response) {
    console.error('Error:', error.response.status, error.response.data);
  } else {
    console.error('Error:', error.message);
  }
});
