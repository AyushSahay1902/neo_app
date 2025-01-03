import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import sdk from "@stackblitz/sdk";

interface Template {
  id: number;
  name: string;
  description: string;
  bucketUrl: string;
  files?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

function TemplateDetailPage() {
  const { id } = useParams();
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
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch template");
        }

        const templateData = data.template[0];
        console.log("Received template data:", templateData); // Debug log

        setTemplate(templateData);
      } catch (err) {
        console.error("Error fetching template:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  useEffect(() => {
    if (template?.files) {
      sdk.embedProject(
        "stackblitz-container", // ID of the div to embed the IDE
        {
          files: template.files,
          title: template.name,
          description: template.description || "",
          template: "javascript",
          dependencies: {
            react: "^17.0.0",
            "react-dom": "^17.0.0",
          },
        },
        {
          height: 600,
          width: "100%",
        }
      );
    }
  }, [template]);

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

      <div>
        <div className="flex gap-2 mt-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
            React
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
            tailwindcss
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-sm font-medium rounded-full">
            Vitest
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
            Jasmine
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Created: {new Date(template.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(template.updatedAt).toLocaleString()}</p>
      </div>

      {template.files && (
        <div id="stackblitz-container" className="mt-6 border rounded-md"></div>
      )}

      {/* Debug info */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(
            {
              templateId: template.id,
              files: template.files,
              bucketUrl: template.bucketUrl,
            },
            null,
            2
          )}
        </pre>
      </div>
      <Button
        onClick={() => console.log("Save template clicked")}
        className="mt-4"
      >
        Save Template
      </Button>
    </div>
  );
}

export default TemplateDetailPage;
