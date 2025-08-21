export const getCredits = async (email: string) => {
  const response = await fetch("/api/getinfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  });
  const data = await response.json();
  return data.userCredits;
};