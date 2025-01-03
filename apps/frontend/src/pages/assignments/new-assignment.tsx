import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { IoArrowBack } from "react-icons/io5";
import {
  Label,
  Input,
  Textarea,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../components/ui";
import { toast } from "react-toastify";
import TemplateSelector from "@/components/templateSelector";
import CodeContainer from "../assignments/code-container";

interface FormData {
  title: string;
  description: string;
  difficulty: string;
  status: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  bucketUrl: any;
}

export default function NewAssignmentForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!selectedTemplate) {
      setError("Please select a template first");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title,
        description: data.description,
        files: selectedTemplate.bucketUrl,
        dependencies: selectedTemplate.description,
        templateId: selectedTemplate.id,
        difficulty: data.difficulty || "medium",
        status: data.status || "draft",
      };

      const response = await fetch(
        "http://localhost:3000/api/assignments/createAssignment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create assignment");
      }

      toast.success("Assignment created successfully!");
      navigate("/assignments");
    } catch (err: any) {
      setError(err.message || "Failed to create assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate("/assignments");
  };

  const handleTemplateSelect = async (templateId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/templates/getTemplate/${templateId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch template details");
      }

      const data: Template = await response.json();
      setSelectedTemplate(data);
    } catch (err) {
      console.error("Error fetching template details:", err);
      toast.error("Failed to load template details");
    }
  };

  return (
    <div className="max-w-5xl">
      <div>
        <Button onClick={handleBackClick} variant="ghost" className="mr-4">
          <IoArrowBack size={20} />
          <span className="ml-2">Back to Assignments</span>
        </Button>
      </div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Create New Assignment</h1>
        <p>Add a new coding challenge to improve your skills</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter assignment title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <span className="text-red-500 text-sm">
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the assignment"
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="template">Select Template</Label>
            <TemplateSelector onSelect={handleTemplateSelect} />
          </div>
        </div>

        {selectedTemplate && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Template Preview</h2>
            <CodeContainer
              project={{
                title: selectedTemplate.name,
                description: selectedTemplate.description,
                template: selectedTemplate.bucketUrl,
                height: 800,
                width: "100%",
              }}
            />
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button type="submit" disabled={isSubmitting || !selectedTemplate}>
            {isSubmitting ? "Creating..." : "Create Assignment"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
