import React, { FC, memo, useState } from "react";
const TestingComponent: FC = () => {
  const [num, setNum] = useState(0);
  return (
    <h1>
      {" "}
      this is test <button onClick={() => setNum(num + 1)}>{num}</button>
    </h1>
  );
};
export default TestingComponent;
