import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

function ForgotPassword() {
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
      console.log("📤 Frontend form data:", data); // ✅ debug
    try {
      const res = await axios.post(
        "http://localhost:3000/user/forgot-password",
        {
        emailId: data.email, // ✅ FIX HERE
      }
      );
      console.log("✅ Backend response:", res.data); // ✅ debug
      setMessage(res.data.message);
    } catch {
      console.error("❌ Forgot password error:", err);
      setMessage("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-black">Forgot Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("email")}
            placeholder="Enter your email"
            className="w-full border px-3 py-2 rounded text-black"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="text-green-600 text-sm mt-4 text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
