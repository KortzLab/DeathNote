import { Intro } from "@/components/intro/Intro";
import { HomeFeed } from "@/components/home/HomeFeed";

// Re-render at most every 30s so new shares show up without hitting the DB on every visit.
export const revalidate = 30;

export default function HomePage() {
  return (
    <>
      <Intro />
      <HomeFeed />
    </>
  );
}
