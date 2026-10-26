"use client";

import { LoadState } from "../components/shared/LoadState";
import { useProjectStore, useProjectTypesStore } from "../lib/store";
import { Timeline } from "../components/timeline/Timeline";

export default function Home() {
  const { projects, isLoaded: isProjectsLoaded, addProject, updateProject, deleteProject } =
    useProjectStore();
  const { projectTypes, isLoaded: isTypesLoaded, addProjectType } =
    useProjectTypesStore();

  const isLoaded = isProjectsLoaded && isTypesLoaded;

  if (!isLoaded) {
    return <LoadState label="Loading timeline..." />;
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
