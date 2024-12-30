import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function fetchTemplates() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/templates/getTemplates"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const templates = await response.json();
    return templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}

function TemplatesList() {
  const [templates, setTemplates] = useState<
    {
      id: string;
      title: string;
      description: string;
      files?: Record<string, any>;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const templatesData = await fetchTemplates();
        setTemplates(templatesData);
      } catch (err: any) {
        setError(err.message || "Failed to load templates.");
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  if (loading) {
    return <div className="p-6">Loading templates...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Button asChild>
          <Link to="/templates/new">Create New Template</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="mt-4">
                  <Link to={`/templates/${template.id}`}>View Template</Link>
                </Button>
              </CardContent>
            </div>
            <div className="flex-1 bg-muted p-6 rounded-r-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{Object.keys(template.files || {}).join("\n")}</code>
              </pre>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TemplatesList;
