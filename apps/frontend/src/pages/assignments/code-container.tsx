import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";
import { stack } from "@/data/templates";

interface CodeContainerProps {
  project: {
    files: { [key: string]: string };
    title: string;
    description: string;
    templateId?: number;
    dependencies: { [key: string]: string };
    openFile?: string;
    height?: number;
    width?: string;
    initScripts?: string;
  };
}

const CodeContainer = ({ project }: CodeContainerProps) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const embedSDK = async () => {
    try {
      // Find the selected template by `templateId`, or fall back to the first template
      const selectedTemplate =
        project.templateId != null
          ? stack.find((template) => template.id === project.templateId)
          : stack[0];

      if (!selectedTemplate) {
        toast({
          title: "Error",
          description: "The selected template could not be found.",
          variant: "destructive",
        });
        return;
      }

      if (!containerRef.current) {
        toast({
          title: "Error",
          description: "Container reference is not available.",
          variant: "destructive",
        });
        return;
      }

      // Embed the StackBlitz project
      await sdk.embedProject(
        containerRef.current,
        {
          files: selectedTemplate.files,
          dependencies: selectedTemplate.dependencies,
          template: "node", // Default template for StackBlitz (adjust if needed)
          title: selectedTemplate.title ?? "Untitled Project",
          description:
            selectedTemplate.description ?? "No description provided.",
        },
        {
          openFile: project.openFile ?? "src/App.tsx",
          height: project.height ?? 600,
          width: project.width ?? "100%",
          startScript: project.initScripts, // Include init scripts if provided
        }
      );
    } catch (error) {
      // Handle any errors during the embedding process
      toast({
        title: "Error",
        description: `An error occurred while embedding the project: ${
          (error as Error)?.message ?? "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    embedSDK();
  }, [project]);

  return (
    <div
      id="embed-container"
      ref={containerRef}
      style={{ width: "100%", height: project.height ?? 600 }}
    ></div>
  );
};

export default CodeContainer;
