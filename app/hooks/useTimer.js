import { useState, useEffect } from "react";
import moment from "moment";

export default useTimer = () => {
  const [curMoment, setCurMoment] = useState(moment());
  const [running, setRunning] = useState(true);

  //Creating a timer
  useEffect(() => {
    const interval = setInterval(() => {
      if(running) setCurMoment(moment());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const pause = () => setRunning(false);
  
  const resume = () => setRunning(true);

  return { curMoment, pause, resume };
};
