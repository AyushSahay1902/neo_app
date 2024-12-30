import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { templates } from "@/data/templates";
import CodeContainer from "../assignments/code-container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NewTemplate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ [key: string]: string }>({
    "index.js": "// Your code here",
  });
  const [dependencies, setDependencies] = useState<{ [key: string]: string }>(
    {}
  );
  const [stack, setStack] = useState<string>("Select Tech Stack");
  const navigate = useNavigate();

  const saveTemplate = async () => {
    try {
      const newTemplate = {
        id: name.toLowerCase().replace(/\s+/g, "_"),
        title: name,
        description,
        files,
        dependencies,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTemplate();
  };

  const updateFiles = (newFiles: { [key: string]: string }) => {
    setFiles(newFiles);
  };

  const handleSelectStack = (
    stackName: string,
    dependency: { [key: string]: string }
  ) => {
    setStack(stackName); // Update the dropdown label with the selected stack
    setDependencies(dependency); // Update the dependencies with the selected stack
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full text-left">
                      {stack} {/* Display selected stack here */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Available Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        handleSelectStack("React", { react: "18.2.0" })
                      }
                    >
                      React
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleSelectStack("Next.js", { next: "13.4.0" })
                      }
                    >
                      Next.js
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleSelectStack("Vue.js", { vue: "3.2.0" })
                      }
                    >
                      Vue.js
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleSelectStack("Angular", { angular: "15.0.0" })
                      }
                    >
                      Angular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mb-6">
              <Label>Template Code</Label>
              <CodeContainer
                project={{
                  //id is auto generated
                  id: "",
                  title: name || "New Template",
                  description: description || "New template description",
                  files,
                  dependencies,
                }}
              />
            </div>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmit}>Save Template</Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default NewTemplate;
