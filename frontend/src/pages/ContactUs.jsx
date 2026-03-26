import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const WEBFORM_URL = import.meta.env.VITE_WEBFORM_API_URL;
const WEBFORM_ACCESS_KEY = import.meta.env.VITE_WEBFORM_ACCESS_KEY;

// Reusable animation helpers
const FadeInWhenVisible = ({ children, delay = 0, direction = "up", className = "" }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const StaggerContainer = ({ children, className = "", staggerDelay = 0.1 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: staggerDelay } },
    }}
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = "" }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    }}
  >
    {children}
  </motion.div>
);

// Input field animation variant
const inputVariants = {
  rest: { scale: 1, borderColor: "rgb(209, 213, 219)" },
  focus: {
    scale: 1.01,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (!WEBFORM_ACCESS_KEY || !WEBFORM_URL) {
      toast.error("Something Went Wrong Might be Internal Issue");
      return;
    }
    try {
      const response = await fetch(WEBFORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEBFORM_ACCESS_KEY,
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          from_name: "Blog Contact Form",
          to_email: "ajaysingh.102007@gmail.com",
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Message sent successfully! We will get back to you soon.");
        reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send message. Please try again or contact us directly.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800 overflow-x-hidden">

      {/* HERO */}
      <section className="text-center py-16 px-6">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Contact{" "}
          <motion.span
            className="text-purple-600 inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            CProtocol
          </motion.span>
        </motion.h1>

        <motion.p
          className="max-w-2xl mx-auto text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Have questions, feedback, or ideas? We'd love to hear from you.
        </motion.p>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* FORM CARD */}
        <FadeInWhenVisible>
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg"
            whileHover={{ boxShadow: "0 15px 40px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="text-2xl font-semibold text-center mb-6 text-purple-800"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Send Us a Message
            </motion.h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-2xl mx-auto"
            >
              <StaggerContainer
                className="grid md:grid-cols-2 gap-6 mb-6"
                staggerDelay={0.12}
              >
                {/* NAME */}
                <StaggerItem>
                  <div>
                    <motion.label
                      className="block mb-2 text-sm font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                    >
                      Your Name *
                    </motion.label>
                    <motion.div
                      variants={inputVariants}
                      initial="rest"
                      whileFocus="focus"
                      whileTap={{ scale: 0.995 }}
                    >
                      <input
                        {...register("name", {
                          required: "Name is required",
                          minLength: {
                            value: 1,
                            message: "Min 1 chars",
                          },
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="John Doe"
                      />
                    </motion.div>
                    {errors.name && (
                      <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </div>
                </StaggerItem>

                {/* EMAIL */}
                <StaggerItem>
                  <div>
                    <motion.label
                      className="block mb-2 text-sm font-medium"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 }}
                    >
                      Your Email *
                    </motion.label>
                    <motion.div
                      variants={inputVariants}
                      initial="rest"
                      whileFocus="focus"
                      whileTap={{ scale: 0.995 }}
                    >
                      <input
                        {...register("email", {
                          required: "Email required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email",
                          },
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="john@example.com"
                      />
                    </motion.div>
                    {errors.email && (
                      <motion.p
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>
                </StaggerItem>
              </StaggerContainer>

              {/* SUBJECT */}
              <FadeInWhenVisible delay={0.1}>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Subject *
                  </label>
                  <motion.div
                    variants={inputVariants}
                    initial="rest"
                    whileFocus="focus"
                    whileTap={{ scale: 0.995 }}
                  >
                    <input
                      {...register("subject", {
                        required: "Subject required",
                        minLength: {
                          value: 1,
                          message: "Min 1 chars",
                        },
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="How can we help?"
                    />
                  </motion.div>
                  {errors.subject && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.subject.message}
                    </motion.p>
                  )}
                </div>
              </FadeInWhenVisible>

              {/* MESSAGE */}
              <FadeInWhenVisible delay={0.15}>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Message *
                  </label>
                  <motion.div
                    variants={inputVariants}
                    initial="rest"
                    whileFocus="focus"
                    whileTap={{ scale: 0.995 }}
                  >
                    <textarea
                      rows="6"
                      {...register("message", {
                        required: "Message required",
                        minLength: {
                          value: 1,
                          message: "Min 1 chars",
                        },
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-200 resize-none ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Write your message..."
                    />
                  </motion.div>
                  {errors.message && (
                    <motion.p
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      {errors.message.message}
                    </motion.p>
                  )}
                </div>
              </FadeInWhenVisible>

              {/* BUTTON */}
              <FadeInWhenVisible delay={0.2}>
                <div className="text-center">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow ${
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    }`}
                    whileHover={
                      !isSubmitting
                        ? {
                            scale: 1.05,
                            boxShadow: "0 10px 30px rgba(147, 51, 234, 0.4)",
                          }
                        : {}
                    }
                    whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </motion.button>
                </div>
              </FadeInWhenVisible>
            </form>
          </motion.div>
        </FadeInWhenVisible>
      </div>

      {/* FOOTER */}
      <motion.footer
        className="text-center py-6 text-gray-500 text-sm border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        © 2026 CProtocol. All Rights Reserved.
      </motion.footer>
    </div>
  );
}

export default ContactUs;