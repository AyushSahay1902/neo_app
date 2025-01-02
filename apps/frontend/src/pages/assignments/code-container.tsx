import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";
import { stack, Stack } from "@/data/templates";

interface CodeContainerProps {
  project: {
    title: string;
    description: string;
    template?: string;
    height?: number;
    width?: string;
  };
}

function CodeContainer({ project }: CodeContainerProps) {
  const { toast } = useToast();
  const containerRef = useRef<any>(null);

  const _embedSDK = async () => {
    const selectedTemplate = stack.find(
      (template) => template.id === project.template
    );

    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "The selected template could not be found.",
        variant: "destructive",
      });
      return;
    }

    return sdk.embedProject(
      containerRef.current,
      {
        files: selectedTemplate.files,
        dependencies: selectedTemplate.dependencies,
        template: "javascript",
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
