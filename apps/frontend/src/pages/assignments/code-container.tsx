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

  const stack = [
    {
      id: "react",
      files: {
        "index.html": "<div id='root'></div>",
        "index.js":
          "import ReactDOM from 'react-dom'; ReactDOM.render('Hello React!', document.getElementById('root'));",
      },
      dependencies: {
        react: "^17.0.0",
        "react-dom": "^17.0.0",
      },
      title: "React Project",
      description: "A basic React project template",
    },
    // Add more templates here
  ];

  const _embedSDK = async () => {
    const selectedTemplate = project.templateId
      ? stack.find((template) => template.id === project.templateId.toString())
      : {
          id: "default-react",
          files: {
            "index.html": "<div id='root'></div>",
            "index.js":
              "import ReactDOM from 'react-dom'; ReactDOM.render('Welcome to React!', document.getElementById('root'));",
          },
          dependencies: {
            react: "^17.0.0",
            "react-dom": "^17.0.0",
          },
          title: "Default React App",
          description: "A basic React app",
        };

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
          template: "javascript",
          title: selectedTemplate.title ?? "Untitled Project",
          description: selectedTemplate.description ?? "Project description",
        },
        {
          openFile: project.openFile ?? "index.js",
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
