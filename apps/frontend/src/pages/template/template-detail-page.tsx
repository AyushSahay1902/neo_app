import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import CodeContainer from "../assignments/code-container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface Template {
  id: number;
  name: string;
  description: string;
  bucketUrl: string;
  files: Record<string, string>;
  dependencies: Record<string, string>;
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

        const response = await fetch(
          `http://localhost:3000/api/templates/getTemplate/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }

        const data = await response.json();

        if (!data.template?.[0]) {
          throw new Error("Template not found");
        }

        const templateData = data.template[0];

        // If there's a bucketUrl, fetch the files
        if (templateData.bucketUrl) {
          const filesResponse = await fetch(templateData.bucketUrl);
          if (!filesResponse.ok) {
            throw new Error("Failed to fetch template files");
          }
          const filesData = await filesResponse.json();
          templateData.files = filesData;
        }

        setTemplate(templateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/templates/editTemplate/${id}`);
  };

  const handleBackClick = () => {
    navigate("/templates");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
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
          className="flex items-center"
        >
          <IoArrowBack size={20} />
          <span className="ml-2">Back to Templates</span>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{template.name}</h1>
        {template.description && (
          <p className="mt-2 text-gray-600">{template.description}</p>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Created: {new Date(template.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(template.updatedAt).toLocaleString()}</p>
      </div>

      {/* CodeContainer for template files */}
      {template.files && (
        <div className="mt-6">
          <CodeContainer
            project={{
              title: template.name,
              description: template.description || "",
              stack: String(template.id),
              files: template.files,
              dependencies: template.dependencies || {},
            }}
          />
        </div>
      )}

      <div className="mt-6">
        <Button
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-700 text-white"
        >
          Edit Template
        </Button>
      </div>
    </div>
  );
}

export default TemplateDetailPage;
