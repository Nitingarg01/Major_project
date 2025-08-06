'use client'
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Advice = {
    question:string,
    advice:string
}

const FeedbackAccordion = ({advice}:{advice:Advice[]}) => {
  return (
    <>
    <div className='flex flex-row justify-center text-md font-bold'>Question wise Feedback</div>
    <Accordion type="single" collapsible>

        {advice.map((adv,index)=>{
            return (
                 <AccordionItem value={`item-${index}`} key={index}>
    <AccordionTrigger>{adv.question}</AccordionTrigger>
    <AccordionContent>
      {adv.advice}
    </AccordionContent>
  </AccordionItem>
            )
        })}
 
</Accordion>
    </>
    
  )
}

export default FeedbackAccordion
