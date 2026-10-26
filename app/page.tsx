"use client";

import { useProjectStore, useProjectTypesStore } from "../lib/store";
import { Timeline } from "../components/timeline/Timeline";

export default function Home() {
  const { projects, isLoaded: isProjectsLoaded, addProject, updateProject, deleteProject } =
    useProjectStore();
  const { projectTypes, isLoaded: isTypesLoaded, addProjectType } =
    useProjectTypesStore();

  const isLoaded = isProjectsLoaded && isTypesLoaded;

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-[var(--bg)] p-3 sm:p-4 flex flex-col items-center justify-center select-none">
        <div className="w-full max-w-lg border border-[var(--line)] bg-[var(--surface)] rounded-[8px] p-8 text-center text-[13px] text-[var(--muted)]">
          Loading timeline...
        </div>
      </div>
    );
  }

  return (
    <main className="h-full w-full bg-[var(--surface)] flex flex-col overflow-hidden">
      <div className="w-full flex-1 flex flex-col min-h-0">
        <Timeline
          projects={projects}
          projectTypes={projectTypes}
          onAddProjectType={addProjectType}
          onAddProject={addProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
        />
      </div>
    </main>
  );
}
