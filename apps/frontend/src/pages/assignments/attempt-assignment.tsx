import React, { useEffect, useState } from "react";
import CodeContainer from "./code-container";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Import Button component
import { IoArrowBack } from "react-icons/io5";

const AttemptAssignment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const [project, setProject] = useState<{
    files: { [key: string]: string };
    title: string;
    description: string;
    templateId: number;
    dependencies: { [key: string]: string };
    openFile?: string;
    height?: number;
    width?: string;
    initScripts?: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = assignmentId;
    if (!assignmentId) {
      toast({
        title: "Error",
        description: "Assignment ID is missing",
        duration: 5000,
      });
      return;
    }
    console.log("Assignment ID:", assignmentId); // Debugging
    fetch(`http://localhost:3000/api/assignments/getAssignment/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data); // Debugging
        if (data.success) {
          setProject(data.data);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to load assignment",
            duration: 5000,
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        toast({
          title: "Error",
          description: error.message,
          duration: 5000,
        });
        setLoading(false);
      });
  }, [assignmentId, toast]);

  const handleBackClick = () => {
    navigate("/assignments");
  };

  if (loading) {
    return <div>Loading Assignment...</div>;
  }

  if (!project) {
    return <div>No project data available.</div>;
  }

  return (
    <div>
      {/* Back Button */}
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} variant="ghost" className="mr-4">
          <IoArrowBack size={20} />
          <span className="ml-2">Back to Assignments</span>
        </Button>
      </div>

      {/* Assignment Information */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        <p className="mt-2">{project.description}</p>
      </div>

      {/* Code Container */}
      <div className="mt-6">
        <CodeContainer project={project} />
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button variant="secondary">Submit Attempt</Button>
      </div>
    </div>
  );
};

export default AttemptAssignment;
