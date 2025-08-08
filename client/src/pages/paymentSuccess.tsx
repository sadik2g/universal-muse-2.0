import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const { toast } = useToast();

  const session_id = searchParams.get("session_id");

  useEffect(() => {
    if (session_id) {
      toast({
        title: "Success!",
        description: "Your payment was successful. Votes will be added shortly.",
      });
    }
  }, [session_id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md text-center border border-green-200">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-100 text-green-600 flex items-center justify-center rounded-full shadow-lg">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-green-700 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your votes will be added to your contest entry shortly.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-md transition transform hover:scale-105"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
