import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useNavigate } from "react-router";

const schema = z.object({
  password: z.string().min(8, "Password too weak"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    await axios.post(
      `http://localhost:3000/user/reset-password/${token}`,
      { password: data.password }
    );
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-black">Reset Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            {...register("password")}
            placeholder="New password"
            className="w-full border px-3 py-2 rounded text-black"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm password"
            className="w-full border px-3 py-2 rounded text-black"
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
