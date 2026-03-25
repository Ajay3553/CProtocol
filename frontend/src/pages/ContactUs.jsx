import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const WEBFORM_URL = import.meta.env.VITE_WEBFORM_API_URL
const WEBFORM_ACCESS_KEY = import.meta.env.VITE_WEBFORM_ACCESS_KEY

function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if(!WEBFORM_ACCESS_KEY || !WEBFORM_URL){
      toast.error("Something Went Wrong Might be Internal Issue")
    }
    try {
      const response = await fetch(WEBFORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEBFORM_ACCESS_KEY,
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          from_name: 'Blog Contact Form',
          to_email: 'ajaysingh.102007@gmail.com'
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success('Message sent successfully! We will get back to you soon.')
        reset()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send message. Please try again or contact us directly.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800">

      {/* HERO */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Contact <span className="text-purple-600">CProtocol</span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          Have questions, feedback, or ideas? We’d love to hear from you.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* FORM */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-center mb-6 text-purple-800">
            Send Us a Message
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">

              {/* NAME */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Your Name *
                </label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 1,
                      message: "Min 1 chars",
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Your Email *
                </label>
                <input
                  {...register("email", {
                    required: "Email required",
                    pattern: {
                      value:
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email",
                    },
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* SUBJECT */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Subject *
              </label>
              <input
                {...register("subject", {
                  required: "Subject required",
                  minLength: {
                    value: 1,
                    message: "Min 1 chars",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="How can we help?"
              />
            </div>

            {/* MESSAGE */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">
                Message *
              </label>
              <textarea
                rows="6"
                {...register("message", {
                  required: "Message required",
                  minLength: {
                    value: 1,
                    message: "Min 1 chars",
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Write your message..."
              />
            </div>

            {/* BUTTON */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow ${
                  isSubmitting && "opacity-50 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>

      </div>
      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2026 CProtocol All Rights Reserved
      </footer>
    </div>
  );
}

export default ContactUs;