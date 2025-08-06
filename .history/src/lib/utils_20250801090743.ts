import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function getLogo(name: string) {
  const apiUrl = `https://api.api-ninjas.com/v1/logo?name=${name}`;
  try {
     const response = await axios.get(apiUrl, {
      headers: {
        'X-Api-Key': process.env.API_NINJA_API_KEY as string,
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error:', error);
    return null
  }

  const response = await axios.get(apiUrl, {
    headers: {
      'X-Api-Key': process.env.API_NINJA_API_KEY 
    }
  })
   
      console.log(response.data); 
      return response.data
    .catch(error: => {
     
    });
}