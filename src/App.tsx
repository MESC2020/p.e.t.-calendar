import React from "react";
import { Button } from "./views/partials/Button";

const doNothing = () =>{
  return(
    <h1> More text</h1>
  )
}

export const App = () => {
  return (
    <div className="flex select-none bg-slate-900">
     <h1> Test1</h1>
     <h2> Test2</h2>
     <div className="h-6 w-10 ">
     <Button 
        disabled={false}
        onClick = {()=>{doNothing()}}
        className ="flex h-full w-full items-center justify-center button" >Click me</Button>
      </div>
     
    </div>
  );
}

export default App;


