import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Updated to react-router-dom
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // ShadCN Badge Component
import { cn } from "@/lib/utils"; // Utility for conditional classes (optional)

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
  const navigate = useNavigate();
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

  const fetchTemplate = async (id: string) => {
    navigate(`/templates/${id}`);
  };

  const addVersions = (templates: any[]) => {
    const versionMap: { [key: string]: number } = {};
    return templates.map((template) => {
      const name = template.name;
      if (versionMap[name]) {
        versionMap[name] += 1; // Increment version if the name exists
      } else {
        versionMap[name] = 1; // Start with version 1
      }
      return { ...template, version: versionMap[name] };
    });
  };

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
          <Card key={template.id} className="shadow-md border border-gray-200">
            {/* Flex container for left and right sections */}
            <div className="flex">
              {/* Left Section */}
              <div className="p-4 flex-1">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">
                      {template.name}
                    </CardTitle>
                    <Badge variant="secondary">v{template.version || 1}</Badge>
                  </div>
                  <CardDescription className="text-gray-500">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-4 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {template.tags?.map((tag: string) => (
                      <Badge
                        key={tag}
                        className={cn("bg-blue-100 text-blue-800")}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-gray-700">
                    Created on:{" "}
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </div>

              {/* Right Section */}
              <div className="bg-gray-50 p-4 border-l border-gray-200 w-full md:w-1/3 flex flex-col justify-between">
                <h1>Files</h1>
                <div className="flex-1">
                  {/* Any other content goes here */}
                </div>
                {/* Button at the bottom */}
                <Button
                  variant="link"
                  onClick={() => fetchTemplate(template.id)}
                  className="mt-auto bg-slate-900 text-white"
                >
                  View Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TemplatesList;
