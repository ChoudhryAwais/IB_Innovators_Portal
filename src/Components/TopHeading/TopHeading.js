import { useTopHeading } from "../Layout"

export default function TopHeading() {
  const { firstMessage, secondMessage } = useTopHeading()

  return (
   <div className="flex flex-col">
  <h1 className="text-[20px] font-semibold text-[#16151C]">
    {firstMessage || "Welcome User"}
  </h1>

  {/* hidden on small screens, visible from md+ */}
  <p className="hidden md:block text-[14px] font-light text-[#A2A1A8]">
    {secondMessage || "Good Morning"}
  </p>
</div>

  )
}
