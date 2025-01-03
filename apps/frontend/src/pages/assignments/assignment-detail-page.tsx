import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import CodeContainer from "./code-container";
import { IoArrowBack } from "react-icons/io5";
import { Button } from "@/components/ui/button"; // Import Button component

interface Assignment {
  id: number;
  title: string;
  description: string;
  bucketUrl: string;
  createdAt: string;
  updatedAt: string;
}

function AssignmentDetailPage() {
  const { id } = useParams<{ id: number }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:3000/api/assignments/getAssignment/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assignment details");
        }

        const result = await response.json();
        const data: Assignment = result.data;
        setAssignment(data);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleEditClick = () => {
    // Empty onClick function for now
    console.log("Edit this assignment clicked");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!assignment) {
    return <div>No assignment found.</div>;
  }
  const handleBackClick = () => {
    navigate("/assignments");
  };

  return (
    <Card>
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} variant="ghost" className="mr-4">
          <IoArrowBack size={20} />
          <span className="ml-2">Back to Assignments</span>
        </Button>
      </div>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <CardDescription>{assignment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <strong>Bucket URL:</strong>{" "}
          <a
            href={assignment.bucketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            {assignment.bucketUrl}
          </a>
        </div>
        <div className="mb-4">
          <strong>Created At:</strong>{" "}
          {new Date(assignment.createdAt).toLocaleString()}
        </div>
        <div className="mb-4">
          <strong>Updated At:</strong>{" "}
          {new Date(assignment.updatedAt).toLocaleString()}
        </div>

        {/* Tabs for code and tests */}
        <Tabs defaultValue="code" className="w-full">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            {assignment && <CodeContainer project={assignment} />}
          </TabsContent>
          <TabsContent value="tests">
            <Textarea
              value={`Test cases or additional info would go here.`}
              readOnly
              className="min-h-[400px] font-mono"
            />
          </TabsContent>
        </Tabs>

        {/* Edit Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleEditClick} variant="secondary">
            Edit this Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AssignmentDetailPage;
