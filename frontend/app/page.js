import Login from "./components/Login";
import UploadResume from "./components/UploadResume";
import ResumeHistory from "./components/ResumeHistory";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>resumeX Auth</h1>
      <Login />
      <UploadResume />
      <ResumeHistory />
    </main>
  );
}
