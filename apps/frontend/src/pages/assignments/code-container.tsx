import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";
import { stack, Stack } from "@/data/templates";

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
