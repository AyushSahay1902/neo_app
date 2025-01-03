import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";

const fetchTemplate = async (id: Number) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/templates/getTemplate/${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch template");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

function TemplateDetailPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getTemplate = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchTemplate(Number(id));
      if (data) {
        setTemplate(data);
      } else {
        setError("Failed to fetch template");
      }
      setLoading(false);
    };

    getTemplate();
  }, [id]);

  const handleEdit = () => {
    // Redirect to edit page
    navigate(`/templates/editTemplate/${id}`);
  };

  const handleBackClick = () => {
    navigate("/templates");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Button onClick={handleBackClick} variant="ghost" className="mr-4">
          <IoArrowBack size={20} />
          <span className="ml-2">Back to Templates</span>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">{template.name}</h1>
      <p className="mb-6">Description: {template.description}</p>
      <p className="mb-6">Bucket URL: {template.bucketUrl || "N/A"}</p>
      <p className="mb-6">
        Created At: {new Date(template.createdAt).toLocaleString()}
      </p>
      <p className="mb-6">
        Updated At: {new Date(template.updatedAt).toLocaleString()}
      </p>

      <div>
        <button
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default TemplateDetailPage;
