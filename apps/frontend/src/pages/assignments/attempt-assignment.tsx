import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignmentResponse {
  message: string;
  data: {
    id: number;
    title: string;
    description: string;
    bucketUrl: string;
    createdAt: string;
    updatedAt: string;
  };
}

function AttemptAssignment() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [assignment, setAssignment] = useState<
    AssignmentResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignmentMetadata = async () => {
      if (!id) {
        setError("Assignment ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch only assignment metadata
        const response = await fetch(
          `http://localhost:3000/api/assignments/getAssignment/${id}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch assignment: ${response.statusText}`);
        }
        const assignmentData: AssignmentResponse = await response.json();
        setAssignment(assignmentData.data);
      } catch (err) {
        console.error("Error in fetch:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentMetadata();
  }, [id, toast]);

  const handleBackClick = () => {
    navigate("/assignments");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
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

  if (!assignment) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>Assignment not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBackClick}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <IoArrowBack className="text-xl" />
          <span>Back to Assignments</span>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{assignment.title}</h1>
        {assignment.description && (
          <p className="mt-2 text-gray-600">{assignment.description}</p>
        )}
        <div id="code-editor" className="mt-4 h-96 border border-gray-200">
          {/* Code editor will be rendered here */}
          BucketUrl: {assignment.bucketUrl}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Created At: {new Date(assignment.createdAt).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          Last Updated: {new Date(assignment.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default AttemptAssignment;
