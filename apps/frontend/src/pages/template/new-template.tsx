import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import CodeContainer from "../assignments/code-container";
import { templates, Template } from "@/data/templates"; // Import your templates data

function NewTemplate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const navigate = useNavigate();

  const saveTemplate = async () => {
    try {
      const newTemplate = {
        name: name.toLowerCase().replace(/\s+/g, "_"),
        description,
        files: selectedTemplate?.files || {},
        dependencies: selectedTemplate?.dependencies || {},
      };

      const response = await fetch(
        "http://localhost:3000/api/templates/createTemplate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTemplate),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Template saved successfully:", result);
      navigate("/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save the template. Please try again.");
    }
  };

  const handleSelectStack = (stackId: string) => {
    const template = templates.find((template) => template.id === stackId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTemplate();
  };

  return (
    <div className="p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dependencies">Tech Stack</Label>
                <div className="space-y-1">
                  <Select
                    onValueChange={(value) => handleSelectStack(value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tech Stack" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((templates) => (
                        <SelectItem key={templates.id} value={templates.id}>
                          {templates.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <Label>Template Code</Label>
              <CodeContainer
                project={{
                  title: name || "New Template",
                  description: description || "New template description",
                  stack: selectedTemplate?.id || "Select Tech Stack",
                  files: selectedTemplate?.files || {},
                  dependencies: selectedTemplate?.dependencies || {},
                }}
              />
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit">Save Template</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTemplate;
