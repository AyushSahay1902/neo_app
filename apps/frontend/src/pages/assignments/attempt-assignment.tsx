import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeContainer from "./code-container";
import { Card } from "@/components/ui/card";

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

  const [files, setFiles] = useState<any>({});

  const fetchAssignmentFiles = async () => {
    if (assignment) {
      try {
        const res = await fetch(assignment.bucketUrl);

        if (!res.ok) {
          throw new Error(`Failed to fetch files: ${res.statusText}`);
        }

        const data = await res.json();

        if (data && Object.keys(data).length > 0) {
          setFiles(data); // Set the fetched files
        } else {
          // Fallback to show only the bucketUrl if no files are returned
          setFiles({
            fallback: `Files not available. See: ${assignment.bucketUrl}`,
          });
        }
      } catch (err) {
        console.error("Error in fetch:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        // Set the fallback as the bucket URL
        setFiles({
          fallback: `Error fetching files. See: ${assignment.bucketUrl}`,
        });

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // useEffect(() => {
  //   fetchAssignmentFiles();
  // }, [assignment, toast]);

  const handleBackClick = () => {
    navigate("/assignments");
  };

  const saveAttempt = async (assignmentId: number, files: any) => {
    try {
      // Define the API URL with the assignment ID
      const apiUrl = `http://localhost:3000/api/attempts/createAttempt/${assignmentId}`;

      // Prepare the payload with userId and files
      const payload = {
        userId: 1, // Hardcoded user ID
        files, // Files data
      };

      // Make the POST request to the backend
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Handle the response
      if (!response.ok) {
        const error = await response.json();
        console.error("Error saving attempt:", error.message);
        throw new Error(error.message || "Failed to save attempt");
      }

      const data = await response.json();
      console.log("Attempt saved successfully:", data);
      return data; // Return the response data for further use
    } catch (error: any) {
      console.error("Error in saveAttempt:", error.message);
      throw error; // Rethrow error for higher-level handling
    }
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <IoArrowBack className="w-5 h-5" />
            <span>Back to Assignments</span>
          </Button>
        </div>

        {/* Title and Description Section */}
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {assignment.title}
          </h1>
          {assignment.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">
              {assignment.description}
            </p>
          )}
        </Card>

        {/* Code Editor Section */}
        <Card className="overflow-hidden">
          <div className="h-[500px] border border-gray-200 rounded-lg">
            <CodeContainer project={files} />
          </div>
        </Card>

        {/* Footer Section */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Created:</span>{" "}
                {new Date(assignment.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Last Updated:</span>{" "}
                {new Date(assignment.updatedAt).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => saveAttempt(assignment.id, files)}
              className="w-full md:w-auto"
            >
              Save Attempt
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AttemptAssignment;
