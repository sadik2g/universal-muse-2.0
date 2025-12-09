import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalCheckoutProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export default function PayPalCheckout({ amount, onSuccess, onError }: PayPalCheckoutProps) {

  return (
    <div className="p-4">
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          try {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount }),
            });

            const data = await response.json();
            return data.id; // PayPal Order ID
          } catch (error) {
            console.error("Error creating PayPal order:", error);
            onError(error);
            return "";
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });

            const details = await response.json();
            onSuccess(details);
          } catch (error) {
            console.error("Error capturing PayPal order:", error);
            onError(error);
          }
        }}
      />
    </div>
  );
}
