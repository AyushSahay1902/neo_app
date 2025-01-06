import { useState, useEffect } from "react";
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
  id: number; // Changed to number based on your data
  submittedAt: string;
  status: "submitted"; // Assuming status is always 'submitted' based on your data
  bucketUrl: string; // Added field for bucket URL
}

function ListAllAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        // Fetch attempts for a specific assignment
        const response = await fetch(
          `http://localhost:3000/api/attempts/listAttempts`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch attempts: ${response.statusText}`);
        }
        const attemptsData: Attempt[] = await response.json();
        setAttempts(attemptsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load attempts. Please try again later.");
      }
    };

    fetchAttempts();
  }, []);

  const handleNewAttempt = () => {
    navigate("/assignments");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Attempts</CardTitle> {/* Updated title */}
        <CardDescription>
          View your attempts and start a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>} {/* Error message */}
        <Button onClick={handleNewAttempt} className="mb-4">
          Start New Attempt
        </Button>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bucket URL</TableHead> {/* Updated header */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt) => (
              <TableRow key={attempt.id}>
                <TableCell>
                  {new Date(attempt.submittedAt).toLocaleString()}
                </TableCell>{" "}
                {/* Format date */}
                <TableCell>{attempt.status}</TableCell>
                <TableCell>
                  <a
                    href={attempt.bucketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attempt
                  </a>{" "}
                  {/* Link to bucket URL */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ListAllAttempts;
