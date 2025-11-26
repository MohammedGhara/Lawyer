import React from "react";
import Hero from "../components/Hero.jsx";
import Steps from "../components/Steps.jsx";
import Domains from "../components/Domains.jsx";

export default function Home({ onStartIntake }) {
  return (
    <>
      <Hero onStart={onStartIntake} />
      <Steps />
      <Domains />
    </>
  );
}
