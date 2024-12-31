import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import CodeContainer from "../assignments/code-container";

const fetchTemplate = async (id) => {
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

  useEffect(() => {
    const getTemplate = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchTemplate(id);
      if (data) {
        setTemplate(data);
      } else {
        setError("Failed to fetch template");
      }
      setLoading(false);
    };

    getTemplate();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{template.name}</h1>
      <p className="mb-6">Description: {template.description}</p>
      <p className="mb-6">Bucket URL: {template.bucketUrl || "N/A"}</p>
      <p className="mb-6">
        Created At: {new Date(template.createdAt).toLocaleString()}
      </p>
      <p className="mb-6">
        Updated At: {new Date(template.updatedAt).toLocaleString()}
      </p>
      <CodeContainer project={template} />
    </div>
  );
}

export default TemplateDetailPage;
