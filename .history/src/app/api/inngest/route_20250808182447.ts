import {serve} from 'inngest/next'
import { inngest } from '@/inngest/client'
import { helloWorld,createQuestions, generateInsights, updateCredits } from '@/inngest/functions';


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    createQuestions,
    generateInsights,
    updateCredits
  ],
});