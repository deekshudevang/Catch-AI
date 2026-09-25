# CATCH-AI End-to-End Hackathon Demonstration

This guide outlines the steps to demonstrate the CATCH-AI platform from end to end.

## 1. Environment Setup

Start by spinning up the backend services (Database and Recovery Service) using Docker Compose:

```bash
docker-compose up --build -d
```

Verify that the services are healthy:
```bash
docker-compose ps
```

## 2. Start the Frontend (Forensic UI)

In a new terminal window, navigate to the `forensic-ui` directory and start the Vite development server:

```bash
cd forensic-ui
npm run dev
```

The frontend will be accessible at `http://localhost:5173`.

## 3. The Demonstration Workflow

### Step 3.1: Dashboard Overview
- Navigate to the frontend dashboard. 
- Highlight the real-time recovery metrics and system status components.

### Step 3.2: Initiating a Scan
- Use the CLI tool or the UI to initiate a scan on a sample forensic image.
- CLI example:
  ```bash
  python catch_cli.py scan /path/to/test_image.raw
  ```
- Show the backend logs or terminal output to prove that the integration with Forensic Engines (PyTSK3, libewf, Deep Recover, etc.) is active.

### Step 3.3: Fragment Graph Generation
- Go to the Fragment Graph UI (`/graph` route in the frontend).
- Display the visualization of the data fragments and how CATCH-AI relates them (using relationships, signatures, and entropy data).

### Step 3.4: Executing Recovery
- Run the recovery orchestrator to retrieve the files.
- CLI example:
  ```bash
  python catch_cli.py recover /path/to/test_image.raw ./recovered_output
  ```

### Step 3.5: Validation and Confidence Engine
- Showcase the validation dashboard to verify the integrity of the recovered files (hash matching, confidence scores).

## 4. Teardown

After the demonstration, gracefully shut down the docker containers:

```bash
docker-compose down
```
