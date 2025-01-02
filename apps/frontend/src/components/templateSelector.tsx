import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from "./ui";

interface Template {
  id: number;
  name: string;
}

export default function TemplateSelector({
  onSelect,
}: {
  onSelect: (templateId: number) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/templates/getTemplates"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    // Convert string value back to number for the parent component
    onSelect(parseInt(value, 10));
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <label
        htmlFor="select-template"
        className="text-sm font-medium text-gray-700"
      ></label>
      <Select
        onValueChange={handleTemplateChange}
        value={selectedTemplate}
        defaultValue={undefined}
      >
        <SelectTrigger id="select-template">
          <SelectValue placeholder="Choose a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.length > 0 ? (
            templates.map((template) => (
              <SelectItem key={template.id} value={template.id.toString()}>
                {template.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-templates" disabled>
              No templates available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
