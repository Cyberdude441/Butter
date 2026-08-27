import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverDirectory = path.resolve(serviceDirectory, "..");
const scriptPath = path.join(serverDirectory, "forecast_service.py");
const workspaceRoot = path.resolve(serverDirectory, "..");
const workspacePython = process.platform === "win32"
  ? path.join(workspaceRoot, ".venv", "Scripts", "python.exe")
  : path.join(workspaceRoot, ".venv", "bin", "python");
const pythonCommand = process.env.PYTHON_COMMAND || workspacePython;

export const generateDataForecast = async (input) => {
  return new Promise((resolve, reject) => {
    const process = spawn(pythonCommand, [scriptPath, "--once"], {
      cwd: serverDirectory,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => process.kill(), 120000);
    process.stdout.on("data", (chunk) => { stdout += chunk; });
    process.stderr.on("data", (chunk) => { stderr += chunk; });
    process.on("error", reject);
    process.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Forecast service exited with code ${code}.`));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Forecast service returned invalid JSON."));
      }
    });
    process.stdin.end(JSON.stringify(input));
  });
};
