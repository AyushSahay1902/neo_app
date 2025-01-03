import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "Not Started" | "In Progress" | "Completed";
}

function AssignmentsList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/assignments/listAssignment"
        );
        if (!res.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data = await res.json();
        setAssignments(data);
      } catch (error: any) {
        setError(error.message); // Set error message
        console.error(error);
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchAssignments();
  }, []);

  const getDifficultyColor = (difficulty: Assignment["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500";
      case "Intermediate":
        return "bg-yellow-500";
      case "Advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: Assignment["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-500";
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          <p className="text-sm">
            Improve your coding skills with these coding challenges
          </p>
        </div>
        <div>
          <Button asChild>
            <Link to="/assignments/new">Create Assignment</Link>
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell>{assignment.description}</TableCell>
                  <TableCell>
                    <Badge
                      className={getDifficultyColor(assignment.difficulty)}
                    >
                      {assignment.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild>
                      <Link to={`/assignments/${assignment.id}`}>
                        View/Edit
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="secondary"
                      className="hover:bg-green-500"
                      onClick={() => {
                        console.log("Attempt button clicked");
                        navigate(`/assignments/${assignment.id}`);
                      }}
                    >
                      <Link to={`/attempts/${assignment.id}`}>Attempt</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssignmentsList;
