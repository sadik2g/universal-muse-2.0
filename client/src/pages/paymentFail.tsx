import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutFailed() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();

  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (session_id) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong during your payment. Please try again later.",
        variant: "destructive",
      });
    }
  }, [session_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-white flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md text-center border border-red-200">
        <div className="text-6xl mb-4 animate-pulse">❌</div>
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-100 text-red-600 flex items-center justify-center rounded-full shadow-lg">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-700 mb-3">Payment Unsuccessful</h1>
        <p className="text-gray-600 mb-6">
          We couldn’t process your payment. No votes were added to your contest entry.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition transform hover:scale-105"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
