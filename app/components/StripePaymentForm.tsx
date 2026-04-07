'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

interface Props {
  clientSecret: string;
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePaymentForm({ clientSecret, orderNumber, onSuccess, onCancel }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      }
    });

    if (result.error) {
      toast.error(result.error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        toast.success("Payment successful!");
        onSuccess();
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 max-w-md w-full animate-in zoom-in-95 duration-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#1A142E] serif">Secure Payment</h3>
        <p className="text-sm text-gray-500 mt-1">Paying for Order: <span className="font-mono font-bold text-[#8B7BB4]">{orderNumber}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-xl border border-gray-100 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-[2] bg-[#8B7BB4] text-white py-4 px-6 rounded-xl font-bold text-sm shadow-xl shadow-purple-100 hover:shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
