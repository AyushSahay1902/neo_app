import { Button } from "./components/ui/button";
import { useEffect } from "react";
import sdk from "@stackblitz/sdk";

function App() {
  useEffect(() => {
    const project = {
      files: {
        "index.html": '<div id="root"></div>',
        "index.js": `
          import React from 'react';
          import ReactDOM from 'react-dom';
          import App from './App';

          ReactDOM.render(<App />, document.getElementById('root'));
        `,
        "App.js": `
          import React from 'react';

          function App() {
            return <h1>Hello from StackBlitz!</h1>;
          }

          export default App;
        `,
        "package.json": JSON.stringify({
          dependencies: {
            react: "^17.0.2",
            "react-dom": "^17.0.2",
          },
        }),
      },
      title: "React Project",
      description: "A simple React project",
      template: "create-react-app",
    };

    try {
      sdk.embedProject("embed-container", project);
    } catch (error) {
      console.error("Error embedding project:", error);
    }
  }, []);

  const handleSubmit = async () => {
    const iframe = document.getElementById(
      "embed-container"
    ) as HTMLIFrameElement;

    if (!iframe) {
      console.error("Iframe not found");
      return;
    }

    try {
      const vm = await sdk.connect(iframe);
      const files = await vm.getFsSnapshot();

      console.log(files);

      const response = await fetch(
        "http://localhost:3000/api/assignments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Assessment submitted successfully:", result);
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  return (
    <div className="App container mx-auto h-full flex flex-col justify-center items-center">
      <header className="App-header">
        <h1 className="text-4xl font-bold">Stackblitz Assessment</h1>
      </header>
      <div
        className="w-96 h-[80vh] bg-gray-200"
        id="embed-container"
        style={{
          height: "500px",
          width: "100%",
        }}
      ></div>
      <Button onClick={handleSubmit} className="m-10">
        Submit Assessment
      </Button>
    </div>
  );
}

export default App;
