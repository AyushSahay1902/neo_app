import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import CodeContainer from "../assignments/code-container";
import { useMemo } from "react";

interface Template {
  id: number;
  name: string;
  description: string;
  bucketUrl: string;
  files: { [key: string]: string };
  createdAt: string;
  updatedAt: string;
}

interface CodeContainerProps {
  project: {
    title: string;
    description: string;
    template?: number;
    templateId?: number;
    files: { [key: string]: string };
    dependencies: { [key: string]: string };
    height?: number;
    width?: string;
  };
}

function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>(); // Add type safety to useParams
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error("Template ID is required");
        }

        const response = await fetch(
          `http://localhost:3000/api/templates/getTemplate/${id}`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.message || `Failed to fetch template: ${response.statusText}`
          );
        }

        const data = await response.json();
        const fetchedTemplate = data.template?.[0];

        if (!fetchedTemplate) {
          throw new Error("Template not found");
        }

        setTemplate(fetchedTemplate);
      } catch (err) {
        console.error("Error fetching template:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  // Extract dependencies from package.json if it exists
  const dependencies = useMemo(() => {
    if (!template?.files["/package.json"]) return {};

    try {
      const packageJson = JSON.parse(template.files["/package.json"]);
      return packageJson.dependencies || {};
    } catch (err) {
      console.warn("Failed to parse package.json dependencies:", err);
      return {};
    }
  }, [template?.files]);

  const handleBackClick = () => {
    navigate("/templates");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!template) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Template not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBackClick}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <IoArrowBack className="text-xl" />
          <span>Back to Templates</span>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{template.name}</h1>
        {template.description && (
          <p className="mt-2 text-gray-600">{template.description}</p>
        )}
      </div>

      <div className="mt-6 border rounded-md min-h-[600px]">
        <CodeContainer
          project={{
            title: template.name,
            description: template.description,
            templateId: parseInt(id),
            files: template.files,
            dependencies,
          }}
        />
      </div>
    </div>
  );
}

export default TemplateDetailPage;
