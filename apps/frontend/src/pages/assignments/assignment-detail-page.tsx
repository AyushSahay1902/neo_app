import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import CodeContainer from "./code-container";
import { assignmentProjects } from "@/data/assignmentProjects";

interface Assignment {
  id: number;
  title: string;
  description: string;
  bucketUrl: string;
  createdAt: string;
  updatedAt: string;
}

function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [project, setProject] = useState<(typeof assignmentProjects)[0] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assignment details from the API
        const response = await fetch(
          `http://localhost:3000/api/assignments/getAssignment/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch assignment details");
        }

        const result = await response.json();
        const data: Assignment = result.data; // Extract the assignment data
        setAssignment(data);

        // Fetch the project information
        const projectInfo = assignmentProjects.find((p) => p.id === id);
        if (projectInfo) {
          setProject(projectInfo);
        }
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!assignment) {
    return <div>No assignment found.</div>;
  }

  return (
    <Card>
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
        <Tabs defaultValue="code" className="w-full">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>
          <TabsContent value="code">
            {project && <CodeContainer project={project} />}
          </TabsContent>
          <TabsContent value="tests">
            <Textarea
              value={`Test cases or additional info would go here.`}
              readOnly
              className="min-h-[400px] font-mono"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AssignmentDetailPage;
