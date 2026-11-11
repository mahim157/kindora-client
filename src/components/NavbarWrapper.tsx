
import { Suspense } from "react";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  return (
    <Suspense fallback={null}>
      <Navbar />
    </Suspense>
  );
}
