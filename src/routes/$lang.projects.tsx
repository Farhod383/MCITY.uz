import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/pages/projects";
import { seoHeadFor } from "@/lib/head";

export const Route = createFileRoute("/$lang/projects")({
  head: ({ params }) => seoHeadFor({ lang: params.lang, page: "projects" }),
  component: ProjectsPage,
});
