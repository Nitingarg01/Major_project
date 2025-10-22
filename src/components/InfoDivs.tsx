import React from 'react';
import { Info } from 'lucide-react';
import { MessageSquareWarning } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';


type InfoType = "info" | "warning" | "alert";

const InfoDivs = ({message,type}:{message:string,type:InfoType}) => {

    const style = {
        info:'border-2 border-green-300 bg-green-100',
        warning:'border-2 border-yellow-300 bg-yellow-100',
        alert:'border-2 border-red-300 bg-red-100'
    }

  return (
    <div className={`${style[type]} rounded-md p-1 text-black flex fle-row gap-2 mt-1`}>
       {type=='info' ? (<Info color='green'/>) : type=='warning' ? <MessageSquareWarning color='orange'/> : <TriangleAlert color='red'/>}
        {message}
    </div>
  )
}

export default InfoDivs;
