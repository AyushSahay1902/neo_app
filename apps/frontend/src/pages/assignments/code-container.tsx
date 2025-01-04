import { useEffect, useRef } from "react";
import sdk from "@stackblitz/sdk";
import { useToast } from "@/hooks/use-toast";
import { stack } from "@/data/templates";

interface ProjectFiles {
  [key: string]: string;
}

interface ProjectDependencies {
  [key: string]: string;
}

interface CodeContainerProps {
  project: {
    files?: ProjectFiles;
    title?: string;
    description?: string;
    templateId: number;
    dependencies?: ProjectDependencies;
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
    try {
      // Find the selected template
      const selectedTemplate = stack.find(
        (template) => template.id === project.templateId
      );

      if (!selectedTemplate) {
        toast({
          title: "Template Not Found",
          description: "Falling back to default template.",
          variant: "destructive",
        });
      }

      // Use template or fallback to first template in stack
      const template = selectedTemplate || stack[0];

      if (!template) {
        throw new Error("No templates available");
      }

      if (containerRef.current) {
        // Merge project files and dependencies with template
        const files = {
          ...template.files,
          ...(project.files || {}),
        };

        // If initScripts are provided, add them to a setup file
        if (project.initScripts) {
          files["setup.js"] = project.initScripts;

          // Modify the main entry file to import the setup script
          const mainFile = project.openFile || "/src/App.tsx";
          if (files[mainFile]) {
            files[mainFile] = `import './setup.js';\n${files[mainFile]}`;
          }
        }

        const dependencies = {
          ...template.dependencies,
          ...(project.dependencies || {}),
        };

        // Embed the project using the SDK
        await sdk.embedProject(
          containerRef.current,
          {
            files,
            dependencies,
            template: "node", // You could make this configurable if needed
            title: project.title || template.title || "Untitled Project",
            description:
              project.description ||
              template.description ||
              "Project description",
          },
          {
            openFile: project.openFile || "/src/App.tsx",
            height: project.height || 600,
            width: project.width || "100%",
          }
        );
      }
    } catch (error) {
      console.error("Error embedding project:", error);
      toast({
        title: "Error",
        description: "Failed to load the project in StackBlitz.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    _embedSDK();
  }, [project]); // Re-run when project props change

  return (
    <div
      id="embed-container"
      ref={containerRef}
      style={{ height: project.height || 600, width: project.width || "100%" }}
    />
  );
};

export default CodeContainer;
