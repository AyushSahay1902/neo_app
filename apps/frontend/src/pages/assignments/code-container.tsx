import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";

interface CodeContainerProps {
  project: {
    files: { [key: string]: string };
    title: string;
    description: string;
    templateId: number;
    dependencies: { [key: string]: string };
    openFile?: string;
    height?: number;
    width?: string;
    initScripts?: string;
  };
}

const CodeContainer = ({
  project,
}: {
  project: CodeContainerProps["project"];
}) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Updated stack
  const stack = [
    {
      id: "react", // Added an 'id' to identify the template
      name: "React Template",
      type: "node",
      files: {
        "src/App.tsx": `import React from 'react';

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello React!</h1>
    </div>
  );
}`,
        "src/index.tsx": `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`,
        "public/index.html": `<!DOCTYPE html>
<html>
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
        "package.json": `
{
  "name": "react-template",
  "version": "0.0.0",
  "private": true,
  "dependencies": {
    "react": "18.1.0",
    "react-dom": "18.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test --env=jsdom",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "latest"
  }
}`,
      },
      dependencies: {
        react: "18.1.0",
        "react-dom": "18.1.0",
      },
      title: "React Project",
      description: "A basic React project template",
    },
  ];

  const _embedSDK = async () => {
    const selectedTemplate = project.templateId
      ? stack.find((template) => template.id === project.templateId.toString())
      : stack[0]; // Use the first template as the default

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "The selected template could not be found.",
        variant: "destructive",
      });
      return;
    }

    if (containerRef.current) {
      return sdk.embedProject(
        containerRef.current,
        {
          files: selectedTemplate.files,
          dependencies: selectedTemplate.dependencies,
          template: selectedTemplate.id || "react", // Use the first template as the default
          title: selectedTemplate.title ?? "Untitled Project",
          description: selectedTemplate.description ?? "Project description",
        },
        {
          openFile: project.openFile ?? "src/App.tsx",
          height: project.height ?? 600,
          width: project.width ?? "100%",
          startScript: project.initScripts, // Include init scripts if provided
        }
      );
    }
  };

  useEffect(() => {
    _embedSDK();
  }, [project]);

  return <div id="embed-container" ref={containerRef}></div>;
};

export default CodeContainer;
