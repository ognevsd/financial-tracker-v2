import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dividend-yield')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dividend-yield"!</div>
}
