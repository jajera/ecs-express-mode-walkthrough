import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeVintage from "starlight-theme-vintage";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  site: "https://jajera.github.io",
  base: "/ecs-express-mode-walkthrough",
  vite: {
    plugins: [Icons({ compiler: "astro" })],
  },
  integrations: [
    starlight({
      title: "ECS Express Mode",
      favicon: "/favicon.svg",
      description:
        "Learn ECS Express Mode by example — a minimal Terraform deployment with managed ALB, auto scaling, and public HTTPS ingress.",
      plugins: [starlightThemeVintage()],
      customCss: ["./src/styles/splash-overrides.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/jajera/ecs-express-mode-walkthrough",
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/jajera/ecs-express-mode-walkthrough/edit/main/",
      },
      lastUpdated: true,
      pagination: true,
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content:
              "https://jajera.github.io/ecs-express-mode-walkthrough/og-image.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content:
              "ECS Express Mode walkthrough — managed ALB, auto scaling, and HTTPS ingress with Terraform",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content:
              "https://jajera.github.io/ecs-express-mode-walkthrough/og-image.png",
          },
        },
      ],
      sidebar: [
        { label: "Introduction", link: "/" },
        { slug: "overview" },
        { slug: "prerequisites" },
        {
          label: "ECS Express Mode",
          items: [
            { slug: "ecs-express-mode/concepts" },
            { slug: "ecs-express-mode/express-gateway-service" },
            { slug: "ecs-express-mode/auto-scaling" },
            { slug: "ecs-express-mode/health-checks" },
          ],
        },
        {
          label: "IAM Roles",
          items: [
            { slug: "iam-roles/overview" },
            { slug: "iam-roles/task-execution-role" },
            { slug: "iam-roles/infrastructure-role" },
            { slug: "iam-roles/task-role-bedrock" },
          ],
        },
        {
          label: "Networking",
          items: [
            { slug: "networking/vpc-layout" },
            { slug: "networking/security-groups" },
            { slug: "networking/public-subnets" },
            { slug: "networking/ingress" },
          ],
        },
        {
          label: "Deployment",
          items: [
            { slug: "deployment/overview" },
            { slug: "deployment/terraform-apply" },
            { slug: "deployment/verifying" },
            { slug: "deployment/web-ui" },
          ],
        },
        { slug: "teardown" },
        { slug: "troubleshooting" },
        {
          label: "Reference",
          items: [
            { slug: "reference/when-to-use-express-mode" },
            { slug: "reference/decision-checklist" },
            { slug: "reference/limitations" },
          ],
        },
      ],
    }),
  ],
});
