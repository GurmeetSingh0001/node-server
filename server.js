const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

const FormData = require("form-data");

const port = 3002;
const app = express();
dotenv.config();
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

app.use(cors());

app.get("/", async (req, res) => {
  console.log("herhkdhj");
  res.send("server is up and running ");
});

(async () => {
  try {
    const fetchModule = await import("node-fetch");

    const fetch = fetchModule.default;

    // Your server logic using fetch
    app.post("/createOrganization", async (req, res) => {
      try {
        const clerkResponse = await fetch.default(
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

        const clerkResponse = await fetch.default(
          `${process.env.CLERK_SERVER_URL}/organizations/${organisationId}/logo`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
            },
            body: formData,
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
        const clerkResponse = await fetch(
          `${process.env.CLERK_SERVER_URL}/users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_CLERK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const clerkData = await clerkResponse.json();
        res.send(clerkData);
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

    // ... Define your other routes and middleware ...
  } catch (error) {
    console.error("Error importing node-fetch:", error);
  }
})();

module.exports = app;
