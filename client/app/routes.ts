import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/registration.tsx"),
  route(":slug", "routes/$slug.tsx"),
] satisfies RouteConfig
