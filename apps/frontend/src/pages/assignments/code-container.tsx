import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";
import { templates } from "@/data/templates";

interface CodeContainerProps {
  project: {
    title: string;
    description: string;
    stack?: string; // User-selected stack
    height?: number;
    width?: string;
  };
}

function CodeContainer({ project }: CodeContainerProps) {
  const { toast } = useToast();
  const containerRef = useRef<any>(null);

  const _embedSDK = async () => {
    // Find the selected template by stack ID
    const selectedTemplate = templates.find(
      (template) => template.id === project.stack
    );

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "The selected stack template could not be found.",
        variant: "destructive",
      });
      return;
    }

    // Embed the project with the selected template
    return sdk.embedProject(
      containerRef.current,
      {
        files: selectedTemplate.files,
        dependencies: selectedTemplate.dependencies,
        template: "javascript", // Adjust the template type if needed
        title: selectedTemplate.title ?? "Default Project",
        description: selectedTemplate.description ?? "Project description",
      },
      {
        openFile: "README.md",
        height: project.height ?? 800,
        width: project.width ?? "100%",
      }
    );
  };

  useEffect(() => {
    _embedSDK();
  }, [project]);

  return <div id="embed-container" ref={containerRef}></div>;
}

export default CodeContainer;
