import { Client } from "minio";

// Initialize the MinIO client
const minioClient = new Client({
  endPoint: "127.0.0.1", // Replace with your MinIO server address
  port: 9000, // Replace with your MinIO server port
  useSSL: false, // Set to true if your server uses SSL
  accessKey: "minio", // Replace with your MinIO root username
  secretKey: "minio123", // Replace with your MinIO root password
});

export default minioClient;
