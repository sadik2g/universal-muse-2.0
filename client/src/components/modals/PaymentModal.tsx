import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import axios from "axios";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
  paymentMethod: string;
}

const PaymentModal = ({ isOpen, onClose, packageId, paymentMethod }: PaymentModalProps) => {
  // Dynamically load the PayPal script
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=ActORuPJWqzwV6JM4wnVnOb-Ov-2iGDtL0aKW-tE56J3B952RlzUC_PkDHJOZrJVSxe3orWWI2fjs0mj&currency=USD";
    script.async = true;

    // When the script is loaded successfully
    script.onload = () => {
      console.log("PayPal script loaded successfully!");
    };

    // Handle errors in loading the script
    script.onerror = () => {
      console.error("Failed to load PayPal script.");
    };

    // Append the script to the body
    document.body.appendChild(script);

    // Cleanup: Remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array to run it once when the component mounts

  const handleConfirm = async () => {
    if (paymentMethod === "PayPal") {
      try {
        const res = await axios.post("/api/paypal/create-order", { packageId });

        if (res.data.id) {
          // Redirect to PayPal approval page
          window.location.href = `https://www.paypal.com/checkoutnow?token=${res.data.id}`;
        }
      } catch (err) {
        console.error("PayPal create order error:", err);
      }
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />

      <Dialog.Panel className="fixed left-1/2 top-1/2 w-[400px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg">
        <Dialog.Title className="text-xl font-semibold mb-4">Confirm Payment</Dialog.Title>

        <p className="mb-4">
          You selected <strong>{paymentMethod}</strong> as your payment method.
        </p>

        <div className="flex justify-between mt-6">
          <Button onClick={onClose} className="bg-gray-500 text-white">
            Cancel
          </Button>

          <Button onClick={handleConfirm} className="bg-green-600 text-white">
            Confirm
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default PaymentModal;
