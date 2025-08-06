type InfoType = "info" | "warning" | "alert";

export const modelUsed = 'gemini-2.5-flash-lite'

export const instructions:{message:string,type:InfoType}[] = [
    {
        message : 'Please ensure that your Microphone and Camera are working throught the interview.',
        type:"info"
    },
    {
        message: 'It is advised not to leave the page in between the interview as it can lead to Auto-Submission.',
        type:"warning"
    },
    {
        message:'Once submitted you cannot Re-Attempt this Interview.',
        type: "alert"
    }
] as const