import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import FormData from "form-data";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server's .env file
dotenv.config({ path: `${__dirname}/.env` });
const port = 3001;
const app = express();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const upload = multer();
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/", async (req, res) => {
  res.send("server is  up and running ");
});
app.post("/createOrganization", async (req, res) => {
  try {
    const clerkResponse = await fetch(
      `${process.env.CLERK_SERVER_URL}/organizations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const clerkData = await clerkResponse.json();

    res.json(clerkData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
app.post("/uploadOrgLogo", upload.single("file"), async (req, res) => {
  try {
    const userID = req.body.userID;
    const organisationId = req.body.organisationId;
    const file = req.file;
    const formData = new FormData();
    formData.append("uploader_user_id", userID);
    formData.append("file", file.buffer, file.originalname);

    const clerkResponse = await fetch(
      `${process.env.CLERK_SERVER_URL}/organizations/${organisationId}/logo`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
        },
        body: formData, // Set the FormData object as the body
      }
    );
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

app.get("/getAllUsers", async (req, res) => {
  try {
    const clerkResponse = await fetch(`${process.env.CLERK_SERVER_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const clerkData = await clerkResponse.json();

    res.json(clerkData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/addUser", async (req, res) => {
  try {
    const clerkResponse = await fetch(
      `${process.env.CLERK_SERVER_URL}/organizations/${req.body.orgId}/invitations
`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const clerkData = await clerkResponse.json();

    res.json(clerkData);
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "An error occurred" });
  }
});

app.patch("/updateOrganization", async (req, res) => {
  try {
    const clerkResponse = await fetch(
      `${process.env.CLERK_SERVER_URL}/organizations/${req.body.orgId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    const clerkData = await clerkResponse.json();
    console.log(clerkData, "clerk");

    return res.json(clerkData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

export default app;
