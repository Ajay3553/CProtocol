import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-white text-gray-800">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About <span className="text-purple-600">CProtocol 🚀</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Communication Protocol is a secure, real-time messaging platform designed with privacy,
          scalability, and future encryption in mind.
        </p>
      </section>

      {/* WHAT WE DO */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-purple-800">
            What is CProtocol?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            CProtocol is a modern chat system inspired by platforms like Slack
            and Discord. It enables users to communicate in real-time using
            channel-based messaging, role-based access control, and smart
            features like message expiration (TTL).
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <ul className="space-y-3 text-gray-700">
            <li>⚡ Real-time messaging (Socket.IO)</li>
            <li>👥 Channel-based communication</li>
            <li>🔐 Secure authentication (JWT)</li>
            <li>⏱ Self-destruct messages (TTL)</li>
          </ul>
        </div>
      </section>

      {/* FEATURES (DETAILED VERSION YOU LIKED) */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-center mb-10 text-purple-900">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "⚡ Real-time Messaging",
              desc: "Instant message delivery using Socket.IO with zero delay.",
            },
            {
              title: "🔐 Secure Authentication",
              desc: "JWT-based authentication for safe and protected access.",
            },
            {
              title: "⏱ Self-Destruct Messages",
              desc: "Messages automatically disappear using TTL feature.",
            },
            {
              title: "👥 Channel System",
              desc: "Organize conversations with group & private channels.",
            },
            {
              title: "🟢 Online Presence",
              desc: "See who is online and active in real-time.",
            },
            {
              title: "🔮 Future Encryption",
              desc: "End-to-end encryption (AES + RSA).",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2 text-purple-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FUTURE VISION */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          🔐 Future: End-to-End Encryption
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We are building towards full end-to-end encryption using AES-256 and
          RSA/ECDH, ensuring your messages remain completely private — even from
          servers.
        </p>
      </section>

      {/* MISSION (FROM FIRST DESIGN) */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-purple-800 text-white rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Our Mission 🎯
          </h2>
          <p className="max-w-2xl mx-auto">
            To build a secure and scalable communication platform that gives
            users full control over their data while maintaining seamless
            real-time interaction.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2026 CProtocol All Rights Reserved
      </footer>

    </div>
  );
}

export default About;