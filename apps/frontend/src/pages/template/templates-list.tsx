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
  const [templates, setTemplates] = useState([]);
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
        {templates.map((template: any) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-4 text-sm">
              <p className="mb-2">Created by: {template.name}</p>
              <p>
                Created on: {new Date(template.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <div className="flex justify-end m-4">
              <Button asChild>
                <Link to={`/templates/${template.id}`}>View</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TemplatesList;
