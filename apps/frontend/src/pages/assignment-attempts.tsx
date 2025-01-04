import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Attempt {
  id: string;
  submittedAt: string;
  status: "Pending" | "Passed" | "Failed";
  score: number;
}

function AssignmentAttempts() {
  const { id } = useParams<{ id: string }>();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [assignment, setAssignment] = useState<{ title: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulating API calls to fetch assignment details and attempts
    try {
      const fetchAssignmentAndAttempts = async () => {
        const assignmentResponse = await fetch(`/api/assignments/${id}`);
        const assignmentData = await assignmentResponse.json();
        setAssignment(assignmentData);

        const attemptsResponse = await fetch(`/api/assignments/${id}/attempts`);
        const attemptsData = await attemptsResponse.json();
        setAttempts(attemptsData);
      };
      fetchAssignmentAndAttempts();
    } catch (error) {
      console.error("Error fetching assignment details and attempts:", error);
    }
  }, [id]);

  const handleNewAttempt = () => {
    //navigate to assignments page
    navigate("/assignments");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment?.title || "Loading..."}</CardTitle>
        <CardDescription>
          View your attempts and start a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleNewAttempt} className="mb-4">
          Start New Attempt
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>{attempt.submittedAt}</TableCell>
                <TableCell>{attempt.status}</TableCell>
                <TableCell>{attempt.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AssignmentAttempts;
