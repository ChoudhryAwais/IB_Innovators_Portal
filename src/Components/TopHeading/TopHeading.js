import { useTopHeading } from "../Layout"

export default function TopHeading() {
  const { firstMessage, secondMessage } = useTopHeading()

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-semibold text-gray-900">{firstMessage || "Welcome User Name"}</h1>
      <p className="text-sm text-gray-500">{secondMessage || "Good Morning"}</p>
    </div>
  )
}
