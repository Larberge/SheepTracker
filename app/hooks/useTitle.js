import { useState } from "react";

export default useTitle = () => {
  const [title, setTitle] = useState("SheepTracker");

  return { title, setTitle};
};