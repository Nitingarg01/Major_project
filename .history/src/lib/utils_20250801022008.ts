import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function getLogo(name: string) {
  const apiUrl = `https://api.api-ninjas.com/v1/logo?name=${name}`;

  axios.get(apiUrl, {
    headers: {
      'X-Api-Key': process.env.API_NINJA_API_KEY 
    }
  })
    .then(response => {
      console.log(response.data); 
      return response.data
    })
    .catch(error => {
      if (error.response) {
        console.error('Error:', error.response.status, error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    });
}