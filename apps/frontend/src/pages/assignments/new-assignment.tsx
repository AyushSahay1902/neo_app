import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Label,
  Input,
  Textarea,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../components/ui";
import { toast } from "react-toastify";

interface FormData {
  title: string;
  description: string;
  file: string; // JSON as a string
  difficulty: string;
  status: string;
}

export default function NewAssignmentForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setError(""); // Reset error message

    try {
      // Parse the JSON object from the file textarea
      const fileContent = JSON.parse(data.file);

      // Prepare the final payload
      const payload = {
        title: data.title,
        description: data.description,
        file: fileContent,
        difficulty: data.difficulty,
        status: data.status,
      };

      // Make the API call to create the assignment
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

      // Show success message using toast
      toast.success("Assignment created successfully!");

      // Redirect to the assignments list after successful creation
      navigate("/assignments");
    } catch (err: any) {
      // Handle errors (e.g., invalid JSON, network error)
      setError(err.message || "Failed to create assignment. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">Create New Assignment</h1>
        <p>Add a new coding challenge to improve your skills</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
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
            <Label htmlFor="file">JSON File Content</Label>
            <Textarea
              id="file"
              placeholder='Enter JSON object, e.g., {"index.js": "console.log(Hello World)", "README.md": "# Test Project"}'
              {...register("file", {
                required: "JSON file content is required",
                validate: (value) => {
                  try {
                    JSON.parse(value);
                    return true;
                  } catch {
                    return "Invalid JSON format";
                  }
                },
              })}
            />
            {errors.file && (
              <span className="text-red-500 text-sm">
                {errors.file.message}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select defaultValue="Beginner">
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <span className="text-red-500 text-sm">
                {errors.difficulty.message}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Initial Status</Label>
            <Select defaultValue="Not Started">
              <SelectTrigger id="status">
                <SelectValue placeholder="Select initial status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <span className="text-red-500 text-sm">
                {errors.status.message}
              </span>
            )}
          </div>
        </div>
      </form>

      <div className="flex justify-between mt-10">
        <Button variant="outline" onClick={() => navigate("/assignments")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)}>Create Assignment</Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
