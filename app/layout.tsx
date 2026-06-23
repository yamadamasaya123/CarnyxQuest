import React from "react";

export const metadata = {
  title: "CarnyxQuest — Primal Survivor Chronicles",
  description: "Durable Autophagy schedules paired with elite carb-zero predator progression trackers."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-600 selection:text-white relative overflow-x-hidden antialiased">
        {/* Background ambient atmospheric clouds */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-red-650/5 blur-[150px] rounded-full pointer-events-none"></div>

        {children}
      </body>
    </html>
  );
}
export { RootLayout };
