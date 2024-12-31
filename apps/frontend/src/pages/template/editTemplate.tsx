import React, { useState, useEffect } from "react";
import CodeContainer from "../assignments/code-container";

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

const saveTemplate = async (id: Number, updatedData: any) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/templates/editTemplate/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to save template");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const EditTemplate = ({ id }: { id: number }) => {
  const [template, setTemplate] = useState<{
    title: string;
    description: string;
    stack?: string;
    height?: number;
    width?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setError(null);
      const data = await fetchTemplate(id);
      if (data) {
        setTemplate(data);
      } else {
        setError("Template not found");
      }
      setLoading(false);
    };

    loadTemplate();
  }, [id]);

  const handleSave = async (updatedData: any) => {
    const savedData = await saveTemplate(id, updatedData);
    if (savedData) {
      alert("Template updated successfully");
    } else {
      alert("Failed to update template");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Template</h1>
      <CodeContainer
        project={template}
        onSave={(updatedData: {
          title: string;
          description: string;
          stack?: string;
          height?: number;
          width?: string;
        }) => handleSave(updatedData)}
      />
    </div>
  );
};

export default EditTemplate;
